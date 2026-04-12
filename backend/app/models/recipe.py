from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    Float, ForeignKey, Enum as SAEnum, JSON
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
    difficulty = Column(SAEnum(DifficultyLevel), default=DifficultyLevel.medium)
    kosher_type = Column(SAEnum(KosherType), nullable=True)

    # Step 2 - Ingredients (stored as JSON array)
    # Format: [{"amount": 2, "unit": "cups", "name": "flour"}, ...]
    ingredients = Column(JSON, default=list)

    # Step 3 - Instructions (stored as JSON array)
    # Format: [{"step": 1, "text": "..."}, ...]
    instructions = Column(JSON, default=list)

    # AI Scan tracking
    is_scanned = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)

    # Stats (denormalized for performance)
    likes_count = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="recipes")
    likes = relationship("Like", back_populates="recipe", cascade="all, delete-orphan")
    saved_by = relationship("SavedRecipe", back_populates="recipe", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="recipe", cascade="all, delete-orphan")


class Like(Base):
    __tablename__ = "likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="likes")
    recipe = relationship("Recipe", back_populates="likes")


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_recipes")
    recipe = relationship("Recipe", back_populates="saved_by")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_reported = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipe = relationship("Recipe", back_populates="comments")
    author = relationship("User", back_populates="comments")
