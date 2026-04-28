"""Recipe URL importer.

Given a public URL, fetch the page, extract a recipe, and return it in the
same shape that /scan returns — so the frontend can reuse the existing
"new recipe" wizard for both flows.

Strategy:
  1. Fetch the HTML server-side (avoids CORS, hides the user's IP).
  2. Look for JSON-LD structured data (https://schema.org/Recipe). Most major
     recipe sites publish this — when present, we parse it directly without
     hitting the AI API. Fast & free.
  3. If JSON-LD is missing or malformed, fall back to OpenAI: send the
     cleaned page text and ask for the same JSON shape the scan endpoint
     uses.
"""
from __future__ import annotations

import json
from typing import Any, Optional

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, HttpUrl

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.recipe import ScanResponse

router = APIRouter(prefix="/import", tags=["import"])

USER_AGENT = (
    "Mozilla/5.0 (compatible; RecipeAppBot/1.0; "
    "+https://github.com/sara-far-Git/recipeapp)"
)
MAX_BYTES = 2 * 1024 * 1024  # 2 MB cap on fetched page size

DIFFICULTY_MAP = {"easy": "easy", "medium": "medium", "hard": "hard"}
KOSHER_VALUES = {"meat", "dairy", "pareve", "non_kosher"}


class ImportRequest(BaseModel):
    url: HttpUrl


# ---------------------------------------------------------------------------
# JSON-LD extraction
# ---------------------------------------------------------------------------
def _iter_jsonld_blobs(soup: BeautifulSoup):
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        text = tag.string or tag.get_text() or ""
        if not text.strip():
            continue
        try:
            yield json.loads(text)
        except (json.JSONDecodeError, ValueError):
            continue


def _find_recipe_obj(blob: Any) -> Optional[dict]:
    """Walk a JSON-LD blob and return the first Recipe object."""
    if isinstance(blob, list):
        for item in blob:
            found = _find_recipe_obj(item)
            if found:
                return found
        return None
    if not isinstance(blob, dict):
        return None
    t = blob.get("@type")
    types = t if isinstance(t, list) else [t]
    if any(isinstance(x, str) and "Recipe" in x for x in types):
        return blob
    if "@graph" in blob:
        return _find_recipe_obj(blob["@graph"])
    return None


def _parse_iso_duration_minutes(value: Optional[str]) -> Optional[int]:
    """Parse an ISO-8601 duration like 'PT1H30M' into total minutes."""
    if not isinstance(value, str) or not value.startswith("PT"):
        return None
    hours = minutes = 0
    rest = value[2:]
    num = ""
    for ch in rest:
        if ch.isdigit():
            num += ch
        elif ch == "H":
            hours = int(num or 0); num = ""
        elif ch == "M":
            minutes = int(num or 0); num = ""
        else:
            num = ""
    total = hours * 60 + minutes
    return total or None


def _coerce_str_list(value: Any) -> list[str]:
    """Recipe ingredients/instructions can be a string, list of strings,
    or list of {text}/{name} objects. Normalize to a list of strings."""
    if value is None:
        return []
    if isinstance(value, str):
        return [s.strip() for s in value.splitlines() if s.strip()]
    out = []
    for item in value if isinstance(value, list) else [value]:
        if isinstance(item, str):
            if item.strip():
                out.append(item.strip())
        elif isinstance(item, dict):
            txt = item.get("text") or item.get("name") or ""
            if isinstance(txt, str) and txt.strip():
                out.append(txt.strip())
            elif "itemListElement" in item:
                out.extend(_coerce_str_list(item["itemListElement"]))
    return out


def _split_amount(line: str) -> dict:
    """Heuristic: split a free-form ingredient line into {amount, unit, name}.

    Examples:
        "2 cups flour" -> {amount: 2, unit: "cups", name: "flour"}
        "1/2 כוס שמן"  -> {amount: 0.5, unit: "כוס", name: "שמן"}
        "salt"          -> {amount: 0, unit: "", name: "salt"}
    """
    parts = line.split(None, 2)
    amount: float = 0
    unit = ""
    name = line

    if parts:
        token = parts[0]
        # Handle "1/2" fractions
        if "/" in token:
            try:
                num, den = token.split("/", 1)
                amount = float(num) / float(den)
                parts.pop(0)
            except (ValueError, ZeroDivisionError):
                amount = 0
        else:
            try:
                amount = float(token)
                parts.pop(0)
            except ValueError:
                amount = 0

    # If we successfully consumed a quantity token, the next short token is unit
    if amount and parts:
        candidate = parts[0]
        if len(candidate) <= 12:  # short → likely a unit
            unit = candidate
            parts.pop(0)
        name = " ".join(parts).strip() or candidate
    elif amount:
        name = " ".join(parts).strip() or line
    else:
        name = line

    return {"amount": amount, "unit": unit, "name": name}


