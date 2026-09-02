"""Route recipe extraction through an optional low-cost prefilter.

The prefilter runs only when explicitly configured. Its output is either a
validated recipe or a compact, relevant excerpt for the stronger fallback
model. A prefilter failure never blocks the import flow.
"""
from __future__ import annotations

import json
import logging
from collections.abc import Callable
from dataclasses import dataclass
from threading import Lock
from time import monotonic
from typing import Any, Optional

from app.core.config import settings
from app.schemas.recipe import ScanResponse

logger = logging.getLogger(__name__)

PREFILTER_PROMPT = """You prefilter recipe web pages before a more expensive
recipe-extraction model. Return only valid JSON with this exact shape:
{
  "confidence": 0.0,
  "recipe": {
    "title": "string",
    "description": "string or null",
    "prep_time_minutes": "integer or null",
    "cook_time_minutes": "integer or null",
    "servings": "integer or null",
    "difficulty": "easy | medium | hard | null",
    "kosher_type": "meat | dairy | pareve | non_kosher | null",
    "ingredients": [{"amount": "number or null", "unit": "string or null", "name": "string"}],
    "instructions": [{"step": "integer", "text": "string"}]
  },
  "relevant_text": "short source-only extract with the recipe facts needed for a fallback",
  "missing_fields": ["field names that are uncertain or missing"]
}

Use the page's original language. Never invent ingredients or instructions.
Set confidence to 0.85 or higher only when the title and at least one
ingredient or instruction are clearly supported by the page. Keep
relevant_text factual and concise; it will be sent to another model only when
confidence is low.
"""


@dataclass(frozen=True)
class PrefilterResult:
    confidence: float
    recipe: Optional[dict[str, Any]]
    relevant_text: str


class _GemmaWarmWindow:
    """Tracks actual Gemma completions within this Render process.

    Runpod's health endpoint may be ready even after a scale-to-zero worker
    has stopped. A successful completion is the only signal we trust here.
    """

    def __init__(self) -> None:
        self._last_success_at: float | None = None
        self._lock = Lock()

    def is_open(self) -> bool:
        window = settings.GEMMA_WARM_WINDOW_SECONDS
        if window <= 0:
            return False
        with self._lock:
            return (
                self._last_success_at is not None
                and monotonic() - self._last_success_at < window
            )

    def record_success(self) -> None:
        with self._lock:
            self._last_success_at = monotonic()

    def clear(self) -> None:
        with self._lock:
            self._last_success_at = None


_gemma_warm_window = _GemmaWarmWindow()


def _strip_json_fence(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        return text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return text


def _valid_recipe(value: Any) -> Optional[dict[str, Any]]:
    if not isinstance(value, dict):
        return None
    try:
        recipe = ScanResponse.model_validate(value)
    except Exception:
        return None

    if not recipe.title.strip() or not (recipe.ingredients or recipe.instructions):
        return None
    return recipe.model_dump(mode="json")


def _parse_prefilter_response(raw: str | None) -> Optional[PrefilterResult]:
    if not raw:
        return None
    try:
        value = json.loads(_strip_json_fence(raw))
    except (json.JSONDecodeError, IndexError):
        return None
    if not isinstance(value, dict):
        return None

    try:
        confidence = float(value.get("confidence", 0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = min(1.0, max(0.0, confidence))

    relevant_text = value.get("relevant_text", "")
    if not isinstance(relevant_text, str):
        relevant_text = ""
    return PrefilterResult(
        confidence=confidence,
        recipe=_valid_recipe(value.get("recipe")),
        relevant_text=relevant_text.strip(),
    )


def _prefilter_is_configured() -> bool:
    return bool(settings.AI_PREFILTER_ENABLED and settings.GEMMA_BASE_URL)


def _gemma_is_known_warm() -> bool:
    """Avoid cold-starting a scale-to-zero worker from a user request."""
    return settings.GEMMA_ASSUME_WARM or _gemma_warm_window.is_open()


def _run_gemma_prefilter(page_text: str) -> Optional[PrefilterResult]:
    """Call a local OpenAI-compatible Gemma endpoint, if configured."""
    if not _prefilter_is_configured():
        return None

    try:
        from openai import OpenAI

        client = OpenAI(
            base_url=settings.GEMMA_BASE_URL,
            api_key=settings.GEMMA_API_KEY or "local",
            timeout=settings.GEMMA_WARM_REQUEST_TIMEOUT_SECONDS,
        )
        response = client.chat.completions.create(
            model=settings.GEMMA_MODEL,
            messages=[
                {"role": "system", "content": PREFILTER_PROMPT},
                {
                    "role": "user",
                    "content": page_text[:settings.AI_PREFILTER_MAX_INPUT_CHARS],
                },
            ],
            max_tokens=1800,
            temperature=0,
        )
        _gemma_warm_window.record_success()
        return _parse_prefilter_response(response.choices[0].message.content)
    except Exception:
        logger.warning("Gemma recipe prefilter failed; using strong fallback", exc_info=True)
        return None


def _fallback_context(result: Optional[PrefilterResult], original_text: str) -> str:
    if result and result.relevant_text:
        return result.relevant_text[:settings.AI_PREFILTER_MAX_FALLBACK_CHARS]
    return original_text


def extract_recipe_with_cost_gate(
    page_text: str,
    strong_extractor: Callable[[str], dict[str, Any]],
) -> dict[str, Any]:
    """Use Gemma only in an active warm window; otherwise return OpenAI fast."""
    gemma_attempted = _prefilter_is_configured() and _gemma_is_known_warm()
    prefilter = _run_gemma_prefilter(page_text) if gemma_attempted else None
    threshold = settings.AI_PREFILTER_CONFIDENCE_THRESHOLD

    if prefilter and prefilter.recipe and prefilter.confidence >= threshold:
        logger.info(
            "recipe_ai_route=gemma confidence=%.2f source_chars=%d",
            prefilter.confidence,
            len(page_text),
        )
        return prefilter.recipe

    fallback_text = _fallback_context(prefilter, page_text)
    logger.info(
        "recipe_ai_route=strong_fallback gemma_attempted=%s prefilter=%s confidence=%s source_chars=%d fallback_chars=%d",
        gemma_attempted,
        bool(prefilter),
        f"{prefilter.confidence:.2f}" if prefilter else "none",
        len(page_text),
        len(fallback_text),
    )
    return strong_extractor(fallback_text)
