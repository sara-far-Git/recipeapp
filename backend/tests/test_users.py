"""Profiles, follow, saved recipes, and the personal book."""

from tests.helpers import create_recipe


def test_public_profile_and_missing_user(client, registered_user):
    ok = client.get("/api/v1/users/tester")
    assert ok.status_code == 200
    assert ok.json()["username"] == "tester"
    assert "email" not in ok.json()
    assert client.get("/api/v1/users/nobody-here").status_code == 404


def test_update_own_profile(client, registered_user):
    r = client.put(
        "/api/v1/users/me",
        json={"full_name": "טסטר מעודכן", "bio": "מבשל בבית"},
        headers=registered_user["auth_header"],
    )
    assert r.status_code == 200
    assert r.json()["full_name"] == "טסטר מעודכן"
    assert r.json()["bio"] == "מבשל בבית"


def test_own_recipes_include_drafts_strangers_see_published_only(
    client, registered_user, publisher_user
):
    create_recipe(client, registered_user["auth_header"], title="טיוטה שלי")
    create_recipe(client, publisher_user["auth_header"], title="פומבי")

    mine = client.get("/api/v1/users/tester/recipes", headers=registered_user["auth_header"])
    assert mine.status_code == 200
    assert any(i["title"] == "טיוטה שלי" for i in mine.json())

    stranger = client.get("/api/v1/users/tester/recipes")
    assert stranger.status_code == 200
    assert not any(i["title"] == "טיוטה שלי" for i in stranger.json())

    public = client.get("/api/v1/users/sara_farkas/recipes")
    assert any(i["title"] == "פומבי" for i in public.json())


def test_follow_toggle_and_cannot_follow_self(client, registered_user, publisher_user):
    assert client.post(
        "/api/v1/users/tester/follow",
        headers=registered_user["auth_header"],
    ).status_code == 400

    on = client.post("/api/v1/users/sara_farkas/follow", headers=registered_user["auth_header"])
    assert on.status_code == 200
    assert on.json()["following"] is True

    followers = client.get("/api/v1/users/sara_farkas/followers")
    assert any(u["username"] == "tester" for u in followers.json())

    following = client.get("/api/v1/users/tester/following")
    assert any(u["username"] == "sara_farkas" for u in following.json())

    off = client.post("/api/v1/users/sara_farkas/follow", headers=registered_user["auth_header"])
    assert off.json()["following"] is False


def test_save_is_private_to_the_owner(client, registered_user, publisher_user):
    recipe = create_recipe(client, publisher_user["auth_header"])
    saved = client.post(
        f"/api/v1/recipes/{recipe['id']}/save",
        headers=registered_user["auth_header"],
    )
    assert saved.status_code == 200
    assert saved.json()["saved"] is True

    mine = client.get("/api/v1/users/tester/saved", headers=registered_user["auth_header"])
    assert any(i["id"] == recipe["id"] for i in mine.json())

    assert client.get(
        "/api/v1/users/tester/saved",
        headers=publisher_user["auth_header"],
    ).status_code == 403
