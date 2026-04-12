from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.schemas.recipe import AISuggestRequest, RecipeListItem
from typing import Optional

router = APIRouter(prefix="/suggest", tags=["suggest"])


@router.post("/from-ingredients", response_model=list[RecipeListItem])
def suggest_from_ingredients(
    data: AISuggestRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Search existing recipes that match the given ingredients."""
    if not data.ingredients:
        raise HTTPException(status_code=400, detail="Provide at least one ingredient")

    query = db.query(Recipe).filter(Recipe.is_published == True).options(joinedload(Recipe.author))

    # For each ingredient, check if it appears in the JSON ingredients array
    # PostgreSQL JSON containment would be ideal, but for MVP we use ILIKE on the cast
    from sqlalchemy import cast, String
    conditions = []
    for ing in data.ingredients[:10]:  # limit to 10
        pattern = f"%{ing.strip().lower()}%"
        conditions.append(cast(Recipe.ingredients, String).ilike(pattern))

    from sqlalchemy import or_
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
async def ai_generate_from_ingredients(
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
