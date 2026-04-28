"""Tests for recipe creation and retrieval."""


def _sample_recipe():
    return {
        "title": "עוגת שוקולד",
        "description": "עוגה קלאסית",
        "prep_time_minutes": 20,
        "cook_time_minutes": 35,
        "servings": 8,
        "difficulty": "easy",
        "kosher_type": "dairy",
        "ingredients": [
            {"amount": 2, "unit": "כוסות", "name": "קמח"},
            {"amount": 1, "unit": "כוס", "name": "סוכר"},
        ],
        "instructions": [
            {"step": 1, "text": "לערבב את היבשים"},
            {"step": 2, "text": "להוסיף נוזלים ולאפות"},
        ],
    }


def test_recipe_create_requires_auth(client):
    r = client.post("/api/v1/recipes", json=_sample_recipe())
    assert r.status_code == 401


def test_recipe_create_and_get(client, registered_user):
    r = client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    )
    assert r.status_code in (200, 201), r.text
    body = r.json()
    assert body["title"] == "עוגת שוקולד"
    assert len(body["ingredients"]) == 2
    assert len(body["instructions"]) == 2

    rid = body["id"]
    r2 = client.get(f"/api/v1/recipes/{rid}")
    assert r2.status_code == 200
    assert r2.json()["id"] == rid


def test_recipe_list_returns_published(client, registered_user):
    client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    )
    r = client.get("/api/v1/recipes")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert any(i["title"] == "עוגת שוקולד" for i in items)


def test_recipe_like_toggle(client, registered_user):
    rec = client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    ).json()
    r = client.post(
        f"/api/v1/recipes/{rec['id']}/like",
        headers=registered_user["auth_header"],
    )
    # endpoint may return 200 or 201 with updated counts
    assert r.status_code in (200, 201)
