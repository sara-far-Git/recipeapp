from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User, Follow
from app.models.recipe import Recipe, Like, SavedRecipe, Comment, Rating, DifficultyLevel, KosherType
from app.schemas.recipe import (
    RecipeCreate, RecipeUpdate, RecipeResponse, RecipeListItem,
    CommentCreate, CommentResponse, RatingCreate,
)

router = APIRouter(prefix="/recipes", tags=["recipes"])


def _batch_author_stats(db: Session, author_ids: list) -> tuple:
    """Return (followers_ct, following_ct, recipes_ct) dicts in 3 queries instead of N*3."""
    if not author_ids:
        return {}, {}, {}
    followers_ct = dict(
        db.query(Follow.followed_id, func.count(Follow.follower_id))
        .filter(Follow.followed_id.in_(author_ids))
        .group_by(Follow.followed_id)
        .all()
    )
    following_ct = dict(
        db.query(Follow.follower_id, func.count(Follow.followed_id))
        .filter(Follow.follower_id.in_(author_ids))
        .group_by(Follow.follower_id)
        .all()
    )
    recipes_ct = dict(
        db.query(Recipe.author_id, func.count(Recipe.id))
        .filter(Recipe.author_id.in_(author_ids))
        .group_by(Recipe.author_id)
        .all()
    )
    return followers_ct, following_ct, recipes_ct


def _batch_flags(db: Session, recipe_ids: list, user_id: Optional[int]) -> tuple:
    """Return (liked_ids, saved_ids) sets scoped to the given recipe IDs only."""
    if not user_id or not recipe_ids:
        return set(), set()
    liked = {
        row[0] for row in db.query(Like.recipe_id)
        .filter(Like.user_id == user_id, Like.recipe_id.in_(recipe_ids))
    }
    saved = {
        row[0] for row in db.query(SavedRecipe.recipe_id)
        .filter(SavedRecipe.user_id == user_id, SavedRecipe.recipe_id.in_(recipe_ids))
    }
    return liked, saved


def _enrich_author(user: User) -> User:
    user.followers_count = len(user.followers)
    user.following_count = len(user.following)
    user.recipes_count = len(user.recipes)
    return user


def _recipe_flags(recipe: Recipe, current_user: Optional[User]) -> dict:
    if current_user is None:
        return {"is_liked": False, "is_saved": False, "user_rating": None}
    liked_ids = {l.recipe_id for l in current_user.likes}
    saved_ids = {s.recipe_id for s in current_user.saved_recipes}
    rating_map = {r.recipe_id: r.score for r in current_user.ratings}
    return {
        "is_liked": recipe.id in liked_ids,
        "is_saved": recipe.id in saved_ids,
        "user_rating": rating_map.get(recipe.id),
    }


# ---------- Feed / list ----------

