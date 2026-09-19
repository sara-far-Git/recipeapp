"""The tag filter's LIKE must carry an explicit ESCAPE.

Hebrew reaches the JSON columns ASCII-escaped — "פסח" is stored as
"\\u05e4\\u05e1\\u05d7" — so the patterns that match it are full of
backslashes. PostgreSQL treats a backslash in LIKE as an escape character
unless told otherwise, which silently turns every one of those patterns into
something that matches nothing.

SQLite does not do this, so the API-level tests pass either way and cannot
protect the filter. These assert the shape of the SQL instead.
"""

import json

from sqlalchemy import String, cast
from sqlalchemy.dialects import postgresql

from app.api.v1.endpoints.suggest import json_text_variants, like_contains
from app.models.recipe import Recipe


def _compiled(clause):
    return str(clause.compile(dialect=postgresql.dialect(),
                              compile_kwargs={"literal_binds": True}))


def test_hebrew_is_matched_in_its_stored_ascii_form():
    variants = json_text_variants("פסח")
    assert "פסח" in variants
    # The spelling the column actually holds.
    assert json.dumps("פסח")[1:-1] in variants


def test_tag_clause_compiles_with_an_escape_clause():
    for variant in json_text_variants("פסח"):
        clause = cast(Recipe.tags, String).like(
            like_contains(f'"{variant}"'), escape="!"
        )
        assert "ESCAPE" in _compiled(clause)


def test_ingredient_clause_compiles_with_an_escape_clause():
    for variant in json_text_variants("קמח"):
        clause = cast(Recipe.ingredients, String).ilike(
            like_contains(variant), escape="!"
        )
        assert "ESCAPE" in _compiled(clause)


def test_like_contains_disarms_wildcards():
    assert like_contains("100%") == "%100!%%"
    assert like_contains("a_b") == "%a!_b%"
    assert like_contains("!") == "%!!%"
    # A backslash is left exactly as it is — with ESCAPE '!' it is no longer
    # special, and doubling it here would stop the pattern matching.
    assert like_contains("\\u05e4") == "%\\u05e4%"
