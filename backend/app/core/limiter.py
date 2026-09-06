"""Shared SlowAPI limiter instance.

We expose a single limiter so it can be referenced from both `main.py`
(to register the middleware/exception handler) and from individual
endpoint modules (to apply `@limiter.limit(...)` decorators).

The default key is the client's IP, which is all an anonymous request
offers. Anything that costs money should be keyed by `paying_key`
instead: those endpoints require a signed-in cook, and an IP is both too
coarse (a household behind one address shares a budget) and too easy to
shed (a new address, or simply a new token, resets the count).
"""
import hashlib
from typing import Optional

from jose import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.core.config import settings

limiter = Limiter(key_func=get_remote_address)


def _user_id_from(request: Request) -> Optional[str]:
    """The signed-in cook's id, read straight from the token.

    No database round trip: this runs before the endpoint on every call to
    it, and the id is in the token already. A token we cannot verify is
    treated as no token at all — the request will be refused by the
    endpoint's own dependency a moment later anyway.
    """
    header = request.headers.get("authorization") or ""
    if not header.lower().startswith("bearer "):
        return None
    try:
        payload = jwt.decode(
            header[7:], settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except Exception:  # noqa: BLE001 - any bad token is simply not a user
        return None
    subject = payload.get("sub")
    return str(subject) if subject else None


def paying_key(request: Request) -> str:
    """Rate-limit key for anything that spends money or storage.

    Keyed by the cook, so signing in again does not hand out a fresh
    allowance, and one person on a shared address cannot use up everyone
    else's. Falls back to the address for requests that carry no token.
    """
    user = _user_id_from(request)
    if user:
        return "user:" + hashlib.sha256(user.encode()).hexdigest()[:32]
    return "ip:" + get_remote_address(request)
