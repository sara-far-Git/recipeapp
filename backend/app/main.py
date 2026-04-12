from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import auth, recipes, users, search, scan, upload, collections, shopping, suggest

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = list(settings.ALLOWED_ORIGINS)
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [auth.router, recipes.router, users.router, search.router, scan.router, upload.router, collections.router, shopping.router, suggest.router]:
    app.include_router(r, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
