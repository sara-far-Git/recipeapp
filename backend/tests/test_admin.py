"""The site's numbers, and who may read them.

The gate matters more than the figures: this endpoint is the one place that
says how many people use the site, and it must be shut to everyone who was
not named in configuration.
"""
import pytest

from app.core import config


@pytest.fixture()
def as_admin(registered_user, monkeypatch):
    monkeypatch.setattr(config.settings, "ADMIN_EMAILS", registered_user["email"])
    return registered_user


def test_a_stranger_gets_nothing(client):
    assert client.get("/api/v1/admin/stats").status_code == 401


def test_a_signed_in_cook_is_not_an_admin(client, registered_user, monkeypatch):
    """Signing in is not enough — and the answer gives nothing away."""
    monkeypatch.setattr(config.settings, "ADMIN_EMAILS", "someone@else.com")
    r = client.get("/api/v1/admin/stats", headers=registered_user["auth_header"])
    assert r.status_code == 404


def test_an_empty_setting_admits_nobody(client, registered_user, monkeypatch):
    monkeypatch.setattr(config.settings, "ADMIN_EMAILS", "")
    r = client.get("/api/v1/admin/stats", headers=registered_user["auth_header"])
    assert r.status_code == 404


def test_the_named_address_reads_the_numbers(client, as_admin):
    r = client.get("/api/v1/admin/stats", headers=as_admin["auth_header"])
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["users"]["total"] >= 1
    assert set(body) == {"users", "recipes", "images"}
    assert "bytes" in body["images"]


def test_the_address_match_ignores_case_and_spaces(client, registered_user, monkeypatch):
    monkeypatch.setattr(
        config.settings, "ADMIN_EMAILS", f" OTHER@x.com , {registered_user['email'].upper()} "
    )
    r = client.get("/api/v1/admin/stats", headers=registered_user["auth_header"])
    assert r.status_code == 200


def test_signing_in_is_recorded(client, registered_user, monkeypatch):
    """So "how many came back" is answerable at all.

    A registration on its own does not count as a visit — the stamp is put on
    at sign-in, which is the thing worth counting.
    """
    monkeypatch.setattr(config.settings, "ADMIN_EMAILS", registered_user["email"])
    stats = lambda: client.get(
        "/api/v1/admin/stats", headers=registered_user["auth_header"]
    ).json()["users"]

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "lurker",
            "email": "lurker@example.com",
            "password": "supersecret123",
            "full_name": "Lurker",
        },
    )
    before = stats()
    assert before["never_signed_in"] >= 1, "a registration alone is not a visit"

    client.post(
        "/api/v1/auth/login",
        data={"username": "lurker@example.com", "password": "supersecret123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    after = stats()
    assert after["seen_today"] == before["seen_today"] + 1
    assert after["never_signed_in"] == before["never_signed_in"] - 1
