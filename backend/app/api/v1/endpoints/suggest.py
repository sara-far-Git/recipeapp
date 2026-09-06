import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import String, cast, or_
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.config import settings
from app.core.limiter import limiter, paying_key
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.recipe import Recipe, visible_to
from app.schemas.recipe import AISuggestRequest, RecipeListItem
from typing import Optional

router = APIRouter(prefix="/suggest", tags=["suggest"])


def _like(value: str) -> str:
    """A contains-pattern with the wildcards spelled out rather than obeyed."""
    escaped = value.replace("!", "!!").replace("%", "!%").replace("_", "!_")
    return f"%{escaped}%"


def _ingredient_patterns(word: str) -> list[str]:
    """Both spellings of an ingredient.

    The JSON serializer writes ASCII, so a column holding "דבש" actually reads
    "\u05d3\u05d1\u05e9" once cast back to text. Searching for the word as
    typed therefore matched nothing in Hebrew at all. Rows written either way
    are matched by looking for both.
    """
    plain = word.strip()
    if not plain:
        return []
    escaped = json.dumps(plain)[1:-1]
    return [plain] if escaped == plain else [plain, escaped]


@router.post("/from-ingredients", response_model=list[RecipeListItem])
@limiter.limit(settings.RATE_LIMIT_SEARCH, key_func=paying_key)
def suggest_from_ingredients(
    request: Request,
    data: AISuggestRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Search existing recipes that match the given ingredients."""
    if not data.ingredients:
        raise HTTPException(status_code=400, detail="Provide at least one ingredient")

    query = db.query(Recipe).filter(visible_to(current_user)).options(joinedload(Recipe.author))

    # Whether the ingredients array holds the word, read off the cast text.
    # PostgreSQL JSON containment would be ideal, but for MVP we use ILIKE.
    conditions = []
    for ing in data.ingredients[:10]:  # limit to 10
        for pattern in _ingredient_patterns(ing):
            conditions.append(
                cast(Recipe.ingredients, String).ilike(_like(pattern), escape="!")
            )

    if conditions:
        query = query.filter(or_(*conditions))

    recipes = query.order_by(Recipe.likes_count.desc()).limit(20).all()

    liked_ids = set()
    saved_ids = set()
    if current_user:
        liked_ids = {l.recipe_id for l in current_user.likes}
        saved_ids = {s.recipe_id for s in current_user.saved_recipes}

    for r in recipes:
        r.author.followers_count = len(r.author.followers)
        r.author.following_count = len(r.author.following)
        r.author.recipes_count = len(r.author.recipes)
        r.is_liked = r.id in liked_ids
        r.is_saved = r.id in saved_ids

    return recipes


@router.post("/ai-generate")
@limiter.limit(settings.RATE_LIMIT_AI, key_func=paying_key)
async def ai_generate_from_ingredients(
    request: Request,
    data: AISuggestRequest,
    current_user: User = Depends(get_current_user),
):
    """Use AI to generate recipe suggestions from available ingredients."""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI not configured")

    if not data.ingredients:
        raise HTTPException(status_code=400, detail="Provide at least one ingredient")

    ingredients_text = ", ".join(data.ingredients)

    prompt = f"""Given these available ingredients: {ingredients_text}

Suggest 3 recipes that can be made primarily with these ingredients.
For each recipe, return a JSON array with objects containing:
- "title": recipe name (in Hebrew)
- "description": short description (in Hebrew)
- "difficulty": "easy", "medium", or "hard"
- "prep_time_minutes": estimated time
- "ingredients_needed": list of ingredient names from the provided list
- "extra_ingredients": list of any additional ingredients needed

Return ONLY valid JSON array, no markdown or explanation."""

    try:
        from openai import OpenAI
        import json

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.7,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        suggestions = json.loads(raw)
        return {"suggestions": suggestions}

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {str(e)}")
