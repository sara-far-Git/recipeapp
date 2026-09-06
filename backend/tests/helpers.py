"""Shared recipe payloads for API tests."""


def sample_recipe(**overrides):
    recipe = {
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
    recipe.update(overrides)
    return recipe


def create_recipe(client, auth_header, **overrides):
    r = client.post("/api/v1/recipes", json=sample_recipe(**overrides), headers=auth_header)
    assert r.status_code in (200, 201), r.text
    return r.json()
