from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import api_logger
from app.models.link import Link
from app.schemas.link import LinkCreate
from app.utils.short_code import generate_short_code


async def create_short_link(
    db: AsyncSession,
    link_data: LinkCreate,
    owner_id: int,
) -> Link:
    api_logger.info(
        f"Creating short URL | user_id={owner_id} | original_url={link_data.original_url}"
    )

    while True:
        short_code = generate_short_code()

        result = await db.execute(select(Link).where(Link.short_code == short_code))
        existing_link = result.scalar_one_or_none()

        if existing_link is None:
            break

    link = Link(
        original_url=str(link_data.original_url),
        short_code=short_code,
        owner_id=owner_id,
    )

    db.add(link)
    await db.commit()
    await db.refresh(link)

    api_logger.info(f"Short URL created | user_id={owner_id} | short_code={short_code}")

    return link


async def get_user_links(db: AsyncSession, owner_id: int) -> list[Link]:
    api_logger.info(f"Fetching links | user_id={owner_id}")

    result = await db.execute(select(Link).where(Link.owner_id == owner_id))
    links = list(result.scalars().all())

    api_logger.info(f"Links fetched | user_id={owner_id} | count={len(links)}")

    return links


async def get_link_by_code(db: AsyncSession, short_code: str) -> Link | None:
    result = await db.execute(select(Link).where(Link.short_code == short_code))
    link = result.scalar_one_or_none()

    if link:
        api_logger.info(f"Link found | short_code={short_code}")
    else:
        api_logger.warning(f"Link not found | short_code={short_code}")

    return link


async def delete_link(
    db: AsyncSession,
    short_code: str,
    owner_id: int,
) -> bool:
    api_logger.info(f"Deleting link | user_id={owner_id} | short_code={short_code}")

    result = await db.execute(
        select(Link).where(
            Link.short_code == short_code,
            Link.owner_id == owner_id,
        )
    )

    link = result.scalar_one_or_none()

    if not link:
        api_logger.warning(
            f"Delete failed | user_id={owner_id} | short_code={short_code}"
        )
        return False

    await db.delete(link)
    await db.commit()

    api_logger.info(f"Link deleted | user_id={owner_id} | short_code={short_code}")

    return True