def _parse_jsonld_recipe(recipe: dict) -> dict:
    """Convert a schema.org Recipe dict into our ScanResponse shape."""
    title = recipe.get("name") or "מתכון מיובא"
    description = recipe.get("description")
    if isinstance(description, str):
        description = description.strip() or None

    image = recipe.get("image")
    if isinstance(image, dict):
        image = image.get("url")
    elif isinstance(image, list) and image:
        first = image[0]
        image = first.get("url") if isinstance(first, dict) else first

    prep = _parse_iso_duration_minutes(recipe.get("prepTime"))
    cook = _parse_iso_duration_minutes(recipe.get("cookTime"))

    yield_value = recipe.get("recipeYield")
    servings = None
    if isinstance(yield_value, list) and yield_value:
        yield_value = yield_value[0]
    if isinstance(yield_value, (int, float)):
        servings = int(yield_value)
    elif isinstance(yield_value, str):
        digits = "".join(ch for ch in yield_value if ch.isdigit())
        servings = int(digits) if digits else None

    ingredients_raw = _coerce_str_list(recipe.get("recipeIngredient"))
    ingredients = [_split_amount(line) for line in ingredients_raw]

    steps_raw = _coerce_str_list(recipe.get("recipeInstructions"))
    instructions = [{"step": i + 1, "text": t} for i, t in enumerate(steps_raw)]

    return {
        "title": title,
        "description": description,
        "prep_time_minutes": prep,
        "cook_time_minutes": cook,
        "servings": servings,
        "difficulty": None,
        "kosher_type": None,
        "ingredients": ingredients,
        "instructions": instructions,
        "image_url": image if isinstance(image, str) else None,
    }


# ---------------------------------------------------------------------------
# AI fallback
# ---------------------------------------------------------------------------
AI_PROMPT = """Extract a structured recipe from this web page text.
Return ONLY valid JSON (no markdown), with these fields:
{
  "title": "string",
  "description": "string or null",
  "prep_time_minutes": integer or null,
  "cook_time_minutes": integer or null,
  "servings": integer or null,
  "difficulty": "easy" | "medium" | "hard" or null,
  "kosher_type": "meat" | "dairy" | "pareve" | "non_kosher" or null,
  "ingredients": [{"amount": number, "unit": "string or null", "name": "string"}],
  "instructions": [{"step": integer, "text": "string"}]
}
Keep the original language (Hebrew if Hebrew). If a value is unknown, use null.
"""


def _extract_with_ai(page_text: str) -> dict:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Could not parse the page and AI fallback is not configured",
        )
    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # cheaper for plain text
            messages=[
                {"role": "system", "content": AI_PROMPT},
                {"role": "user", "content": page_text[:14000]},
            ],
            max_tokens=2000,
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.post("", response_model=ScanResponse)
@limiter.limit(settings.RATE_LIMIT_AI)
async def import_from_url(
    request: Request,
    payload: ImportRequest,
    current_user: User = Depends(get_current_user),
):
    url = str(payload.url)

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"},
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            content = resp.content[:MAX_BYTES]
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {exc}")

    soup = BeautifulSoup(content, "lxml")

    # Try JSON-LD first
    for blob in _iter_jsonld_blobs(soup):
        recipe = _find_recipe_obj(blob)
        if recipe:
            data = _parse_jsonld_recipe(recipe)
            data.pop("image_url", None)  # ScanResponse may not include it
            try:
                return ScanResponse(**data)
            except Exception:
                # Schema mismatch — fall through to AI
                break

    # AI fallback — clean text-only view of the page
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()
    text = " ".join(soup.get_text(separator=" ").split())
    if len(text) < 80:
        raise HTTPException(status_code=422, detail="Page contains too little text to parse")

    data = _extract_with_ai(text)
    return ScanResponse(**data)
