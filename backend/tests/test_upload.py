"""Photos kept in our own database.

The site is run from a filtered network where every image host's console was
unreachable, so with no provider configured the upload endpoint stores the
bytes itself and serves them back from the same origin as the site.
"""
import io

from PIL import Image


def _photo(width: int, height: int) -> bytes:
    """A JPEG the size a phone would hand over."""
    img = Image.new("RGB", (width, height), (200, 120, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def test_upload_requires_auth(client):
    r = client.post(
        "/api/v1/upload",
        files={"file": ("photo.jpg", _photo(50, 50), "image/jpeg")},
    )
    assert r.status_code == 401


def test_upload_stores_and_serves_the_photo(client, registered_user):
    r = client.post(
        "/api/v1/upload",
        files={"file": ("photo.jpg", _photo(600, 400), "image/jpeg")},
        headers=registered_user["auth_header"],
    )
    assert r.status_code == 200, r.text
    url = r.json()["url"]
    assert url.startswith("/api/v1/images/")

    got = client.get(url)
    assert got.status_code == 200
    assert got.headers["content-type"] == "image/webp"
    assert "immutable" in got.headers.get("cache-control", "")
    # What comes back is a real image of the same shape.
    out = Image.open(io.BytesIO(got.content))
    assert out.size == (600, 400)


def test_a_large_photo_is_shrunk(client, registered_user):
    """A phone photo is capped on its longest edge before it is stored."""
    r = client.post(
        "/api/v1/upload",
        files={"file": ("big.jpg", _photo(4000, 3000), "image/jpeg")},
        headers=registered_user["auth_header"],
    )
    assert r.status_code == 200, r.text
    out = Image.open(io.BytesIO(client.get(r.json()["url"]).content))
    assert max(out.size) == 1600
    assert out.size == (1600, 1200)


def test_a_file_that_is_not_an_image_is_refused(client, registered_user):
    r = client.post(
        "/api/v1/upload",
        files={"file": ("notes.txt", b"hello there", "text/plain")},
        headers=registered_user["auth_header"],
    )
    assert r.status_code == 400


def test_a_missing_image_is_a_404(client):
    assert client.get("/api/v1/images/deadbeef").status_code == 404


# ── What keeps the bills bounded ────────────────────────────────────────────


def test_the_quota_refuses_an_upload_once_the_cap_is_reached(
    client, registered_user, monkeypatch
):
    """Photos cost storage now, so one account cannot take the whole disk."""
    from app.core import config

    monkeypatch.setattr(config.settings, "MAX_IMAGES_PER_USER", 2)

    for n in range(2):
        ok = client.post(
            "/api/v1/upload",
            files={"file": (f"{n}.jpg", _photo(80, 80), "image/jpeg")},
            headers=registered_user["auth_header"],
        )
        assert ok.status_code == 200, ok.text

    refused = client.post(
        "/api/v1/upload",
        files={"file": ("third.jpg", _photo(80, 80), "image/jpeg")},
        headers=registered_user["auth_header"],
    )
    assert refused.status_code == 413
    assert "מקסימום" in refused.json()["detail"]


def test_the_byte_quota_refuses_an_upload(client, registered_user, monkeypatch):
    from app.core import config

    monkeypatch.setattr(config.settings, "MAX_IMAGE_BYTES_PER_USER", 100)

    refused = client.post(
        "/api/v1/upload",
        files={"file": ("big.jpg", _photo(900, 900), "image/jpeg")},
        headers=registered_user["auth_header"],
    )
    assert refused.status_code == 413
    assert "MB" in refused.json()["detail"]


def test_one_cook_does_not_spend_anothers_quota(client, registered_user, publisher_user, monkeypatch):
    """The quota is counted per owner, not across the whole table."""
    from app.core import config

    monkeypatch.setattr(config.settings, "MAX_IMAGES_PER_USER", 1)

    first = client.post(
        "/api/v1/upload",
        files={"file": ("a.jpg", _photo(60, 60), "image/jpeg")},
        headers=registered_user["auth_header"],
    )
    assert first.status_code == 200

    # A different cook still has their own allowance.
    other = client.post(
        "/api/v1/upload",
        files={"file": ("b.jpg", _photo(60, 60), "image/jpeg")},
        headers=publisher_user["auth_header"],
    )
    assert other.status_code == 200
