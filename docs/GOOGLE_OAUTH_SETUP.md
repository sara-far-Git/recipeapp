# הגדרת Google OAuth — מדריך

המסמך הזה עובר צעד-צעד על מה שצריך כדי שכפתור "התחברות עם Google" יעבוד.
הקוד עצמו כבר מחובר בצד שרת (`/api/v1/auth/google`) ובצד לקוח (`GoogleSignInButton`).
מה שחסר זה רק להוציא Client ID מ-Google Cloud ולהדביק אותו במשתני סביבה.

## 1. יצירת פרויקט ב-Google Cloud

1. גשו ל-[Google Cloud Console](https://console.cloud.google.com/)
2. לחצו על ה-dropdown של הפרויקטים בראש העמוד → **New Project**
3. תנו לפרויקט שם (למשל `RecipeApp`) ולחצו **Create**

## 2. הגדרת OAuth Consent Screen

1. בתפריט הצד: **APIs & Services → OAuth consent screen**
2. בחרו **External** ולחצו **Create**
3. מלאו:
   - **App name**: RecipeApp
   - **User support email**: האימייל שלכם
   - **Developer contact**: האימייל שלכם
4. **Save and Continue** דרך כל המסכים — לא צריך להוסיף scopes נוספים בשלב הזה
5. ב-**Test users** הוסיפו את האימיילים שתרצו לבדוק איתם

## 3. יצירת OAuth Client ID

1. בתפריט הצד: **APIs & Services → Credentials**
2. לחצו **+ Create Credentials → OAuth client ID**
3. בחרו **Application type: Web application**
4. תנו שם (למשל `RecipeApp Web`)
5. תחת **Authorized JavaScript origins** הוסיפו את כל הדומיינים שמהם הכפתור ייטען:
   - `http://localhost:3000` (לפיתוח מקומי)
   - `https://recipeapp-frontend.onrender.com` (או הדומיין שלכם ב-Render)
6. **Authorized redirect URIs** ניתן להשאיר ריק — אנחנו משתמשים ב-id_token flow ולא ב-redirect flow
7. לחצו **Create**
8. תקבלו **Client ID** ו-**Client Secret**. אנחנו צריכים רק את ה-Client ID

## 4. הזנת ה-Client ID במשתני הסביבה

### מקומית — קובץ `.env` בתיקיית הפרויקט

```bash
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

ה-`NEXT_PUBLIC_` חייב להיות זהה — הפרונטנד צריך לראות את ה-Client ID כדי לאתחל את ה-SDK של Google.

### ב-Render

1. נכנסים ל-`recipeapp-backend` → **Environment** → מוסיפים `GOOGLE_CLIENT_ID`
2. נכנסים ל-`recipeapp-frontend` → **Environment** → מוסיפים `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
3. לחצו **Save Changes** — Render יבצע redeploy אוטומטי

## 5. בדיקה

אחרי ה-deploy, פתחו את עמוד ההתחברות. אם ה-Client ID מוגדר נכון תראו את כפתור Google.
אם לא, הכפתור פשוט לא ייטען (מתוכנן ככה — לא רוצים build נופל בגלל קונפיג חסר).

## איך זה עובד מאחורי הקלעים

1. המשתמש לוחץ על הכפתור → Google מציג חלון התחברות
2. אחרי אישור, Google מחזיר `id_token` (JWT חתום) לפרונטנד
3. הפרונטנד שולח אותו ל-`POST /api/v1/auth/google`
4. הבק-אנד מאמת את החתימה של Google מול ה-Client ID, מאשר שה-issuer הוא Google, ושכתובת המייל מאומתת
5. אם המשתמש כבר קיים (מתוצאת `google_id` או `email`) הוא מתחבר. אחרת — נוצר משתמש חדש
6. הבק-אנד מנפיק JWT משלו (אותו פורמט של `/auth/login` הרגיל) שמאוחסן ב-localStorage

## הצמדת חשבון קיים

אם משתמש קיים שנרשם עם סיסמה מתחבר עם אותה כתובת מייל דרך Google — אנחנו מצמידים אוטומטית את החשבון:
- `google_id` נשמר על המשתמש הקיים
- `auth_provider` משתנה מ-`local` ל-`hybrid`
- מעכשיו הוא יכול להתחבר גם עם סיסמה וגם עם Google
