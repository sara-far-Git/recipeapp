"""Likes, saves, comments, ratings, and editing your own recipe."""

from tests.helpers import create_recipe


def test_update_and_delete_own_recipe(client, registered_user, publisher_user):
    recipe = create_recipe(client, registered_user["auth_header"])

    forbidden = client.put(
        f"/api/v1/recipes/{recipe['id']}",
        json={"title": "גנוב"},
        headers=publisher_user["auth_header"],
    )
    assert forbidden.status_code == 403

    updated = client.put(
        f"/api/v1/recipes/{recipe['id']}",
        json={"title": "עוגת גבינה", "category": "מאפים"},
        headers=registered_user["auth_header"],
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "עוגת גבינה"
    assert updated.json()["category"] == "מאפים"

    assert client.delete(
        f"/api/v1/recipes/{recipe['id']}",
        headers=publisher_user["auth_header"],
    ).status_code == 403

    assert client.delete(
        f"/api/v1/recipes/{recipe['id']}",
        headers=registered_user["auth_header"],
    ).status_code == 204
    assert client.get(f"/api/v1/recipes/{recipe['id']}").status_code == 404


def test_like_and_save_toggle(client, publisher_user, registered_user):
    recipe = create_recipe(client, publisher_user["auth_header"])

    liked = client.post(
        f"/api/v1/recipes/{recipe['id']}/like",
        headers=registered_user["auth_header"],
    )
    assert liked.status_code == 200
    assert liked.json()["liked"] is True
    assert liked.json()["likes_count"] == 1

    unliked = client.post(
        f"/api/v1/recipes/{recipe['id']}/like",
        headers=registered_user["auth_header"],
    )
    assert unliked.json()["liked"] is False
    assert unliked.json()["likes_count"] == 0

    saved = client.post(
        f"/api/v1/recipes/{recipe['id']}/save",
        headers=registered_user["auth_header"],
    )
    assert saved.json()["saved"] is True
    unsaved = client.post(
        f"/api/v1/recipes/{recipe['id']}/save",
        headers=registered_user["auth_header"],
    )
    assert unsaved.json()["saved"] is False


def test_comments_and_report(client, publisher_user, registered_user):
    recipe = create_recipe(client, publisher_user["auth_header"])
    created = client.post(
        f"/api/v1/recipes/{recipe['id']}/comments",
        json={"content": "יצא נהדר"},
        headers=registered_user["auth_header"],
    )
    assert created.status_code == 201
    assert created.json()["content"] == "יצא נהדר"

    listed = client.get(f"/api/v1/recipes/{recipe['id']}/comments")
    assert listed.status_code == 200
    assert listed.json()[0]["content"] == "יצא נהדר"

    reported = client.post(
        f"/api/v1/recipes/{recipe['id']}/comments/{created.json()['id']}/report",
        headers=publisher_user["auth_header"],
    )
    assert reported.status_code == 200
    assert reported.json()["reported"] is True


def test_rate_recipe_and_reject_out_of_range(client, publisher_user, registered_user):
    recipe = create_recipe(client, publisher_user["auth_header"])
    assert client.post(
        f"/api/v1/recipes/{recipe['id']}/rate",
        json={"score": 6},
        headers=registered_user["auth_header"],
    ).status_code == 400

    first = client.post(
        f"/api/v1/recipes/{recipe['id']}/rate",
        json={"score": 4},
        headers=registered_user["auth_header"],
    )
    assert first.status_code == 200
    body = first.json()
    assert body["ratings_count"] == 1
    assert body["average_rating"] == 4

    again = client.post(
        f"/api/v1/recipes/{recipe['id']}/rate",
        json={"score": 5},
        headers=registered_user["auth_header"],
    )
    assert again.json()["ratings_count"] == 1
    assert again.json()["average_rating"] == 5
