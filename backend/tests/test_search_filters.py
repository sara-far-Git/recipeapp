"""Search filters: difficulty, kosher type, prep time, and Hebrew stems."""

from tests.helpers import create_recipe


def _titles(response):
    return [i["title"] for i in response.json()]


def test_search_filters_difficulty_kosher_and_time(client, publisher_user):
    create_recipe(
        client,
        publisher_user["auth_header"],
        title="עוף מהיר",
        difficulty="easy",
        kosher_type="meat",
        prep_time_minutes=15,
        category="עיקריות",
    )
    create_recipe(
        client,
        publisher_user["auth_header"],
        title="צלי ארוך",
        difficulty="hard",
        kosher_type="meat",
        prep_time_minutes=90,
        category="עיקריות",
    )
    create_recipe(
        client,
        publisher_user["auth_header"],
        title="עוגת גבינה",
        difficulty="easy",
        kosher_type="dairy",
        prep_time_minutes=25,
        category="מאפים",
    )

    easy = client.get("/api/v1/search?difficulty=easy")
    assert "עוף מהיר" in _titles(easy)
    assert "עוגת גבינה" in _titles(easy)
    assert "צלי ארוך" not in _titles(easy)

    meat = client.get("/api/v1/search?kosher_type=meat")
    assert "עוף מהיר" in _titles(meat)
    assert "עוגת גבינה" not in _titles(meat)

    quick = client.get("/api/v1/search?max_prep_time=20")
    assert "עוף מהיר" in _titles(quick)
    assert "צלי ארוך" not in _titles(quick)

    mains = client.get("/api/v1/search?category=עיקריות")
    assert "עוף מהיר" in _titles(mains)
    assert "עוגת גבינה" not in _titles(mains)


def test_search_hebrew_stem_finds_inflected_title(client, publisher_user):
    """עוגה should still find עוגת גבינה."""
    create_recipe(client, publisher_user["auth_header"], title="עוגת גבינה")
    r = client.get("/api/v1/search?q=עוגה")
    assert r.status_code == 200
    assert "עוגת גבינה" in _titles(r)


def test_search_every_word_must_match(client, publisher_user):
    create_recipe(client, publisher_user["auth_header"], title="עוגת שוקולד")
    create_recipe(client, publisher_user["auth_header"], title="מרק עוף")
    both = client.get("/api/v1/search?q=עוגה שוקולד")
    assert "עוגת שוקולד" in _titles(both)
    assert "מרק עוף" not in _titles(both)
