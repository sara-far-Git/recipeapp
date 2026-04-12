# RecipeApp — רשת חברתית למתכונים

Full-Stack Monorepo | Web + Mobile + API

## מבנה הפרויקט

```
recipeapp/
├── backend/            # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/v1/endpoints/   # auth, recipes, users, search, scan, upload
│   │   ├── core/               # config, database, security
│   │   ├── models/             # SQLAlchemy models
│   │   └── schemas/            # Pydantic schemas
│   └── alembic/                # DB migrations
├── frontend/           # Next.js 14 (App Router, RTL Hebrew)
│   ├── app/            # Pages: feed, login, register, recipe, profile, search
│   ├── components/     # UI, layout, recipe components
│   └── lib/            # API client, auth store, utils
├── mobile/             # React Native (Expo) — iOS + Android
│   ├── app/            # Expo Router screens + tabs
│   ├── components/     # Native UI components
│   └── lib/            # API client, auth store (SecureStore), theme
├── docker-compose.yml
└── .env.example
```

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Backend API | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 + Alembic |
| Frontend Web | Next.js 14 (App Router, Tailwind CSS) |
| Mobile App | React Native (Expo SDK 52, Expo Router) |
| State Management | Zustand |
| Auth | JWT (python-jose + bcrypt) |
| Storage | AWS S3 / Cloudinary |
| AI Scanner | OpenAI GPT-4o Vision API |

## פיצ'רים

- **הרשמה והתחברות** — אימייל + סיסמה, JWT tokens
- **יצירת מתכונים** — אשף 3 שלבים (metadata, מצרכים, הוראות)
- **השף הדיגיטלי** — סריקת מתכון מתמונה באמצעות AI
- **פיד מרכזי** — גלילה אינסופית עם כרטיסי מתכונים
- **מצב בישול** — תצוגה מוגדלת עם Wake Lock ומעקב שלבים
- **מחשבון כמויות** — התאמת מצרכים לפי מספר סועדים
- **לייקים, שמירה, תגובות** — אינטראקציה חברתית מלאה
- **מערכת עוקבים** — Follow/Unfollow
- **פרופיל משתמש** — מתכונים, שמורים, עוקבים
- **חיפוש מתקדם** — טקסט חופשי + סינון לפי קושי, כשרות, זמן הכנה
- **דיווח תגובות** — דיווח על תגובות פוגעניות
- **RTL מלא** — ממשק עברי מותאם

## התחלה מהירה

### דרישות מוקדמות
- Docker & Docker Compose
- Python 3.12+
- Node.js 20+

### הרצה מקומית

```bash
# 1. העתקת קובץ הסביבה
cp .env.example .env
# ערכו את .env עם הערכים שלכם

# 2. הרצת כל הסרביסים
docker compose up -d

# 3. הרצת מיגרציות (בתוך הקונטיינר או מקומית)
cd backend && alembic revision --autogenerate -m "initial" && alembic upgrade head

# 4. Frontend בנפרד (dev mode)
cd frontend && npm install && npm run dev
```

### הרצת אפליקציית מובייל

```bash
cd mobile && npm install && npx expo start
```

אז:
- **iOS Simulator**: לחצו `i` בטרמינל
- **Android Emulator**: לחצו `a` בטרמינל
- **מכשיר פיזי**: סרקו QR code עם אפליקציית Expo Go

### גישה לשירותים
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5050

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | הרשמת משתמש |
| POST | `/api/v1/auth/login` | התחברות |
| GET | `/api/v1/recipes` | פיד מתכונים |
| POST | `/api/v1/recipes` | יצירת מתכון |
| GET | `/api/v1/recipes/:id` | פרטי מתכון |
| PUT | `/api/v1/recipes/:id` | עדכון מתכון |
| DELETE | `/api/v1/recipes/:id` | מחיקת מתכון |
| POST | `/api/v1/recipes/:id/like` | Toggle like |
| POST | `/api/v1/recipes/:id/save` | Toggle save |
| GET/POST | `/api/v1/recipes/:id/comments` | תגובות |
| GET | `/api/v1/users/me` | הפרופיל שלי |
| PUT | `/api/v1/users/me` | עדכון פרופיל |
| GET | `/api/v1/users/:username` | פרופיל ציבורי |
| POST | `/api/v1/users/:username/follow` | Toggle follow |
| GET | `/api/v1/search?q=...` | חיפוש מתכונים |
| POST | `/api/v1/scan` | סריקת מתכון מתמונה (AI) |
| POST | `/api/v1/upload` | העלאת תמונה |
