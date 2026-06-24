from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import api_logger
from app.models.click import Click
from app.models.link import Link


async def record_click(
    db: AsyncSession,
    link: Link,
    referrer: str | None,
    user_agent: str | None,
) -> None:
    api_logger.info(
        f"Recording click | link_id={link.id} | short_code={link.short_code}"
    )

    click = Click(
        link_id=link.id,
        referrer=referrer,
        user_agent=user_agent,
    )

    link.click_count += 1

    db.add(click)
    await db.commit()

    api_logger.info(
        f"Click recorded | link_id={link.id} | short_code={link.short_code} | click_count={link.click_count}"
    )


async def get_link_analytics(
    db: AsyncSession,
    link: Link,
) -> dict:
    api_logger.info(
        f"Generating analytics | link_id={link.id} | short_code={link.short_code}"
    )

    total_clicks_result = await db.execute(
        select(func.count(Click.id)).where(Click.link_id == link.id)
    )
    total_clicks = total_clicks_result.scalar_one()

    top_referrers_result = await db.execute(
        select(Click.referrer, func.count(Click.id))
        .where(Click.link_id == link.id)
        .group_by(Click.referrer)
        .order_by(func.count(Click.id).desc())
    )

    top_user_agents_result = await db.execute(
        select(Click.user_agent, func.count(Click.id))
        .where(Click.link_id == link.id)
        .group_by(Click.user_agent)
        .order_by(func.count(Click.id).desc())
    )

    analytics = {
        "short_code": link.short_code,
        "original_url": link.original_url,
        "total_clicks": total_clicks,
        "top_referrers": [
            {"referrer": referrer or "direct", "clicks": count}
            for referrer, count in top_referrers_result.all()
        ],
        "top_user_agents": [
            {"user_agent": user_agent or "unknown", "clicks": count}
            for user_agent, count in top_user_agents_result.all()
        ],
    }

    api_logger.info(
        f"Analytics generated | link_id={link.id} | short_code={link.short_code} | total_clicks={total_clicks}"
    )

    return analytics