@router.get("", response_model=list[RecipeListItem])
def list_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    recipes = (
        db.query(Recipe)
        .filter(Recipe.is_published == True)
        .options(joinedload(Recipe.author))
        .order_by(Recipe.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    if not recipes:
        return []

    author_ids = list({r.author_id for r in recipes})
    recipe_ids = [r.id for r in recipes]
    followers_ct, following_ct, recipes_ct = _batch_author_stats(db, author_ids)
    liked_ids, saved_ids = _batch_flags(db, recipe_ids, current_user.id if current_user else None)

    for r in recipes:
        r.author.followers_count = followers_ct.get(r.author_id, 0)
        r.author.following_count = following_ct.get(r.author_id, 0)
        r.author.recipes_count = recipes_ct.get(r.author_id, 0)
        r.is_liked = r.id in liked_ids
        r.is_saved = r.id in saved_ids
    return recipes


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    recipe = (
        db.query(Recipe)
        .options(joinedload(Recipe.author))
        .filter(Recipe.id == recipe_id)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    _enrich_author(recipe.author)
    flags = _recipe_flags(recipe, current_user)
    recipe.is_liked = flags["is_liked"]
    recipe.is_saved = flags["is_saved"]
    recipe.user_rating = flags.get("user_rating")
    return recipe


# ---------- CRUD ----------

@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(
    data: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ALLOWED_PUBLISHERS = {"שרי פרקש", "רבקי פרקש"}
    is_published = current_user.full_name in ALLOWED_PUBLISHERS

    recipe = Recipe(
        author_id=current_user.id,
        title=data.title,
        description=data.description,
        image_url=data.image_url,
        prep_time_minutes=data.prep_time_minutes,
        cook_time_minutes=data.cook_time_minutes,
        servings=data.servings,
        difficulty=data.difficulty,
        kosher_type=data.kosher_type,
        category=data.category,
        ingredients=[ing.model_dump() for ing in data.ingredients],
        instructions=[inst.model_dump() for inst in data.instructions],
        is_scanned=data.is_scanned,
        is_published=is_published,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    _enrich_author(current_user)
    recipe.author = current_user
    recipe.is_liked = False
    recipe.is_saved = False
    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    data: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recipe")

    update_data = data.model_dump(exclude_unset=True)
    if "ingredients" in update_data and update_data["ingredients"] is not None:
        update_data["ingredients"] = [ing.model_dump() if hasattr(ing, "model_dump") else ing for ing in update_data["ingredients"]]
    if "instructions" in update_data and update_data["instructions"] is not None:
        update_data["instructions"] = [inst.model_dump() if hasattr(inst, "model_dump") else inst for inst in update_data["instructions"]]

    for k, v in update_data.items():
        setattr(recipe, k, v)
    db.commit()
    db.refresh(recipe)
    _enrich_author(recipe.author)
    flags = _recipe_flags(recipe, current_user)
    recipe.is_liked = flags["is_liked"]
    recipe.is_saved = flags["is_saved"]
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your recipe")
    db.delete(recipe)
    db.commit()


# ---------- Likes ----------

@router.post("/{recipe_id}/like", status_code=status.HTTP_200_OK)
def toggle_like(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing = (
        db.query(Like)
        .filter(Like.user_id == current_user.id, Like.recipe_id == recipe_id)
        .first()
    )
    if existing:
        db.delete(existing)
        recipe.likes_count = max(0, recipe.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": recipe.likes_count}
    else:
        db.add(Like(user_id=current_user.id, recipe_id=recipe_id))
        recipe.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": recipe.likes_count}


# ---------- Saves ----------

@router.post("/{recipe_id}/save", status_code=status.HTTP_200_OK)
def toggle_save(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing = (
        db.query(SavedRecipe)
        .filter(SavedRecipe.user_id == current_user.id, SavedRecipe.recipe_id == recipe_id)
        .first()
    )
    if existing:
        db.delete(existing)
        recipe.saves_count = max(0, recipe.saves_count - 1)
        db.commit()
        return {"saved": False, "saves_count": recipe.saves_count}
    else:
        db.add(SavedRecipe(user_id=current_user.id, recipe_id=recipe_id))
        recipe.saves_count += 1
        db.commit()
        return {"saved": True, "saves_count": recipe.saves_count}


# ---------- Comments ----------

@router.get("/{recipe_id}/comments", response_model=list[CommentResponse])
def list_comments(
    recipe_id: int,
    db: Session = Depends(get_db),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    comments = (
        db.query(Comment)
        .filter(Comment.recipe_id == recipe_id)
        .options(joinedload(Comment.author))
        .order_by(Comment.created_at.desc())
        .all()
    )
    for c in comments:
        _enrich_author(c.author)
    return comments


@router.post("/{recipe_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    recipe_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    comment = Comment(
        recipe_id=recipe_id,
        author_id=current_user.id,
        content=data.content,
    )
    db.add(comment)
    recipe.comments_count += 1
    db.commit()
    db.refresh(comment)
    _enrich_author(current_user)
    comment.author = current_user
    return comment


@router.post("/{recipe_id}/comments/{comment_id}/report", status_code=status.HTTP_200_OK)
def report_comment(
    recipe_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id, Comment.recipe_id == recipe_id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.is_reported = True
    db.commit()
    return {"reported": True}


# ---------- Ratings ----------

@router.post("/{recipe_id}/rate", status_code=status.HTTP_200_OK)
def rate_recipe(
    recipe_id: int,
    data: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.score < 1 or data.score > 5:
        raise HTTPException(status_code=400, detail="Score must be 1-5")

    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing = (
        db.query(Rating)
        .filter(Rating.user_id == current_user.id, Rating.recipe_id == recipe_id)
        .first()
    )
    if existing:
        recipe.ratings_sum += data.score - existing.score
        existing.score = data.score
    else:
        db.add(Rating(user_id=current_user.id, recipe_id=recipe_id, score=data.score))
        recipe.ratings_sum += data.score
        recipe.ratings_count += 1

    db.commit()
    return {
        "score": data.score,
        "average_rating": recipe.average_rating,
        "ratings_count": recipe.ratings_count,
    }
