from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.click_event_service import publish_click_event
from app.services.link_service import get_link_by_code

from app.services.cache_service import get_cached_url, set_cached_url

from app.core.logger import api_logger

router = APIRouter(tags=["Redirect"])


@router.get("/{short_code}")
async def redirect_to_original_url(
    short_code: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    api_logger.info(f"Redirect requested | short_code={short_code}")

    cached_url = await get_cached_url(short_code)

    if cached_url:
        api_logger.info(f"Cache hit | short_code={short_code}")
    else:
        api_logger.info(f"Cache miss | short_code={short_code}")

    link = await get_link_by_code(db=db, short_code=short_code)

    if not link:
        api_logger.warning(f"Short URL not found | short_code={short_code}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found",
        )

    original_url = cached_url or link.original_url

    if not cached_url:
        await set_cached_url(short_code, original_url)

    await publish_click_event(
        link_id=str(link.id),
        referrer=request.headers.get("referer"),
        user_agent=request.headers.get("user-agent"),
    )

    api_logger.info(
        f"Click event published | short_code={short_code} | link_id={link.id}"
    )

    api_logger.info(f"Redirect successful | short_code={short_code}")

    return RedirectResponse(url=original_url)
