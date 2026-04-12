# 🍳 RecipeApp — Monorepo

רשת חברתית למתכונים | Full-Stack Monorepo

## מבנה הפרויקט

```
recipeapp/
├── backend/          # FastAPI + PostgreSQL
├── frontend/         # Next.js 14 (App Router)
├── docs/             # תיעוד ואפיון
├── docker-compose.yml
└── README.md
```

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Backend API | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 + Alembic |
| Frontend Web | Next.js 14 (App Router) |
| Mobile | React Native (Expo) — שלב ב' |
| Auth | JWT (python-jose) |
| Storage | AWS S3 / Cloudinary |
| AI | OpenAI / Gemini API |

## התחלה מהירה (Local Dev)

### דרישות מוקדמות
- Docker & Docker Compose
- Python 3.12+
- Node.js 20+

### הרצה מקומית

```bash
# 1. העתקת קובץ הסביבה
cp .env.example .env

# 2. הרצת כל הסרביסים
docker compose up -d

# 3. הרצת מיגרציות
cd backend && alembic upgrade head

# 4. Frontend בנפרד (dev mode)
cd frontend && npm install && npm run dev
```

### גישה לשירותים
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5050

## Branch Strategy

```
main          ← production-ready
develop       ← integration branch
feature/*     ← פיצ'רים חדשים
fix/*         ← תיקוני באגים
```

## תרומה לפרויקט

1. צור branch מ-`develop`
2. כתוב קוד + טסטים
3. פתח Pull Request ל-`develop`
