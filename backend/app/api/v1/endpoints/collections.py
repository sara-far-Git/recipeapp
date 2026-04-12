from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.recipe import Collection, CollectionItem, Recipe
from app.schemas.recipe import (
    CollectionCreate, CollectionUpdate, CollectionResponse, CollectionDetail, RecipeListItem,
)
from typing import Optional

router = APIRouter(prefix="/collections", tags=["collections"])


def _enrich_author(user: User) -> User:
    user.followers_count = len(user.followers)
    user.following_count = len(user.following)
    user.recipes_count = len(user.recipes)
    return user


def _collection_response(col: Collection) -> dict:
    cover = None
    if col.items:
        for item in col.items:
            if item.recipe and item.recipe.image_url:
                cover = item.recipe.image_url
                break
    return {
        **{c.key: getattr(col, c.key) for c in col.__table__.columns},
        "recipes_count": len(col.items),
        "cover_image": cover,
    }


@router.get("", response_model=list[CollectionResponse])
def list_my_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cols = (
        db.query(Collection)
        .filter(Collection.user_id == current_user.id)
        .options(joinedload(Collection.items).joinedload(CollectionItem.recipe))
        .order_by(Collection.created_at.desc())
        .all()
    )
    return [_collection_response(c) for c in cols]


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(
    data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = Collection(user_id=current_user.id, name=data.name, description=data.description, is_public=data.is_public)
    db.add(col)
    db.commit()
    db.refresh(col)
    return {**{c.key: getattr(col, c.key) for c in col.__table__.columns}, "recipes_count": 0, "cover_image": None}


@router.get("/{collection_id}", response_model=CollectionDetail)
def get_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    col = (
        db.query(Collection)
        .filter(Collection.id == collection_id)
        .options(joinedload(Collection.items).joinedload(CollectionItem.recipe).joinedload(Recipe.author))
        .first()
    )
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    if not col.is_public and (not current_user or col.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Private collection")

    liked_ids = set()
    saved_ids = set()
    if current_user:
        liked_ids = {l.recipe_id for l in current_user.likes}
        saved_ids = {s.recipe_id for s in current_user.saved_recipes}

    recipes = []
    cover = None
    for item in col.items:
        r = item.recipe
        if r and r.is_published:
            _enrich_author(r.author)
            r.is_liked = r.id in liked_ids
            r.is_saved = r.id in saved_ids
            recipes.append(r)
            if not cover and r.image_url:
                cover = r.image_url

    return {
        **{c.key: getattr(col, c.key) for c in col.__table__.columns},
        "recipes_count": len(recipes),
        "cover_image": cover,
        "recipes": recipes,
    }


@router.put("/{collection_id}", response_model=CollectionResponse)
def update_collection(
    collection_id: int,
    data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col or col.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Collection not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(col, k, v)
    db.commit()
    db.refresh(col)
    return _collection_response(col)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col or col.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Collection not found")
    db.delete(col)
    db.commit()


@router.post("/{collection_id}/recipes/{recipe_id}", status_code=status.HTTP_200_OK)
def toggle_recipe_in_collection(
    collection_id: int,
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col or col.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Collection not found")

    existing = (
        db.query(CollectionItem)
        .filter(CollectionItem.collection_id == collection_id, CollectionItem.recipe_id == recipe_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"added": False}
    else:
        db.add(CollectionItem(collection_id=collection_id, recipe_id=recipe_id))
        db.commit()
        return {"added": True}
