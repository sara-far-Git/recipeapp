from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        if not re.match(r"^[\w\u0590-\u05FF]{3,50}$", v):
            raise ValueError("שם משתמש חייב להיות 3-50 תווים: אותיות, מספרים או קו תחתון")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserPublic(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    followers_count: int = 0
    following_count: int = 0
    recipes_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMe(UserPublic):
    email: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class GoogleAuthRequest(BaseModel):
    """The frontend sends the Google id_token (a signed JWT) it received
    from Google Identity Services. The backend verifies its signature and
    audience server-side, then issues our own JWT.
    """
    id_token: str
