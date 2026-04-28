"""Smoke test for SlowAPI integration.

We re-enable the limiter for this one test, set a tiny budget, and confirm
that bursting past it produces a 429.
"""
import pytest
from app.core.limiter import limiter


@pytest.fixture()
def enabled_limiter():
    limiter.enabled = True
    yield
    limiter.enabled = False
    # Reset its internal storage so other tests aren't affected
    try:
        limiter.reset()
    except Exception:  # pragma: no cover
        pass


def test_login_rate_limit_returns_429(client, enabled_limiter):
    # Default in tests is 10/minute on /auth/login.
    # Fire enough wrong-credential requests to blow past the budget.
    last = None
    for _ in range(15):
        last = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody@example.com", "password": "wrong"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if last.status_code == 429:
            break
    assert last is not None
    assert last.status_code == 429, "expected limiter to return 429 once budget exhausted"
