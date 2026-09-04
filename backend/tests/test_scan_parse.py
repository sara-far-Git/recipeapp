"""The parser that turns a model's JSON into a recipe.

A model that could not read the photo, or could not hear the recording, still
answers with well-formed JSON — just an empty recipe. Letting that through as a
200 makes the page announce a success over a form that stayed blank, which is
the one failure a cook cannot diagnose. So it is refused here.
"""
import json

import pytest
from fastapi import HTTPException

from app.api.v1.endpoints.scan import _parse_recipe_json

EMPTY_DETAIL = "nothing came back"


def test_keeps_a_real_recipe():
    raw = json.dumps(
        {
            "title": "עוגת שוקולד",
            "ingredients": [{"amount": 2, "unit": "כוסות", "name": "קמח"}],
            "instructions": [{"step": 1, "text": "לערבב"}],
        }
    )
    parsed = _parse_recipe_json(raw, EMPTY_DETAIL)
    assert parsed.title == "עוגת שוקולד"
    assert len(parsed.ingredients) == 1


def test_strips_a_markdown_fence():
    raw = '```json\n{"title": "לחם", "ingredients": [], "instructions": []}\n```'
    assert _parse_recipe_json(raw, EMPTY_DETAIL).title == "לחם"


def test_a_title_alone_is_enough():
    raw = json.dumps({"title": "מרק", "ingredients": [], "instructions": []})
    assert _parse_recipe_json(raw, EMPTY_DETAIL).title == "מרק"


def test_steps_alone_are_enough():
    raw = json.dumps({"title": "", "instructions": [{"step": 1, "text": "לחמם"}]})
    assert _parse_recipe_json(raw, EMPTY_DETAIL).instructions[0].text == "לחמם"


@pytest.mark.parametrize("title", ["", "   "])
def test_refuses_an_empty_recipe(title):
    raw = json.dumps({"title": title, "ingredients": [], "instructions": []})
    with pytest.raises(HTTPException) as err:
        _parse_recipe_json(raw, EMPTY_DETAIL)
    assert err.value.status_code == 422
    assert err.value.detail == EMPTY_DETAIL


def test_refuses_an_empty_response():
    with pytest.raises(HTTPException) as err:
        _parse_recipe_json("", EMPTY_DETAIL)
    assert err.value.status_code == 502
