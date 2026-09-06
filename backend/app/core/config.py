from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "RecipeApp"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # AI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_RECIPE_MODEL: str = "gpt-4o-mini"

    # Optional low-cost recipe prefilter. GEMMA_BASE_URL should point to an
    # OpenAI-compatible endpoint, such as Ollama or Runpod vLLM.
    AI_PREFILTER_ENABLED: bool = False
    GEMMA_BASE_URL: Optional[str] = None
    GEMMA_API_KEY: Optional[str] = None
    GEMMA_MODEL: str = "gemma3:4b"
    AI_PREFILTER_CONFIDENCE_THRESHOLD: float = 0.85
    AI_PREFILTER_MAX_INPUT_CHARS: int = 16000
    AI_PREFILTER_MAX_FALLBACK_CHARS: int = 5000
    # A serverless worker can report healthy while it is still cold. Only use
    # it immediately after a real completion, within its idle timeout.
    GEMMA_WARM_WINDOW_SECONDS: float = 50.0
    GEMMA_WARM_REQUEST_TIMEOUT_SECONDS: float = 15.0
    # For a local, always-running model only. Keep false for scale-to-zero.
    GEMMA_ASSUME_WARM: bool = False

    # Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"

    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    FRONTEND_URL: Optional[str] = None

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Monitoring (Sentry)
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1

    # Rate limiting (requests per minute per IP)
    RATE_LIMIT_LOGIN: str = "10/minute"
    RATE_LIMIT_REGISTER: str = "5/minute"
    # An hourly cap alone still allows 20 x 24 x 30 calls a month, and vision
    # and transcription are the expensive models — that arithmetic reaches four
    # figures for a single determined account. The daily cap is what actually
    # bounds the month; no ordinary cook comes near it.
    RATE_LIMIT_AI: str = "20/hour;60/day"
    RATE_LIMIT_SEARCH: str = "60/minute"
    RATE_LIMIT_UPLOAD: str = "40/hour"

    # Photos live in our own database, so an upload spends storage the way a
    # scan spends credit. One cook's whole book fits inside this many times
    # over; an abusive one cannot fill the disk.
    # Comma-separated addresses that may read the site's numbers. Empty means
    # nobody, which is the right default for a setting that grants access.
    ADMIN_EMAILS: str = ""

    MAX_IMAGES_PER_USER: int = 400
    MAX_IMAGE_BYTES_PER_USER: int = 120 * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
