from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import Optional

from app.core.database import get_db
from app.core.plans import at_least_pro
from app.core.security import get_current_user, is_admin, get_optional_current_user
from app.models.user import User, Follow
from app.models.recipe import Recipe
from app.schemas.user import UserPublic, UserMe, UserUpdate
from app.schemas.recipe import RecipeListItem

router = APIRouter(prefix="/users", tags=["users"])


def _public_user(db, username):
    from app.core.attribution import hidden_account
    if username.startswith("community-") and username[10:].isdigit():
        user = db.query(User).filter(User.id == int(username[10:])).first()
        return user if user and hidden_account(user) else None
    return db.query(User).filter(User.username == username).first()


def _visible(user, viewer=None):
    return bool(user and (viewer and viewer.id == user.id or
                         user.is_active and at_least_pro(user) and user.public_profile))


def _enrich_user(user: User) -> User:
    user.followers_count = len(user.followers)
    user.following_count = len(user.following)
    user.recipes_count = sum(1 for r in user.recipes if r.is_published)
    user.is_admin = is_admin(user)
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
    if update_data.get("public_profile") and not at_least_pro(current_user):
        raise HTTPException(status_code=403, detail="פרופיל ציבורי זמין רק במסלול Pro")
    if "public_profile" in update_data and update_data["public_profile"] is None:
        update_data.pop("public_profile")
    for k, v in update_data.items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)
    _enrich_user(current_user)
    return current_user


def _iso(value):
    return value.isoformat() if value else None


@router.get("/me/export")
def export_my_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Everything kept about this account, as one JSON file.

    The privacy law gives a person the right to see what is held about them.
    Asking by email works too; this is the version that needs no one to answer.
    Photo bytes are left out — their addresses are listed, and each one opens.
    """
    from app.models.recipe import (
        Comment, Rating, Like, SavedRecipe, Collection, ShoppingList, StoredImage,
    )
    u = current_user
    recipes = db.query(Recipe).filter(Recipe.author_id == u.id).order_by(Recipe.id).all()
    images = db.query(StoredImage.id, StoredImage.content_type, StoredImage.byte_size,
                      StoredImage.created_at).filter(StoredImage.owner_id == u.id).all()
    return {
        "exported_at": _iso(datetime.now(timezone.utc)),
        "account": {
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "bio": u.bio,
            "avatar_url": u.avatar_url,
            "plan": u.plan,
            "public_profile": u.public_profile,
            "auth_provider": u.auth_provider,
            "created_at": _iso(u.created_at),
            "last_seen_at": _iso(u.last_seen_at),
            "terms_accepted_at": _iso(u.terms_accepted_at),
        },
        "recipes": [{
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "chef_name": r.chef_name,
            "image_url": r.image_url,
            "image_source": r.image_source,
            "image_credit": r.image_credit,
            "image_alt": r.image_alt,
            "ingredients": r.ingredients,
            "instructions": r.instructions,
            "tags": r.tags,
            "category": r.category,
            "servings": r.servings,
            "prep_time_minutes": r.prep_time_minutes,
            "cook_time_minutes": r.cook_time_minutes,
            "is_published": r.is_published,
            "created_at": _iso(r.created_at),
        } for r in recipes],
        "comments": [{"recipe_id": c.recipe_id, "content": c.content, "created_at": _iso(c.created_at)}
                     for c in db.query(Comment).filter(Comment.author_id == u.id)],
        "ratings": [{"recipe_id": r.recipe_id, "score": r.score, "created_at": _iso(r.created_at)}
                    for r in db.query(Rating).filter(Rating.user_id == u.id)],
        "likes": [x.recipe_id for x in db.query(Like).filter(Like.user_id == u.id)],
        "saved": [x.recipe_id for x in db.query(SavedRecipe).filter(SavedRecipe.user_id == u.id)],
        "collections": [{
            "name": c.name,
            "description": c.description,
            "is_public": c.is_public,
            "recipe_ids": [i.recipe_id for i in c.items],
        } for c in db.query(Collection).filter(Collection.user_id == u.id)],
        "shopping_lists": [{"name": s.name, "items": s.items, "created_at": _iso(s.created_at)}
                           for s in db.query(ShoppingList).filter(ShoppingList.user_id == u.id)],
        "following": [f.username for f in u.following],
        "followers": [f.username for f in u.followers],
        "images": [{"url": f"/api/v1/images/{i.id}", "content_type": i.content_type,
                    "byte_size": i.byte_size, "created_at": _iso(i.created_at)} for i in images],
    }


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the account and everything it made. There is no undo.

    The ORM cascades take the recipes, comments, ratings, likes, saves,
    collections and shopping lists. What it does not reach is done here by
    hand: follows, uploaded photos, other people's collections that held one
    of these recipes, and the counters on recipes this account liked or rated.
    """
    from app.models.recipe import (
        Comment, Rating, Like, SavedRecipe, CollectionItem, StoredImage,
    )
    uid = current_user.id
    own = [r for (r,) in db.query(Recipe.id).filter(Recipe.author_id == uid)]
    touched = {r for (r,) in db.query(Like.recipe_id).filter(Like.user_id == uid)}
    touched |= {r for (r,) in db.query(SavedRecipe.recipe_id).filter(SavedRecipe.user_id == uid)}
    touched |= {r for (r,) in db.query(Comment.recipe_id).filter(Comment.author_id == uid)}
    touched |= {r for (r,) in db.query(Rating.recipe_id).filter(Rating.user_id == uid)}
    touched -= set(own)

    if own:
        db.query(CollectionItem).filter(CollectionItem.recipe_id.in_(own)).delete(synchronize_session=False)
    db.query(Follow).filter((Follow.follower_id == uid) | (Follow.followed_id == uid)).delete(synchronize_session=False)
    db.query(StoredImage).filter(StoredImage.owner_id == uid).delete(synchronize_session=False)
    db.delete(current_user)
    db.flush()

    for recipe in db.query(Recipe).filter(Recipe.id.in_(touched)) if touched else []:
        rid = recipe.id
        recipe.likes_count = db.query(Like).filter(Like.recipe_id == rid).count()
        recipe.saves_count = db.query(SavedRecipe).filter(SavedRecipe.recipe_id == rid).count()
        recipe.comments_count = db.query(Comment).filter(Comment.recipe_id == rid).count()
        scores = [s for (s,) in db.query(Rating.score).filter(Rating.recipe_id == rid)]
        recipe.ratings_count = len(scores)
        recipe.ratings_sum = sum(scores)
    db.commit()


@router.get("/{username}", response_model=UserPublic)
def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user = _public_user(db, username)
    if not _visible(user, current_user):
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
    user = _public_user(db, username)
    if not _visible(user, current_user):
        raise HTTPException(status_code=404, detail="User not found")

    q = db.query(Recipe).filter(Recipe.author_id == user.id)
    if not current_user or current_user.id != user.id:
        q = q.filter(Recipe.is_published == True)
    recipes = (
        q.options(joinedload(Recipe.author))
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
    target = _public_user(db, username)
    if not _visible(target, current_user):
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
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user = _public_user(db, username)
    if not _visible(user, current_user):
        raise HTTPException(status_code=404, detail="User not found")
    visible = [f for f in user.followers if _visible(f, current_user)]
    for f in visible:
        _enrich_user(f)
    return visible


@router.get("/{username}/following", response_model=list[UserPublic])
def get_following(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user = _public_user(db, username)
    if not _visible(user, current_user):
        raise HTTPException(status_code=404, detail="User not found")
    visible = [f for f in user.following if _visible(f, current_user)]
    for f in visible:
        _enrich_user(f)
    return visible
