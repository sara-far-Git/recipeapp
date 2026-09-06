"""Collections: create, privacy, and toggling a recipe in or out."""

from tests.helpers import create_recipe


def test_collections_require_auth(client):
    assert client.get("/api/v1/collections").status_code == 401


def test_create_list_and_toggle_recipe(client, publisher_user):
    recipe = create_recipe(client, publisher_user["auth_header"])
    col = client.post(
        "/api/v1/collections",
        json={"name": "שבת", "description": "לערב", "is_public": True},
        headers=publisher_user["auth_header"],
    )
    assert col.status_code == 201, col.text
    cid = col.json()["id"]

    added = client.post(
        f"/api/v1/collections/{cid}/recipes/{recipe['id']}",
        headers=publisher_user["auth_header"],
    )
    assert added.status_code == 200
    assert added.json()["added"] is True

    detail = client.get(f"/api/v1/collections/{cid}")
    assert detail.status_code == 200
    assert any(r["id"] == recipe["id"] for r in detail.json()["recipes"])

    removed = client.post(
        f"/api/v1/collections/{cid}/recipes/{recipe['id']}",
        headers=publisher_user["auth_header"],
    )
    assert removed.json()["added"] is False


def test_private_collection_is_hidden_from_strangers(client, registered_user, publisher_user):
    col = client.post(
        "/api/v1/collections",
        json={"name": "פרטי", "is_public": False},
        headers=registered_user["auth_header"],
    ).json()

    assert client.get(f"/api/v1/collections/{col['id']}").status_code == 403
    assert client.get(
        f"/api/v1/collections/{col['id']}",
        headers=publisher_user["auth_header"],
    ).status_code == 403

    mine = client.get(f"/api/v1/collections/{col['id']}", headers=registered_user["auth_header"])
    assert mine.status_code == 200


def test_update_and_delete_collection(client, registered_user):
    col = client.post(
        "/api/v1/collections",
        json={"name": "ישן", "is_public": False},
        headers=registered_user["auth_header"],
    ).json()

    renamed = client.put(
        f"/api/v1/collections/{col['id']}",
        json={"name": "חדש", "is_public": True},
        headers=registered_user["auth_header"],
    )
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "חדש"
    assert renamed.json()["is_public"] is True

    assert client.delete(
        f"/api/v1/collections/{col['id']}",
        headers=registered_user["auth_header"],
    ).status_code == 204
    assert client.get(f"/api/v1/collections/{col['id']}").status_code == 404
