from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.link import LinkCreate, LinkResponse
from app.services.click_service import get_link_analytics
from app.services.link_service import (
    create_short_link,
    delete_link,
    get_link_by_code,
    get_user_links,
)

from app.core.logger import api_logger

from app.services.cache_service import delete_cached_url

router = APIRouter(prefix="/links", tags=["Links"])


@router.post("/shorten", response_model=LinkResponse)
async def shorten_url(
    link_data: LinkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    api_logger.info(f"Short URL creation requested | user_id={user_id}")

    link = await create_short_link(
        db=db,
        link_data=link_data,
        owner_id=user_id,
    )

    api_logger.info(
        f"Short URL created | user_id={user_id} | short_code={link.short_code}"
    )

    return link


@router.get("", response_model=list[LinkResponse])
async def list_my_links(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    api_logger.info(f"List links requested | user_id={current_user.id}")

    links = await get_user_links(
        db=db,
        owner_id=current_user.id,
    )

    api_logger.info(f"Links retrieved | user_id={current_user.id} | count={len(links)}")

    return links


@router.delete("/{short_code}")
async def delete_my_link(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    api_logger.info(
        f"Delete link requested | user_id={user_id} | short_code={short_code}"
    )

    deleted = await delete_link(
        db=db,
        short_code=short_code,
        owner_id=user_id,
    )

    if not deleted:
        api_logger.warning(
            f"Delete link failed | user_id={user_id} | short_code={short_code}"
        )
        raise HTTPException(
            status_code=404,
            detail="Link not found",
        )

    await delete_cached_url(short_code)

    api_logger.info(
        f"Link deleted successfully | user_id={user_id} | short_code={short_code}"
    )

    return {"message": "Link deleted successfully"}


@router.get("/{short_code}/analytics")
async def get_my_link_analytics(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    api_logger.info(
        f"Analytics requested | user_id={current_user.id} | short_code={short_code}"
    )

    link = await get_link_by_code(db=db, short_code=short_code)

    if not link or link.owner_id != current_user.id:
        api_logger.warning(
            f"Analytics access failed | user_id={current_user.id} | short_code={short_code}"
        )
        raise HTTPException(
            status_code=404,
            detail="Link not found",
        )

    analytics = await get_link_analytics(db=db, link=link)

    api_logger.info(
        f"Analytics retrieved | user_id={current_user.id} | short_code={short_code}"
    )

    return analytics
