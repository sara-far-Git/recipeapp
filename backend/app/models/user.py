from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Follow(Base):
    """Many-to-many self-referential follow relationship."""
    __tablename__ = "follows"

    follower_id = Column(Integer, __import__('sqlalchemy').ForeignKey("users.id"), primary_key=True)
    followed_id = Column(Integer, __import__('sqlalchemy').ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # Nullable: users registered via OAuth (Google) won't have a password.
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # OAuth identity columns. provider="local" for password users,
    # "google" for Google OAuth, etc. google_id is the unique `sub` from the
    # Google id_token — this is what we match on when re-authenticating.
    auth_provider = Column(String(20), default="local", nullable=False)
    google_id = Column(String(255), unique=True, index=True, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    recipes = relationship("Recipe", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    saved_recipes = relationship("SavedRecipe", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    shopping_lists = relationship("ShoppingList", back_populates="user", cascade="all, delete-orphan")

    following = relationship(
        "User",
        secondary="follows",
        primaryjoin="User.id == Follow.follower_id",
        secondaryjoin="User.id == Follow.followed_id",
        back_populates="followers",
    )
    followers = relationship(
        "User",
        secondary="follows",
        primaryjoin="User.id == Follow.followed_id",
        secondaryjoin="User.id == Follow.follower_id",
        back_populates="following",
    )
