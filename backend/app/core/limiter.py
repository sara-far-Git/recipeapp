"""Shared SlowAPI limiter instance.

We expose a single limiter so it can be referenced from both `main.py`
(to register the middleware/exception handler) and from individual
endpoint modules (to apply `@limiter.limit(...)` decorators).

The limiter keys requests by client IP using `get_remote_address`.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
