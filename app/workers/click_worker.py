import asyncio
import uuid

from redis.exceptions import ResponseError, TimeoutError
from sqlalchemy import select

from app.core.logger import worker_logger
from app.core.redis import redis_client
from app.db.session import AsyncSessionLocal
from app.models.click import Click
from app.models.link import Link
from app.services.click_event_service import CLICK_STREAM

GROUP_NAME = "click_workers"
CONSUMER_NAME = "worker-1"


async def ensure_group_exists() -> None:
    try:
        await redis_client.xgroup_create(
            CLICK_STREAM,
            GROUP_NAME,
            id="0",
            mkstream=True,
        )
        worker_logger.info(
            f"Redis consumer group created | stream={CLICK_STREAM} | group={GROUP_NAME}"
        )
    except ResponseError:
        worker_logger.info(
            f"Redis consumer group already exists | stream={CLICK_STREAM} | group={GROUP_NAME}"
        )


async def process_click_event(event_data: dict[str, str]) -> None:
    link_id = uuid.UUID(event_data["link_id"])

    worker_logger.info(f"Processing click event | link_id={link_id}")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Link).where(Link.id == link_id))
        link = result.scalar_one_or_none()

        if not link:
            worker_logger.warning(
                f"Click event skipped - link not found | link_id={link_id}"
            )
            return

        click = Click(
            link_id=link.id,
            referrer=event_data.get("referrer") or None,
            user_agent=event_data.get("user_agent") or None,
        )

        link.click_count += 1
        new_click_count = link.click_count

        db.add(click)
        await db.commit()

        worker_logger.info(
        f"Click event stored | link_id={link_id} | click_count={new_click_count}"
        )


async def run_worker() -> None:
    await ensure_group_exists()

    worker_logger.info(
        f"Click worker started | stream={CLICK_STREAM} | group={GROUP_NAME} | consumer={CONSUMER_NAME}"
    )

    while True:
        try:
            response = await redis_client.xreadgroup(
                GROUP_NAME,
                CONSUMER_NAME,
                {CLICK_STREAM: ">"},
                count=10,
                block=5000,
            )
        except TimeoutError:
            continue
        except Exception:
            worker_logger.exception("Click worker failed while reading Redis stream")
            continue

        for _, events in response:
            for event_id, event_data in events:
                try:
                    await process_click_event(event_data)
                    await redis_client.xack(CLICK_STREAM, GROUP_NAME, event_id)

                    worker_logger.info(
                        f"Click event acknowledged | event_id={event_id}"
                    )
                except Exception:
                    worker_logger.exception(
                        f"Click event processing failed | event_id={event_id}"
                    )


if __name__ == "__main__":
    asyncio.run(run_worker())
