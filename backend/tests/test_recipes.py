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


def test_recipe_list_returns_published(client, publisher_user):
    """Approved-author recipes appear in the public feed."""
    client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=publisher_user["auth_header"],
    )
    r = client.get("/api/v1/recipes")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert any(i["title"] == "עוגת שוקולד" for i in items)


def test_non_publisher_recipe_stays_private(client, registered_user):
    """Non-approved-author recipes are NOT in the public feed."""
    client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    )
    r = client.get("/api/v1/recipes")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert not any(i["title"] == "עוגת שוקולד" for i in items)


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


def test_search_finds_your_own_draft(client, registered_user):
    """A cook who is not on the publisher list still searches their own book.

    Their recipes are saved as drafts, so a search that only looked at
    published ones handed them an empty page for a recipe they had just
    written.
    """
    client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    )

    mine = client.get("/api/v1/search?q=שוקולד", headers=registered_user["auth_header"])
    assert mine.status_code == 200
    assert any(i["title"] == "עוגת שוקולד" for i in mine.json())


def test_search_hides_someone_elses_draft(client, registered_user, publisher_user):
    """The draft stays private: it is findable by its author, and by no one else."""
    client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    )

    stranger = client.get("/api/v1/search?q=שוקולד", headers=publisher_user["auth_header"])
    assert stranger.status_code == 200
    assert not any(i["title"] == "עוגת שוקולד" for i in stranger.json())

    anonymous = client.get("/api/v1/search?q=שוקולד")
    assert anonymous.status_code == 200
    assert not any(i["title"] == "עוגת שוקולד" for i in anonymous.json())


def test_ingredient_search_finds_your_own_draft(client, registered_user):
    client.post(
        "/api/v1/recipes",
        json=_sample_recipe(),
        headers=registered_user["auth_header"],
    )
    r = client.post(
        "/api/v1/suggest/from-ingredients",
        json={"ingredients": ["קמח"]},
        headers=registered_user["auth_header"],
    )
    assert r.status_code == 200
    assert any(i["title"] == "עוגת שוקולד" for i in r.json())
