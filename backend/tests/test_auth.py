"""Tests for the authentication endpoints (register / login)."""


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_register_creates_user(client):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "longenoughpw",
            "full_name": "Alice",
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["username"] == "alice"
    assert body["email"] == "alice@example.com"
    # password must never be returned
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_rejects_short_password(client):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "username": "shorty",
            "email": "shorty@example.com",
            "password": "abc",
            "full_name": None,
        },
    )
    assert r.status_code == 422


def test_register_duplicate_email_rejected(client):
    payload = {
        "username": "user1",
        "email": "dup@example.com",
        "password": "longenoughpw",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    payload["username"] = "user2"  # different username, same email
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 400
    assert "Email" in r.json()["detail"]


def test_login_success_returns_jwt(client, registered_user):
    r = client.post(
        "/api/v1/auth/login",
        data={
            "username": registered_user["email"],
            "password": registered_user["password"],
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["token_type"] == "bearer"
    assert len(body["access_token"]) > 20


def test_login_wrong_password_rejected(client, registered_user):
    r = client.post(
        "/api/v1/auth/login",
        data={
            "username": registered_user["email"],
            "password": "wrongpassword",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 401


def test_authenticated_endpoint_requires_token(client):
    r = client.get("/api/v1/users/me")
    assert r.status_code == 401


def test_authenticated_endpoint_with_token(client, registered_user):
    r = client.get("/api/v1/users/me", headers=registered_user["auth_header"])
    assert r.status_code == 200
    assert r.json()["email"] == registered_user["email"]
