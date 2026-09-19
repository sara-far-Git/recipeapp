#!/usr/bin/env python3
"""ייבוא מתכונים מקובץ JSON לאתר.

מריצים את זה מהמחשב, והוא שולח את המתכונים לשרת דרך אותה דלת שבה האתר
משתמש. זה חשוב: השרת בודק את המתכון, ממלא ברירות מחדל, ומעדכן את המונים —
דברים שכתיבה ישירה למסד הנתונים הייתה מדלגת עליהם ומשאירה מתכון שהאתר לא
יודע להציג.

    python import_recipes.py recipes.json                 # לשרת החי
    python import_recipes.py recipes.json --dry-run       # רק בדיקה, בלי לשלוח
    python import_recipes.py recipes.json --api http://localhost:8000

הסיסמה נשאלת בזמן ההרצה ולא נשמרת בשום מקום. אפשר גם להגדיר מראש
RECIPE_TOKEN ואז לא תישאל בכלל.
"""
import argparse
import getpass
import http.client
import json
import os
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

LIVE_API = "https://recipeapp-backend-iwn0.onrender.com"
CATEGORIES = {"ראשונות", "עיקריות", "מאפים", "קינוחים", "סלטים", "משקאות"}
DIFFICULTIES = {"easy", "medium", "hard"}
KOSHER = {"meat", "dairy", "pareve", "non_kosher"}


# A dropped connection is not an answer, and the free tier drops them: the
# server sleeps when idle, and a long run keeps meeting it half awake. These
# used to escape the per-recipe error handling below and kill the whole run —
# which is how one import stopped at 89 of 93 with no failure reported.
TRANSIENT = (http.client.HTTPException, socket.timeout, urllib.error.URLError, ConnectionError)
RETRY_CODES = {429, 500, 502, 503, 504}


def _post_once(url, payload, token=None, form=False):
    if form:
        body = urllib.parse.urlencode(payload).encode()
        ctype = "application/x-www-form-urlencoded"
    else:
        body = json.dumps(payload, ensure_ascii=False).encode()
        ctype = "application/json"
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", ctype)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    # The server sleeps when idle and takes most of a minute to wake.
    with urllib.request.urlopen(req, timeout=90) as res:
        return json.loads(res.read().decode())


def _post(url, payload, token=None, form=False, tries=4):
    """Same call, but a sleeping server costs a wait instead of the run.

    Only the answers that can change on their own are retried. A 400 or a 401
    means the request itself is wrong, and sending it again would just be
    wrong more slowly.
    """
    for attempt in range(1, tries + 1):
        try:
            return _post_once(url, payload, token=token, form=form)
        except urllib.error.HTTPError as e:
            if e.code not in RETRY_CODES or attempt == tries:
                raise
            reason = f"{e.code}"
        except TRANSIENT as e:
            if attempt == tries:
                raise
            reason = type(e).__name__
        wait = 5 * attempt
        print(f"    השרת לא ענה ({reason}) — ניסיון {attempt + 1} מתוך {tries} בעוד {wait} שניות",
              file=sys.stderr)
        time.sleep(wait)


def login(api, email, password):
    data = _post(f"{api}/api/v1/auth/login",
                 {"username": email, "password": password}, form=True)
    return data["access_token"]


def check(recipe, i):
    """כל מה שלא בסדר במתכון אחד, כרשימה — עדיף לראות הכול בבת אחת."""
    problems = []
    title = str(recipe.get("title", "")).strip()
    if not title:
        problems.append("חסרה כותרת")

    cat = recipe.get("category")
    if cat and cat not in CATEGORIES:
        problems.append(f"קטגוריה לא מוכרת: {cat!r} (אפשר: {', '.join(CATEGORIES)})")

    diff = recipe.get("difficulty", "medium")
    if diff not in DIFFICULTIES:
        problems.append(f"רמת קושי לא מוכרת: {diff!r} (אפשר: {', '.join(DIFFICULTIES)})")

    kosher = recipe.get("kosher_type")
    if kosher and kosher not in KOSHER:
        problems.append(f"כשרות לא מוכרת: {kosher!r} (אפשר: {', '.join(KOSHER)})")

    ings = recipe.get("ingredients") or []
    if not ings:
        problems.append("אין מצרכים")
    for n, ing in enumerate(ings, 1):
        if not str(ing.get("name", "")).strip():
            problems.append(f"מצרך {n} בלי שם")
        # A heading between ingredients carries no amount, and that is fine.
        if not ing.get("note") and ing.get("amount") is not None:
            try:
                float(ing["amount"])
            except (TypeError, ValueError):
                problems.append(f"מצרך {n}: כמות שאינה מספר ({ing['amount']!r})")

    steps = recipe.get("instructions") or []
    if not steps:
        problems.append("אין שלבי הכנה")
    for n, st in enumerate(steps, 1):
        if not str(st.get("text", "")).strip():
            problems.append(f"שלב {n} בלי טקסט")

    return [f"מתכון {i} ({title or 'ללא כותרת'}): {p}" for p in problems]


