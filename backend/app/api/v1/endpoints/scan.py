import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.recipe import ScanResponse

router = APIRouter(prefix="/scan", tags=["scan"])

SCAN_PROMPT = """You are a recipe extraction assistant. Analyze the provided image of a recipe 
(from a cookbook, notebook, or magazine) and extract structured data.

Return ONLY valid JSON (no markdown, no explanation) with these fields:
{
  "title": "string",
  "description": "short description string or null",
  "prep_time_minutes": integer or null,
  "cook_time_minutes": integer or null,
  "servings": integer or null,
  "difficulty": "easy" | "medium" | "hard" or null,
  "kosher_type": "meat" | "dairy" | "pareve" | "non_kosher" or null,
  "ingredients": [{"amount": number, "unit": "string or null", "name": "string"}],
  "instructions": [{"step": integer, "text": "string"}]
}

Extract ALL ingredients and ALL steps. If the recipe is in Hebrew, keep the text in Hebrew.
If a value cannot be determined, use null."""


@router.post("", response_model=ScanResponse)
async def scan_recipe_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI scanning is not configured")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    b64 = base64.b64encode(contents).decode("utf-8")
    mime = file.content_type or "image/jpeg"

    try:
        from openai import OpenAI
        import json

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": SCAN_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64}"},
                        },
                    ],
                }
            ],
            max_tokens=2000,
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        data = json.loads(raw)
        return ScanResponse(**data)

    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
