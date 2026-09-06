import base64
import io
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from app.core.config import settings
from app.core.limiter import limiter, paying_key
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
  "ingredients": [{"amount": number or null, "unit": "string or null", "name": "string"}],
  "instructions": [{"step": integer, "text": "string"}]
}

IMPORTANT — amount conversion rules:
- Convert ALL written fractions and Hebrew fraction words to decimal numbers:
  חצי / 1/2 → 0.5
  שליש / 1/3 → 0.33
  רבע / 1/4 → 0.25
  שני שליש / 2/3 → 0.67
  שלושה רבע / 3/4 → 0.75
  שליש וחצי / 1.5/3 → 0.5
  1 וחצי / 1½ → 1.5
  2 וחצי / 2½ → 2.5
  וכן הלאה לכל שבר מורכב.
- If the amount is vague (קורט, לפי הטעם, מעט, לפי הצורך, לפי הטעם) → set amount to null.
- Extract ALL ingredients and ALL steps without skipping any.
- If the recipe is in Hebrew, keep the text in Hebrew.
- If a value cannot be determined, use null."""

VOICE_PROMPT = """You are a recipe extraction assistant. A home cook described a recipe out loud.
The transcript is informal spoken Hebrew — hesitations, repeats, and missing amounts are normal.

Turn the transcript into structured recipe data.
Return ONLY valid JSON (no markdown, no explanation) with these fields:
{
  "title": "string",
  "description": "short description string or null",
  "prep_time_minutes": integer or null,
  "cook_time_minutes": integer or null,
  "servings": integer or null,
  "difficulty": "easy" | "medium" | "hard" or null,
  "kosher_type": "meat" | "dairy" | "pareve" | "non_kosher" or null,
  "ingredients": [{"amount": number or null, "unit": "string or null", "name": "string"}],
  "instructions": [{"step": integer, "text": "string"}]
}

IMPORTANT — amount conversion rules:
- Convert ALL written fractions and Hebrew fraction words to decimal numbers:
  חצי / 1/2 → 0.5
  שליש / 1/3 → 0.33
  רבע / 1/4 → 0.25
  שני שליש / 2/3 → 0.67
  שלושה רבע / 3/4 → 0.75
  1 וחצי / 1½ → 1.5
- If the amount is vague (קורט, לפי הטעם, מעט, לפי הצורך) → set amount to null.
- Infer a reasonable title if they never said one.
- Keep the text in Hebrew.
- If a value cannot be determined, use null.

TRANSCRIPT:
"""

AUDIO_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/m4a",
    "audio/x-m4a",
    "audio/aac",
    "video/webm",
    "video/mp4",
}

AUDIO_EXT = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/wave": ".wav",
    "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/aac": ".aac",
    "video/webm": ".webm",
    "video/mp4": ".mp4",
}


def _parse_recipe_json(raw: str | None, empty_detail: str) -> ScanResponse:
    if not raw:
        raise HTTPException(status_code=502, detail="AI returned empty response")
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    parsed = ScanResponse(**json.loads(text))

    # A recipe with no name, no ingredients and no steps is a well-formed answer
    # to a question the model could not actually answer — silent audio, a blurred
    # photo. Returning it 200 lets the page announce success over an empty form,
    # so it is refused here and the caller gets something to say.
    if not parsed.title.strip() and not parsed.ingredients and not parsed.instructions:
        raise HTTPException(status_code=422, detail=empty_detail)
    return parsed


@router.post("", response_model=ScanResponse)
@limiter.limit(settings.RATE_LIMIT_AI, key_func=paying_key)
async def scan_recipe_image(
    request: Request,
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
        return _parse_recipe_json(
            response.choices[0].message.content,
            "לא הצלחנו לקרוא מתכון מהתמונה. נסו תמונה ברורה יותר, עם כל הטקסט בתוך הפריים.",
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")


@router.post("/voice", response_model=ScanResponse)
@limiter.limit(settings.RATE_LIMIT_AI, key_func=paying_key)
async def transcribe_recipe_voice(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI scanning is not configured")

    ctype = (file.content_type or "").split(";")[0].strip().lower()
    if ctype not in AUDIO_TYPES:
        name = (file.filename or "").lower()
        for suffix, mapped in (
            (".webm", "audio/webm"),
            (".m4a", "audio/mp4"),
            (".mp4", "audio/mp4"),
            (".mp3", "audio/mpeg"),
            (".wav", "audio/wav"),
            (".ogg", "audio/ogg"),
        ):
            if name.endswith(suffix):
                ctype = mapped
                break
    if ctype not in AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="יש להעלות קובץ שמע")

    contents = await file.read()
    if len(contents) < 800:
        raise HTTPException(status_code=400, detail="ההקלטה קצרה מדי")
    if len(contents) > 24 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="ההקלטה חייבת להיות עד 24MB")

    ext = AUDIO_EXT.get(ctype, ".webm")
    audio = io.BytesIO(contents)
    audio.name = f"recipe{ext}"

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio,
            language="he",
        )
        spoken = (transcript.text or "").strip()
        if len(spoken) < 8:
            raise HTTPException(status_code=400, detail="לא הצלחנו להבין את ההקלטה. נסו שוב, לאט יותר.")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": VOICE_PROMPT + spoken}],
            max_tokens=2000,
            temperature=0.1,
        )
        # Quoting what was heard back is the fastest way to tell a bad recording
        # (silence, the wrong microphone) apart from a recording that simply
        # never named ingredients or steps.
        heard = spoken[:70] + ("…" if len(spoken) > 70 else "")
        return _parse_recipe_json(
            response.choices[0].message.content,
            "לא הצלחנו לחלץ מתכון מההקלטה. ספרו שוב, לאט וברור, עם המצרכים ושלבי ההכנה. "
            f"מה שנשמע בהקלטה: “{heard}”",
        )

    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