def normalise(recipe):
    """משלים את מה שאפשר להשלים לבד, כדי שהקובץ יישאר קצר לכתיבה."""
    out = dict(recipe)
    out.setdefault("servings", 4)
    out.setdefault("difficulty", "medium")
    ings = []
    for ing in out.get("ingredients") or []:
        row = {"name": str(ing["name"]).strip(), "note": bool(ing.get("note"))}
        if not row["note"]:
            row["amount"] = float(ing["amount"]) if ing.get("amount") is not None else None
            row["unit"] = ing.get("unit") or None
        ings.append(row)
    out["ingredients"] = ings
    # Numbering the steps is the script's job, not something to type by hand.
    out["instructions"] = [
        {"step": n, "text": str(st["text"]).strip()}
        for n, st in enumerate(out.get("instructions") or [], 1)
    ]
    return out


def main():
    ap = argparse.ArgumentParser(description="ייבוא מתכונים מקובץ JSON")
    ap.add_argument("file", help="קובץ JSON עם רשימת מתכונים")
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--dry-run", action="store_true", help="רק לבדוק, בלי לשלוח")
    args = ap.parse_args()

    try:
        recipes = json.loads(open(args.file, encoding="utf-8").read())
    except json.JSONDecodeError as e:
        sys.exit(f"הקובץ אינו JSON תקין — שורה {e.lineno}, תו {e.colno}: {e.msg}")
    if isinstance(recipes, dict):
        recipes = [recipes]

    # Everything is checked before anything is sent, so a bad file cannot
    # leave half the recipes uploaded.
    problems = [p for i, r in enumerate(recipes, 1) for p in check(r, i)]
    if problems:
        print(f"נמצאו {len(problems)} בעיות — שום דבר לא נשלח:\n", file=sys.stderr)
        for p in problems:
            print("  •", p, file=sys.stderr)
        sys.exit(1)

    print(f"{len(recipes)} מתכונים, כולם תקינים.")
    if args.dry_run:
        print("--dry-run — לא נשלח כלום.")
        return

    token = os.environ.get("RECIPE_TOKEN")
    if not token:
        email = input("אימייל: ").strip()
        password = getpass.getpass("סיסמה (לא מוצגת ולא נשמרת): ")
        try:
            token = login(args.api, email, password)
        except urllib.error.HTTPError as e:
            sys.exit("ההתחברות נכשלה — אימייל או סיסמה שגויים."
                     if e.code == 401 else f"ההתחברות נכשלה: {e}")

    ok, failed = 0, []
    for i, recipe in enumerate(recipes, 1):
        title = recipe.get("title", "")
        try:
            data = _post(f"{args.api}/api/v1/recipes", normalise(recipe), token=token)
            print(f"  [{i}/{len(recipes)}] {title} → /recipe/{data['id']}")
            ok += 1
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:200]
            print(f"  [{i}/{len(recipes)}] {title} — נכשל: {e.code} {detail}", file=sys.stderr)
            failed.append(title)
        # One recipe the server never answered for must not end the run and
        # take every recipe after it down with it.
        except TRANSIENT as e:
            print(f"  [{i}/{len(recipes)}] {title} — נכשל: אין תשובה מהשרת ({type(e).__name__})",
                  file=sys.stderr)
            failed.append(title)

    print(f"\nנוספו {ok} מתוך {len(recipes)}.")
    if failed:
        print("נכשלו: " + ", ".join(failed), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
