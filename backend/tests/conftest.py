"""Shared pytest fixtures.

Uses an in-memory SQLite DB per test so tests are fast and isolated.
The DATABASE_URL must be set BEFORE importing app modules — env vars
are read at module load via `Settings()`. This file injects the env
vars before any app code runs.
"""
import os
import sys
import pathlib

# Force test settings before app imports
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-do-not-use-in-prod-min-32-chars")
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("OPENAI_API_KEY", "")  # disable AI in tests

# Ensure backend/ is on sys.path so `app` is importable
ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
import app.models  # noqa: F401 — register models
from app.core.limiter import limiter
from app.main import app

# Tests fire many requests in rapid succession from the same client IP.
# Rate limiting is exercised separately in test_rate_limit.py — for the
# rest of the suite we disable it globally so unrelated tests don't flake.
limiter.enabled = False


@pytest.fixture()
def db_engine():
    """Fresh in-memory SQLite engine per test (StaticPool keeps the same conn)."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def db_session(db_engine):
    TestingSession = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_engine):
    """FastAPI TestClient with the DB dependency overridden to the test engine."""
    TestingSession = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)

    def _override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def publisher_user(client):
    """Register an approved publisher (שרי פרקש) and return credentials."""
    payload = {
        "username": "sara_farkas",
        "email": "sara.pub@example.com",
        "password": "supersecret123",
        "full_name": "שרי פרקש",
    }
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201, r.text
    login = client.post(
        "/api/v1/auth/login",
        data={"username": payload["email"], "password": payload["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {**payload, "token": token, "auth_header": {"Authorization": f"Bearer {token}"}}


@pytest.fixture()
def registered_user(client):
    """Register a sample user and return credentials + token."""
    payload = {
        "username": "tester",
        "email": "tester@example.com",
        "password": "supersecret123",
        "full_name": "Test User",
    }
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201, r.text
    # log in to get a token
    login = client.post(
        "/api/v1/auth/login",
        data={"username": payload["email"], "password": payload["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {**payload, "token": token, "auth_header": {"Authorization": f"Bearer {token}"}}
