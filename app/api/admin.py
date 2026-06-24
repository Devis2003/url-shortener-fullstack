from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.click import Click
from app.models.link import Link
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    total_users = await db.scalar(select(func.count(User.id)))
    total_links = await db.scalar(select(func.count(Link.id)))
    total_clicks = await db.scalar(select(func.count(Click.id)))

    return {
        "total_users": total_users,
        "total_links": total_links,
        "total_clicks": total_clicks,
    }
