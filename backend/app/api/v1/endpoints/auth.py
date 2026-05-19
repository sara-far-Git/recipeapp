"""Authentication endpoints — local password + Google OAuth."""
import re
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserMe, Token, GoogleAuthRequest

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Local register / login
# ---------------------------------------------------------------------------
@router.post("/register", response_model=UserMe, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user.followers_count = 0
    user.following_count = 0
    user.recipes_count = 0
    return user


@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------
def _slugify_username(base: str) -> str:
    """Build a candidate username from an email local-part or full name.
    Strips characters not allowed by the username validator. The caller is
    responsible for ensuring uniqueness (with a numeric suffix if needed)."""
    cleaned = re.sub(r"[^\w֐-׿]", "", base or "").strip("_")
    if len(cleaned) < 3:
        cleaned = (cleaned + "user")[:8]
    return cleaned[:40]


def _unique_username(db: Session, base: str) -> str:
    candidate = _slugify_username(base)
    if not db.query(User).filter(User.username == candidate).first():
        return candidate
    # Append a short random suffix until unique
    for _ in range(5):
        suffix = secrets.token_hex(2)
        attempt = f"{candidate}_{suffix}"[:50]
        if not db.query(User).filter(User.username == attempt).first():
            return attempt
    # Last resort
    return f"user_{secrets.token_hex(4)}"


def _verify_google_id_token(id_token_str: str) -> dict:
    """Verify a Google id_token via Google's tokeninfo endpoint."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured on the server",
        )

    import httpx
    try:
        resp = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token_str},
            timeout=10,
        )
        resp.raise_for_status()
        info = resp.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {exc.response.text}")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Could not reach Google: {exc}")

    if info.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")
    if info.get("iss") not in ("https://accounts.google.com", "accounts.google.com"):
        raise HTTPException(status_code=401, detail="Token issuer mismatch")
    if str(info.get("email_verified", "")).lower() != "true":
        raise HTTPException(status_code=401, detail="Google email not verified")

    return info


@router.post("/google", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def google_auth(
    request: Request,
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    """Sign in (or sign up) with a Google id_token.

    The frontend obtains the id_token from Google Identity Services
    (the One Tap / button flow) and posts it here. We verify the token
    server-side, find or create the matching user, then issue our own
    JWT — the same shape that /auth/login returns.
    """
    info = _verify_google_id_token(payload.id_token)

    google_sub: str = info["sub"]
    email: str = info["email"]
    full_name: Optional[str] = info.get("name")
    picture: Optional[str] = info.get("picture")

    # 1) Existing user matched by google_id
    user = db.query(User).filter(User.google_id == google_sub).first()

    # 2) Else, existing user with the same email — link the Google account
    if user is None:
        user = db.query(User).filter(User.email == email).first()
        if user is not None:
            user.google_id = google_sub
            if user.auth_provider == "local":
                user.auth_provider = "hybrid"
            db.commit()
            db.refresh(user)

    # 3) Else, create a brand new user
    if user is None:
        username = _unique_username(db, email.split("@")[0])
        user = User(
            username=username,
            email=email,
            hashed_password=None,
            full_name=full_name,
            avatar_url=picture,
            is_verified=True,
            auth_provider="google",
            google_id=google_sub,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
