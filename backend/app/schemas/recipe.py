from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.recipe import DifficultyLevel, KosherType
from app.schemas.user import UserPublic


class Ingredient(BaseModel):
    amount: Optional[float] = None
    unit: Optional[str] = None
    name: str


class Instruction(BaseModel):
    step: int
    text: str


class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: int = 4
    difficulty: DifficultyLevel = DifficultyLevel.medium
    kosher_type: Optional[KosherType] = None
    category: Optional[str] = None
    ingredients: List[Ingredient] = []
    instructions: List[Instruction] = []
    is_scanned: bool = False


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[DifficultyLevel] = None
    kosher_type: Optional[KosherType] = None
    category: Optional[str] = None
    ingredients: Optional[List[Ingredient]] = None
    instructions: Optional[List[Instruction]] = None
    is_published: Optional[bool] = None


class RecipeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    prep_time_minutes: Optional[int]
    cook_time_minutes: Optional[int]
    servings: int
    difficulty: DifficultyLevel
    kosher_type: Optional[KosherType]
    category: Optional[str]
    ingredients: List[dict]
    instructions: List[dict]
    is_scanned: bool
    is_published: bool
    likes_count: int
    saves_count: int
    comments_count: int
    average_rating: float = 0.0
    ratings_count: int = 0
    author: UserPublic
    created_at: datetime
    updated_at: Optional[datetime]

    is_liked: bool = False
    is_saved: bool = False
    user_rating: Optional[int] = None

    model_config = {"from_attributes": True}


class RecipeListItem(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    prep_time_minutes: Optional[int]
    cook_time_minutes: Optional[int]
    servings: int
    difficulty: DifficultyLevel
    kosher_type: Optional[KosherType]
    category: Optional[str] = None
    likes_count: int
    saves_count: int
    average_rating: float = 0.0
    ratings_count: int = 0
    author: UserPublic
    is_liked: bool = False
    is_saved: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    author: UserPublic
    is_reported: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanIngredient(BaseModel):
    amount: Optional[float] = None
    unit: Optional[str] = None
    name: str


class ScanResponse(BaseModel):
    title: str
    description: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[DifficultyLevel] = None
    kosher_type: Optional[KosherType] = None
    ingredients: List[ScanIngredient] = []
    instructions: List[Instruction] = []


# ---------- Ratings ----------

class RatingCreate(BaseModel):
    score: int  # 1-5


# ---------- Collections ----------

class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class CollectionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_public: bool
    recipes_count: int = 0
    cover_image: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CollectionDetail(CollectionResponse):
    recipes: List[RecipeListItem] = []


# ---------- Shopping List ----------

class ShoppingItemSchema(BaseModel):
    name: str
    amount: float = 0
    unit: Optional[str] = None
    checked: bool = False
    from_recipe: Optional[str] = None


class ShoppingListCreate(BaseModel):
    name: str = "רשימת קניות"


class ShoppingListResponse(BaseModel):
    id: int
    name: str
    items: List[dict] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AddRecipeToShoppingList(BaseModel):
    recipe_id: int
    servings_multiplier: float = 1.0


# ---------- AI Suggest ----------

class AISuggestRequest(BaseModel):
    ingredients: List[str]
