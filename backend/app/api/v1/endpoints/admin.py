"""Numbers about the site, for whoever runs it.

Everything here is a count. There is nothing in this module that reads one
person's recipes, messages or address — the owner of a recipe site should be
able to see how it is doing without being handed everybody's contents.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.recipe import Recipe, StoredImage
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Only the addresses named in ADMIN_EMAILS.

    Kept in configuration rather than in the database so that granting it does
    not need a migration, and so that a stolen account cannot grant itself.
    """
    allowed = {
        e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()
    }
    if not allowed or (current_user.email or "").lower() not in allowed:
        # The same answer a stranger gets for a page that does not exist: no
        # need to advertise that there is an admin area at all.
        raise HTTPException(status_code=404, detail="Not found")
    return current_user


@router.get("/stats")
def site_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    day = now - timedelta(days=1)
    week = now - timedelta(days=7)
    month = now - timedelta(days=30)

    def users_since(since):
        return db.query(func.count(User.id)).filter(User.created_at >= since).scalar() or 0

    def seen_since(since):
        return (
            db.query(func.count(User.id)).filter(User.last_seen_at >= since).scalar() or 0
        )

    images, image_bytes = (
        db.query(
            func.count(StoredImage.id),
            func.coalesce(func.sum(StoredImage.byte_size), 0),
        ).one()
    )

    return {
        "users": {
            "total": db.query(func.count(User.id)).scalar() or 0,
            "new_today": users_since(day),
            "new_this_week": users_since(week),
            "new_this_month": users_since(month),
            # Sign-ins have only been recorded since this went live, so these
            # read as zero for everyone who has not signed in since.
            "seen_today": seen_since(day),
            "seen_this_week": seen_since(week),
            "seen_this_month": seen_since(month),
            "never_signed_in": db.query(func.count(User.id))
            .filter(User.last_seen_at.is_(None))
            .scalar()
            or 0,
        },
        "recipes": {
            "total": db.query(func.count(Recipe.id)).scalar() or 0,
            "published": db.query(func.count(Recipe.id))
            .filter(Recipe.is_published.is_(True))
            .scalar()
            or 0,
            "new_this_week": db.query(func.count(Recipe.id))
            .filter(Recipe.created_at >= week)
            .scalar()
            or 0,
        },
        "images": {
            "count": images or 0,
            "bytes": int(image_bytes or 0),
            "quota_bytes_per_user": settings.MAX_IMAGE_BYTES_PER_USER,
        },
    }
