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


def test_ai_generation_is_capped(client, registered_user, enabled_limiter):
    """The endpoint that spends OpenAI credit must refuse a burst.

    It had no limit at all: a signed-in account could call it in a loop and
    the bill was whatever the loop managed before anyone noticed.
    """
    last = None
    for _ in range(30):
        last = client.post(
            "/api/v1/suggest/ai-generate",
            json={"ingredients": ["קמח"]},
            headers=registered_user["auth_header"],
        )
        if last.status_code == 429:
            break
    assert last is not None
    assert last.status_code == 429, "AI generation should stop once the budget is spent"


def test_uploads_are_capped(client, registered_user, enabled_limiter):
    """Storage is spent the same way credit is."""
    import io

    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (40, 40), (120, 120, 120)).save(buf, format="JPEG")
    photo = buf.getvalue()

    last = None
    for _ in range(60):
        last = client.post(
            "/api/v1/upload",
            files={"file": ("x.jpg", photo, "image/jpeg")},
            headers=registered_user["auth_header"],
        )
        if last.status_code == 429:
            break
    assert last is not None
    assert last.status_code == 429, "uploads should stop once the budget is spent"
