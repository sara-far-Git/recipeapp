"""Unit tests for the JSON-LD recipe parser used by /api/v1/import.

We avoid hitting the network by feeding `_parse_jsonld_recipe` a hand-built
schema.org/Recipe dict, plus exercise the helper utilities directly.
"""
from app.api.v1.endpoints.importer import (
    _parse_iso_duration_minutes,
    _split_amount,
    _parse_jsonld_recipe,
    _coerce_str_list,
)


def test_parse_iso_duration_basic():
    assert _parse_iso_duration_minutes("PT30M") == 30
    assert _parse_iso_duration_minutes("PT1H") == 60
    assert _parse_iso_duration_minutes("PT1H30M") == 90
    assert _parse_iso_duration_minutes(None) is None
    assert _parse_iso_duration_minutes("invalid") is None


def test_split_amount_numeric():
    out = _split_amount("2 cups flour")
    assert out["amount"] == 2
    assert out["unit"] == "cups"
    assert out["name"] == "flour"


def test_split_amount_fraction():
    out = _split_amount("1/2 כוס שמן")
    assert abs(out["amount"] - 0.5) < 1e-6
    assert out["unit"] == "כוס"
    assert "שמן" in out["name"]


def test_split_amount_no_quantity():
    out = _split_amount("salt to taste")
    assert out["amount"] == 0
    assert "salt" in out["name"]


def test_coerce_str_list_handles_objects():
    items = [
        {"@type": "HowToStep", "text": "Mix dry ingredients"},
        {"@type": "HowToStep", "text": "Bake for 30 minutes"},
    ]
    assert _coerce_str_list(items) == ["Mix dry ingredients", "Bake for 30 minutes"]


def test_parse_jsonld_full_recipe():
    blob = {
        "@type": "Recipe",
        "name": "Chocolate Cake",
        "description": "A classic",
        "prepTime": "PT20M",
        "cookTime": "PT35M",
        "recipeYield": "8",
        "recipeIngredient": [
            "2 cups flour",
            "1 cup sugar",
        ],
        "recipeInstructions": [
            {"@type": "HowToStep", "text": "Mix dry"},
            {"@type": "HowToStep", "text": "Add wet, bake"},
        ],
    }
    out = _parse_jsonld_recipe(blob)
    assert out["title"] == "Chocolate Cake"
    assert out["prep_time_minutes"] == 20
    assert out["cook_time_minutes"] == 35
    assert out["servings"] == 8
    assert len(out["ingredients"]) == 2
    assert out["ingredients"][0]["name"] == "flour"
    assert out["instructions"][0]["step"] == 1
    assert out["instructions"][1]["text"] == "Add wet, bake"


def test_parse_jsonld_string_instructions():
    """Some sites publish instructions as a single newline-separated string."""
    blob = {
        "@type": "Recipe",
        "name": "Quick Soup",
        "recipeIngredient": ["water", "salt"],
        "recipeInstructions": "Boil water.\nAdd salt.\nServe.",
    }
    out = _parse_jsonld_recipe(blob)
    assert len(out["instructions"]) == 3
    assert out["instructions"][2]["text"] == "Serve."


def test_import_endpoint_rejects_anonymous(client):
    r = client.post("/api/v1/import", json={"url": "https://example.com"})
    assert r.status_code == 401
