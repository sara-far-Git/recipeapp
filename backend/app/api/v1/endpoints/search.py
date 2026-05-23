from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.user import User, Follow
from app.models.recipe import Recipe, Like, SavedRecipe, DifficultyLevel, KosherType
from app.schemas.recipe import RecipeListItem

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[RecipeListItem])
def search_recipes(
    q: str = Query("", description="Free-text search on title and description"),
    difficulty: Optional[DifficultyLevel] = Query(None),
    kosher_type: Optional[KosherType] = Query(None),
    max_prep_time: Optional[int] = Query(None, ge=1, description="Max prep time in minutes"),
    category: Optional[str] = Query(None, description="Category filter"),
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
    if category:
        query = query.filter(Recipe.category == category)

    recipes = (
        query.options(joinedload(Recipe.author))
        .order_by(Recipe.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    if not recipes:
        return []

    author_ids = list({r.author_id for r in recipes})
    recipe_ids = [r.id for r in recipes]

    followers_ct = dict(
        db.query(Follow.followed_id, func.count(Follow.follower_id))
        .filter(Follow.followed_id.in_(author_ids))
        .group_by(Follow.followed_id).all()
    )
    following_ct = dict(
        db.query(Follow.follower_id, func.count(Follow.followed_id))
        .filter(Follow.follower_id.in_(author_ids))
        .group_by(Follow.follower_id).all()
    )
    recipes_ct = dict(
        db.query(Recipe.author_id, func.count(Recipe.id))
        .filter(Recipe.author_id.in_(author_ids))
        .group_by(Recipe.author_id).all()
    )

    liked_ids: set = set()
    saved_ids: set = set()
    if current_user:
        liked_ids = {
            row[0] for row in db.query(Like.recipe_id)
            .filter(Like.user_id == current_user.id, Like.recipe_id.in_(recipe_ids))
        }
        saved_ids = {
            row[0] for row in db.query(SavedRecipe.recipe_id)
            .filter(SavedRecipe.user_id == current_user.id, SavedRecipe.recipe_id.in_(recipe_ids))
        }

    for r in recipes:
        r.author.followers_count = followers_ct.get(r.author_id, 0)
        r.author.following_count = following_ct.get(r.author_id, 0)
        r.author.recipes_count = recipes_ct.get(r.author_id, 0)
        r.is_liked = r.id in liked_ids
        r.is_saved = r.id in saved_ids

    return recipes
