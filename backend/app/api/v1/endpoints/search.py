from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.user import User
from app.models.recipe import Recipe, DifficultyLevel, KosherType
from app.schemas.recipe import RecipeListItem

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[RecipeListItem])
def search_recipes(
    q: str = Query("", description="Free-text search on title and description"),
    difficulty: Optional[DifficultyLevel] = Query(None),
    kosher_type: Optional[KosherType] = Query(None),
    max_prep_time: Optional[int] = Query(None, ge=1, description="Max prep time in minutes"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    query = db.query(Recipe).filter(Recipe.is_published == True)

    if q:
        pattern = f"%{q}%"
        query = query.filter(
            (Recipe.title.ilike(pattern)) | (Recipe.description.ilike(pattern))
        )

    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    if kosher_type:
        query = query.filter(Recipe.kosher_type == kosher_type)
    if max_prep_time:
        query = query.filter(Recipe.prep_time_minutes <= max_prep_time)

    recipes = (
        query.options(joinedload(Recipe.author))
        .order_by(Recipe.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    liked_ids = set()
    saved_ids = set()
    if current_user:
        liked_ids = {l.recipe_id for l in current_user.likes}
        saved_ids = {s.recipe_id for s in current_user.saved_recipes}

    for r in recipes:
        r.author.followers_count = len(r.author.followers)
        r.author.following_count = len(r.author.following)
        r.author.recipes_count = len(r.author.recipes)
        r.is_liked = r.id in liked_ids
        r.is_saved = r.id in saved_ids

    return recipes
