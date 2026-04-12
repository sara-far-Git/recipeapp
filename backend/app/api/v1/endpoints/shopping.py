from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.recipe import ShoppingList, Recipe
from app.schemas.recipe import ShoppingListCreate, ShoppingListResponse, AddRecipeToShoppingList

router = APIRouter(prefix="/shopping", tags=["shopping"])


def _merge_item(items: list, new_item: dict) -> list:
    """Merge a new ingredient into an existing list, combining quantities when possible."""
    name_lower = new_item["name"].strip().lower()
    for existing in items:
        if existing["name"].strip().lower() == name_lower and existing.get("unit") == new_item.get("unit"):
            existing["amount"] = existing.get("amount", 0) + new_item.get("amount", 0)
            if new_item.get("from_recipe") and new_item["from_recipe"] not in existing.get("from_recipe", ""):
                existing["from_recipe"] = (existing.get("from_recipe", "") + ", " + new_item["from_recipe"]).strip(", ")
            return items
    items.append(new_item)
    return items


@router.get("", response_model=list[ShoppingListResponse])
def list_shopping_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ShoppingList)
        .filter(ShoppingList.user_id == current_user.id)
        .order_by(ShoppingList.created_at.desc())
        .all()
    )


@router.post("", response_model=ShoppingListResponse, status_code=status.HTTP_201_CREATED)
def create_shopping_list(
    data: ShoppingListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sl = ShoppingList(user_id=current_user.id, name=data.name, items=[])
    db.add(sl)
    db.commit()
    db.refresh(sl)
    return sl


@router.get("/{list_id}", response_model=ShoppingListResponse)
def get_shopping_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sl = db.query(ShoppingList).filter(ShoppingList.id == list_id, ShoppingList.user_id == current_user.id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="List not found")
    return sl


@router.post("/{list_id}/add-recipe", response_model=ShoppingListResponse)
def add_recipe_to_shopping_list(
    list_id: int,
    data: AddRecipeToShoppingList,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sl = db.query(ShoppingList).filter(ShoppingList.id == list_id, ShoppingList.user_id == current_user.id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="List not found")

    recipe = db.query(Recipe).filter(Recipe.id == data.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    items = list(sl.items) if sl.items else []

    for ing in (recipe.ingredients or []):
        new_item = {
            "name": ing.get("name", ""),
            "amount": round(ing.get("amount", 0) * data.servings_multiplier, 2),
            "unit": ing.get("unit"),
            "checked": False,
            "from_recipe": recipe.title,
        }
        items = _merge_item(items, new_item)

    sl.items = items
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(sl, "items")
    db.commit()
    db.refresh(sl)
    return sl


@router.put("/{list_id}/items", response_model=ShoppingListResponse)
def update_shopping_items(
    list_id: int,
    items: list[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full replace of items list (used for checking/unchecking, reordering, removing)."""
    sl = db.query(ShoppingList).filter(ShoppingList.id == list_id, ShoppingList.user_id == current_user.id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="List not found")
    sl.items = items
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(sl, "items")
    db.commit()
    db.refresh(sl)
    return sl


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shopping_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sl = db.query(ShoppingList).filter(ShoppingList.id == list_id, ShoppingList.user_id == current_user.id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="List not found")
    db.delete(sl)
    db.commit()
