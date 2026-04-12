from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.recipe import DifficultyLevel, KosherType
from app.schemas.user import UserPublic


class Ingredient(BaseModel):
    amount: float
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
    ingredients: List[dict]
    instructions: List[dict]
    is_scanned: bool
    is_published: bool
    likes_count: int
    saves_count: int
    comments_count: int
    author: UserPublic
    created_at: datetime
    updated_at: Optional[datetime]

    # Fields injected per-user context (not stored in DB)
    is_liked: bool = False
    is_saved: bool = False

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
    likes_count: int
    saves_count: int
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


class ScanResponse(BaseModel):
    """Response from AI image scan."""
    title: str
    description: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[DifficultyLevel] = None
    kosher_type: Optional[KosherType] = None
    ingredients: List[Ingredient] = []
    instructions: List[Instruction] = []
