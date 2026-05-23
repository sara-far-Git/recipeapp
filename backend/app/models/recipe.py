from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    Float, ForeignKey, Enum as SAEnum, JSON, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class KosherType(str, enum.Enum):
    meat = "meat"
    dairy = "dairy"
    pareve = "pareve"
    non_kosher = "non_kosher"


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Step 1 - Metadata
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    prep_time_minutes = Column(Integer, nullable=True)
    cook_time_minutes = Column(Integer, nullable=True)
    servings = Column(Integer, default=4)
    difficulty = Column(SAEnum(DifficultyLevel), default=DifficultyLevel.medium, index=True)
    kosher_type = Column(SAEnum(KosherType), nullable=True, index=True)
    category = Column(String(50), nullable=True, index=True)

    # Step 2 - Ingredients (stored as JSON array)
    # Format: [{"amount": 2, "unit": "cups", "name": "flour"}, ...]
    ingredients = Column(JSON, default=list)

    # Step 3 - Instructions (stored as JSON array)
    # Format: [{"step": 1, "text": "..."}, ...]
    instructions = Column(JSON, default=list)

    # AI Scan tracking
    is_scanned = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True, index=True)

    # Stats (denormalized for performance)
    likes_count = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    ratings_sum = Column(Integer, default=0)
    ratings_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="recipes")
    likes = relationship("Like", back_populates="recipe", cascade="all, delete-orphan")
    saved_by = relationship("SavedRecipe", back_populates="recipe", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="recipe", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="recipe", cascade="all, delete-orphan")

    @property
    def average_rating(self) -> float:
        if self.ratings_count == 0:
            return 0.0
        return round(self.ratings_sum / self.ratings_count, 1)


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (Index("ix_likes_recipe_id", "recipe_id"),)

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="likes")
    recipe = relationship("Recipe", back_populates="likes")


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    __table_args__ = (Index("ix_saved_recipes_recipe_id", "recipe_id"),)

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_recipes")
    recipe = relationship("Recipe", back_populates="saved_by")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_reported = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipe = relationship("Recipe", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (Index("ix_ratings_recipe_id", "recipe_id"),)

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    score = Column(Integer, nullable=False)  # 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ratings")
    recipe = relationship("Recipe", back_populates="ratings")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="collections")
    items = relationship("CollectionItem", back_populates="collection", cascade="all, delete-orphan")


class CollectionItem(Base):
    __tablename__ = "collection_items"

    collection_id = Column(Integer, ForeignKey("collections.id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    collection = relationship("Collection", back_populates="items")
    recipe = relationship("Recipe")


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="רשימת קניות")
    items = Column(JSON, default=list)  # [{"name":"flour","amount":3,"unit":"cups","checked":false,"from_recipe":"..."}]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="shopping_lists")
