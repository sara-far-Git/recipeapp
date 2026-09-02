from app.core.config import settings
from app.services import recipe_ai_router as router


def _recipe(title="מרק עדשים"):
    return {
        "title": title,
        "description": None,
        "prep_time_minutes": 10,
        "cook_time_minutes": 30,
        "servings": 4,
        "difficulty": "easy",
        "kosher_type": "pareve",
        "ingredients": [{"amount": 1, "unit": "כוס", "name": "עדשים"}],
        "instructions": [{"step": 1, "text": "מבשלים"}],
    }


def setup_function():
    router._gemma_warm_window.clear()


def _mark_gemma_warm(monkeypatch):
    monkeypatch.setattr(settings, "AI_PREFILTER_ENABLED", True)
    monkeypatch.setattr(settings, "GEMMA_BASE_URL", "https://gemma.example/v1")
    monkeypatch.setattr(settings, "GEMMA_ASSUME_WARM", False)
    router._gemma_warm_window.record_success()


def test_cost_gate_uses_original_text_when_prefilter_is_disabled(monkeypatch):
    monkeypatch.setattr(settings, "AI_PREFILTER_ENABLED", False)
    received = []

    result = router.extract_recipe_with_cost_gate(
        "full page text", lambda text: received.append(text) or _recipe()
    )

    assert result["title"] == "מרק עדשים"
    assert received == ["full page text"]


def test_cost_gate_returns_gemma_recipe_when_confident(monkeypatch):
    _mark_gemma_warm(monkeypatch)
    monkeypatch.setattr(settings, "AI_PREFILTER_CONFIDENCE_THRESHOLD", 0.85)
    monkeypatch.setattr(
        router,
        "_run_gemma_prefilter",
        lambda _: router.PrefilterResult(0.91, _recipe(), "short extract"),
    )

    def fallback(_):
        raise AssertionError("fallback called")

    result = router.extract_recipe_with_cost_gate("full page text", fallback)

    assert result["title"] == "מרק עדשים"


def test_cost_gate_sends_compact_text_to_strong_fallback(monkeypatch):
    _mark_gemma_warm(monkeypatch)
    monkeypatch.setattr(settings, "AI_PREFILTER_MAX_FALLBACK_CHARS", 12)
    monkeypatch.setattr(settings, "AI_PREFILTER_CONFIDENCE_THRESHOLD", 0.85)
    monkeypatch.setattr(
        router,
        "_run_gemma_prefilter",
        lambda _: router.PrefilterResult(0.4, None, "only this recipe section"),
    )
    received = []

    router.extract_recipe_with_cost_gate(
        "full page text", lambda text: received.append(text) or _recipe()
    )

    assert received == ["only this re"]


def test_cost_gate_falls_back_when_gemma_recipe_is_invalid(monkeypatch):
    _mark_gemma_warm(monkeypatch)
    monkeypatch.setattr(settings, "AI_PREFILTER_CONFIDENCE_THRESHOLD", 0.85)
    monkeypatch.setattr(
        router,
        "_run_gemma_prefilter",
        lambda _: router.PrefilterResult(0.99, None, "compact context"),
    )
    received = []

    router.extract_recipe_with_cost_gate(
        "full page text", lambda text: received.append(text) or _recipe("fallback")
    )

    assert received == ["compact context"]


def test_cost_gate_skips_gemma_when_serverless_worker_is_not_known_warm(monkeypatch):
    monkeypatch.setattr(settings, "AI_PREFILTER_ENABLED", True)
    monkeypatch.setattr(settings, "GEMMA_BASE_URL", "https://gemma.example/v1")
    monkeypatch.setattr(settings, "GEMMA_ASSUME_WARM", False)
    received = []

    monkeypatch.setattr(
        router,
        "_run_gemma_prefilter",
        lambda _: (_ for _ in ()).throw(AssertionError("Gemma should not be called cold")),
    )

    router.extract_recipe_with_cost_gate(
        "full page text", lambda text: received.append(text) or _recipe()
    )

    assert received == ["full page text"]


def test_cost_gate_uses_gemma_after_a_recent_success(monkeypatch):
    _mark_gemma_warm(monkeypatch)
    monkeypatch.setattr(
        router,
        "_run_gemma_prefilter",
        lambda _: router.PrefilterResult(0.91, _recipe("Gemma"), "short extract"),
    )

    result = router.extract_recipe_with_cost_gate("full page text", lambda _: _recipe())

    assert result["title"] == "Gemma"
