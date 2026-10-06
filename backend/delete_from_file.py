#!/usr/bin/env python3
"""מחיקת כל המתכונים שהגיעו מקובץ ייבוא מסוים.

    python delete_from_file.py "מהבלוג - העני בקר.json" --dry-run
    python delete_from_file.py "מהבלוג - העני בקר.json"

ההתאמה לפי כותרת מדויקת, בין הקובץ לבין מה שבאתר. מתכונים שהכותרת שלהם
תוקנה אחרי הייבוא (קובץ "תיקון כותרות" עם _was) נמצאים דרך --renamed:

    python delete_from_file.py "מתכוני פסח - העני בקר.json" --renamed "תיקון כותרות.json"

ההרצה היבשה מדפיסה את
הרשימה המלאה של מה שיימחק; ההרצה האמיתית דורשת הקלדת המילה "מחק".

מחיקה היא לצמיתות. התמונות שהועלו למתכונים האלה נשארות באחסון ואינן
נמחקות כאן.

צריך להתחבר עם החשבון שהמתכונים שייכים לו. הסיסמה נשאלת בזמן ההרצה ולא
נשמרת; אפשר גם להגדיר מראש RECIPE_TOKEN.
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
TRANSIENT = (http.client.HTTPException, socket.timeout, urllib.error.URLError, ConnectionError)
RETRY_CODES = {500, 502, 503, 504}


def _once(url, data=None, token=None, method="GET", content_type=None):
    req = urllib.request.Request(url, data=data, method=method)
    if content_type:
        req.add_header("Content-Type", content_type)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=120) as res:
        body = res.read().decode()
        return json.loads(body) if body.strip() else None


def call(url, data=None, token=None, method="GET", content_type=None, tries=4):
    for attempt in range(1, tries + 1):
        try:
            return _once(url, data, token, method, content_type)
        except urllib.error.HTTPError as e:
            if e.code not in RETRY_CODES or attempt == tries:
                raise
            reason = str(e.code)
        except TRANSIENT as e:
            if attempt == tries:
                raise
            reason = type(e).__name__
        wait = 5 * attempt
        print(f"    אין תשובה ({reason}) — ניסיון {attempt + 1} בעוד {wait} שניות", file=sys.stderr)
        time.sleep(wait)


def every_recipe(api, token):
    out, skip = [], 0
    while True:
        page = call(f"{api}/api/v1/recipes?skip={skip}&limit=100", token=token)
        if not page:
            break
        out += page
        skip += len(page)
        if len(page) < 100:
            break
    return out


def main():
    ap = argparse.ArgumentParser(description="מחיקת מתכונים לפי קובץ ייבוא")
    ap.add_argument("file", help="קובץ הייבוא שהמתכונים הגיעו ממנו")
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--renamed", help="קובץ תיקון כותרות (id/_was/title) — כותרות ששונו אחרי הייבוא")
    ap.add_argument("--dry-run", action="store_true", help="רק להראות, בלי למחוק")
    args = ap.parse_args()

    wanted = {r["title"].strip() for r in json.load(open(args.file, encoding="utf-8"))}
    print(f"{len(wanted)} כותרות בקובץ.")
    if args.renamed:
        renamed = [r for r in json.load(open(args.renamed, encoding="utf-8"))
                   if r.get("_was", "").strip() in wanted]
        wanted -= {r["_was"].strip() for r in renamed}
        wanted |= {r["title"].strip() for r in renamed}
        print(f"{len(renamed)} מהן קיבלו כותרת חדשה אחרי הייבוא — נכללות לפי הכותרת החדשה.")

    token = os.environ.get("RECIPE_TOKEN")
    if not token and not args.dry_run:
        email = input("אימייל: ").strip()
        password = getpass.getpass("סיסמה (לא מוצגת ולא נשמרת): ")
        body = urllib.parse.urlencode({"username": email, "password": password}).encode()
        try:
            token = call(f"{args.api}/api/v1/auth/login", body, method="POST",
                         content_type="application/x-www-form-urlencoded")["access_token"]
        except urllib.error.HTTPError as e:
            sys.exit("ההתחברות נכשלה — אימייל או סיסמה שגויים."
                     if e.code == 401 else f"ההתחברות נכשלה: {e}")

    live = every_recipe(args.api, token)
    hits = [r for r in live if r["title"].strip() in wanted]
    missing = wanted - {r["title"].strip() for r in hits}

    print(f"נמצאו באתר: {len(hits)}" + (f"   (לא נמצאו: {len(missing)})" if missing else ""))
    for r in sorted(hits, key=lambda x: x["id"]):
        owner = (r.get("author") or {}).get("username", "?")
        print(f"  id={r['id']:>4}  {r['title'][:50]:<50}  ({owner})")
    if not hits:
        sys.exit("\nאין מה למחוק.")
    if args.dry_run:
        print("\n--dry-run — לא נמחק כלום.")
        return

    print(f"\nהמחיקה היא לצמיתות. {len(hits)} מתכונים.")
    if input('כדי להמשיך יש להקליד "מחק": ').strip() != "מחק":
        sys.exit("בוטל.")

    ok = failed = 0
    for i, r in enumerate(sorted(hits, key=lambda x: x["id"]), 1):
        try:
            call(f"{args.api}/api/v1/recipes/{r['id']}", token=token, method="DELETE")
            print(f"  [{i}/{len(hits)}] נמחק id={r['id']} {r['title'][:40]}")
            ok += 1
        except urllib.error.HTTPError as e:
            print(f"  [{i}/{len(hits)}] id={r['id']} נכשל: {e.code}"
                  + (" — לא המתכון של החשבון הזה" if e.code == 403 else ""), file=sys.stderr)
            failed += 1
        except TRANSIENT as e:
            print(f"  [{i}/{len(hits)}] id={r['id']} נכשל: אין תשובה ({type(e).__name__})", file=sys.stderr)
            failed += 1

    print(f"\nנמחקו {ok} מתוך {len(hits)}." + (f" {failed} נכשלו — אפשר להריץ שוב." if failed else ""))
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
