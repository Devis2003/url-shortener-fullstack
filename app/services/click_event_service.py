from app.core.redis import redis_client

CLICK_STREAM = "click_events"


async def publish_click_event(
    link_id: str,
    referrer: str | None,
    user_agent: str | None,
) -> None:
    await redis_client.xadd(
        CLICK_STREAM,
        {
            "link_id": link_id,
            "referrer": referrer or "",
            "user_agent": user_agent or "",
        },
    )
