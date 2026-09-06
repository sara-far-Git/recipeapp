"""Shopping lists: create, add a recipe, merge amounts, skip headings."""

from tests.helpers import create_recipe


def test_shopping_requires_auth(client):
    assert client.get("/api/v1/shopping").status_code == 401
    assert client.post("/api/v1/shopping", json={"name": "שבת"}).status_code == 401


def test_create_and_list_shopping_lists(client, registered_user):
    created = client.post(
        "/api/v1/shopping",
        json={"name": "קניות לראש השנה"},
        headers=registered_user["auth_header"],
    )
    assert created.status_code == 201, created.text
    assert created.json()["name"] == "קניות לראש השנה"
    assert created.json()["items"] == []

    listed = client.get("/api/v1/shopping", headers=registered_user["auth_header"])
    assert listed.status_code == 200
    assert any(i["name"] == "קניות לראש השנה" for i in listed.json())


def test_add_recipe_merges_same_ingredient(client, registered_user):
    recipe = create_recipe(client, registered_user["auth_header"])
    sl = client.post(
        "/api/v1/shopping",
        json={"name": "שבת"},
        headers=registered_user["auth_header"],
    ).json()

    first = client.post(
        f"/api/v1/shopping/{sl['id']}/add-recipe",
        json={"recipe_id": recipe["id"], "servings_multiplier": 1},
        headers=registered_user["auth_header"],
    )
    assert first.status_code == 200
    flour = next(i for i in first.json()["items"] if i["name"] == "קמח")
    assert flour["amount"] == 2

    doubled = client.post(
        f"/api/v1/shopping/{sl['id']}/add-recipe",
        json={"recipe_id": recipe["id"], "servings_multiplier": 1},
        headers=registered_user["auth_header"],
    )
    flour = next(i for i in doubled.json()["items"] if i["name"] == "קמח")
    assert flour["amount"] == 4
    assert flour["from_recipe"] == "עוגת שוקולד"


def test_add_recipe_skips_ingredient_headings(client, registered_user):
    recipe = create_recipe(
        client,
        registered_user["auth_header"],
        ingredients=[
            {"name": "לבצק", "note": True},
            {"amount": 1, "unit": "כוס", "name": "קמח"},
        ],
    )
    sl = client.post(
        "/api/v1/shopping",
        json={"name": "עוגה"},
        headers=registered_user["auth_header"],
    ).json()

    added = client.post(
        f"/api/v1/shopping/{sl['id']}/add-recipe",
        json={"recipe_id": recipe["id"], "servings_multiplier": 2},
        headers=registered_user["auth_header"],
    )
    names = [i["name"] for i in added.json()["items"]]
    assert "לבצק" not in names
    assert names == ["קמח"]
    assert added.json()["items"][0]["amount"] == 2


def test_update_and_delete_shopping_list(client, registered_user):
    sl = client.post(
        "/api/v1/shopping",
        json={"name": "יומי"},
        headers=registered_user["auth_header"],
    ).json()

    updated = client.put(
        f"/api/v1/shopping/{sl['id']}/items",
        json=[{"name": "חלב", "amount": 1, "unit": "ליטר", "checked": True}],
        headers=registered_user["auth_header"],
    )
    assert updated.status_code == 200
    assert updated.json()["items"][0]["checked"] is True

    gone = client.delete(f"/api/v1/shopping/{sl['id']}", headers=registered_user["auth_header"])
    assert gone.status_code == 204
    assert client.get(f"/api/v1/shopping/{sl['id']}", headers=registered_user["auth_header"]).status_code == 404


def test_cannot_read_someone_elses_list(client, registered_user, publisher_user):
    sl = client.post(
        "/api/v1/shopping",
        json={"name": "שלי"},
        headers=registered_user["auth_header"],
    ).json()
    assert client.get(f"/api/v1/shopping/{sl['id']}", headers=publisher_user["auth_header"]).status_code == 404
