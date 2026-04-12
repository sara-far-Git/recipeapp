from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User, Follow
from app.models.recipe import Recipe
from app.schemas.user import UserPublic, UserMe, UserUpdate
from app.schemas.recipe import RecipeListItem

router = APIRouter(prefix="/users", tags=["users"])


def _enrich_user(user: User) -> User:
    user.followers_count = len(user.followers)
    user.following_count = len(user.following)
    user.recipes_count = len(user.recipes)
    return user


@router.get("/me", response_model=UserMe)
def get_my_profile(current_user: User = Depends(get_current_user)):
    _enrich_user(current_user)
    return current_user


@router.put("/me", response_model=UserMe)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)
    _enrich_user(current_user)
    return current_user


@router.get("/{username}", response_model=UserPublic)
def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    _enrich_user(user)
    return user


@router.get("/{username}/recipes", response_model=list[RecipeListItem])
def get_user_recipes(
    username: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    recipes = (
        db.query(Recipe)
        .filter(Recipe.author_id == user.id, Recipe.is_published == True)
        .options(joinedload(Recipe.author))
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
        _enrich_user(r.author)
        r.is_liked = r.id in liked_ids
        r.is_saved = r.id in saved_ids
    return recipes


@router.get("/{username}/saved", response_model=list[RecipeListItem])
def get_user_saved_recipes(
    username: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Can only view your own saved recipes")

    from app.models.recipe import SavedRecipe
    saved = (
        db.query(Recipe)
        .join(SavedRecipe, SavedRecipe.recipe_id == Recipe.id)
        .filter(SavedRecipe.user_id == current_user.id)
        .options(joinedload(Recipe.author))
        .order_by(SavedRecipe.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    liked_ids = {l.recipe_id for l in current_user.likes}
    for r in saved:
        _enrich_user(r.author)
        r.is_liked = r.id in liked_ids
        r.is_saved = True
    return saved


# ---------- Follow / Unfollow ----------

@router.post("/{username}/follow", status_code=status.HTTP_200_OK)
def toggle_follow(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    existing = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.followed_id == target.id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"following": False}
    else:
        db.add(Follow(follower_id=current_user.id, followed_id=target.id))
        db.commit()
        return {"following": True}


@router.get("/{username}/followers", response_model=list[UserPublic])
def get_followers(
    username: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for f in user.followers:
        _enrich_user(f)
    return user.followers


@router.get("/{username}/following", response_model=list[UserPublic])
def get_following(
    username: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for f in user.following:
        _enrich_user(f)
    return user.following
