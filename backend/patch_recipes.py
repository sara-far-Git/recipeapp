#!/usr/bin/env python3
"""תיקון מתכונים שכבר נמצאים באתר, לפי מספר.

    python patch_recipes.py "תיקון מתכונים פגומים.json"
    python patch_recipes.py "תיקון מתכונים פגומים.json" --dry-run

הקובץ הוא רשימה של אובייקטים, כל אחד עם "id" ועם השדות שמשתנים בלבד.
שדה שלא מופיע נשאר כמו שהוא. מפתח שמתחיל ב-"_" הוא הערה לקריאה ולא נשלח.

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
RETRY_CODES = {429, 500, 502, 503, 504}


def _call_once(url, payload=None, token=None, method="GET", form=False):
    data = None
    headers = {}
    if payload is not None:
        if form:
            data = urllib.parse.urlencode(payload).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(payload, ensure_ascii=False).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    # The server sleeps when idle and takes most of a minute to wake.
    with urllib.request.urlopen(req, timeout=90) as res:
        return json.loads(res.read().decode())


def call(url, payload=None, token=None, method="GET", form=False, tries=4):
    for attempt in range(1, tries + 1):
        try:
            return _call_once(url, payload, token=token, method=method, form=form)
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


def numbered(steps):
    """Numbering is the script's job, the same as on import."""
    return [{"step": n, "text": str(s["text"]).strip()}
            for n, s in enumerate(steps, 1)]


def main():
    ap = argparse.ArgumentParser(description="תיקון מתכונים קיימים לפי מספר")
    ap.add_argument("file", help="קובץ JSON עם id והשדות לשינוי")
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--dry-run", action="store_true", help="רק להראות, בלי לשנות")
    args = ap.parse_args()

    try:
        patches = json.loads(open(args.file, encoding="utf-8").read())
    except json.JSONDecodeError as e:
        sys.exit(f"הקובץ אינו JSON תקין — שורה {e.lineno}, תו {e.colno}: {e.msg}")
    if isinstance(patches, dict):
        patches = [patches]

    problems = [f"פריט {i}: חסר id" for i, p in enumerate(patches, 1) if not p.get("id")]
    if problems:
        sys.exit("\n".join(problems))

    print(f"{len(patches)} מתכונים לתיקון.\n")

    token = os.environ.get("RECIPE_TOKEN")
    if not token and not args.dry_run:
        email = input("אימייל: ").strip()
        password = getpass.getpass("סיסמה (לא מוצגת ולא נשמרת): ")
        try:
            token = call(f"{args.api}/api/v1/auth/login",
                         {"username": email, "password": password},
                         method="POST", form=True)["access_token"]
        except urllib.error.HTTPError as e:
            sys.exit("ההתחברות נכשלה — אימייל או סיסמה שגויים."
                     if e.code == 401 else f"ההתחברות נכשלה: {e}")

    ok, failed = 0, 0
    for i, patch in enumerate(patches, 1):
        rid = patch["id"]
        # Underscored keys are notes for whoever reads the file.
        body = {k: v for k, v in patch.items() if k != "id" and not k.startswith("_")}
        if "instructions" in body:
            body["instructions"] = numbered(body["instructions"])

        try:
            before = call(f"{args.api}/api/v1/recipes/{rid}", token=token)
        except (urllib.error.HTTPError, *TRANSIENT) as e:
            print(f"  [{i}/{len(patches)}] id={rid} — לא נמצא: {e}", file=sys.stderr)
            failed += 1
            continue

        title = before.get("title", "")
        changes = ", ".join(
            f"{k}: {len(before.get(k) or [])}→{len(v)}" if isinstance(v, list)
            else f"{k}" for k, v in body.items()
        )
        print(f"  [{i}/{len(patches)}] id={rid} {title} — {changes}")

        if args.dry_run:
            continue
        try:
            call(f"{args.api}/api/v1/recipes/{rid}", body, token=token, method="PUT")
            ok += 1
        except urllib.error.HTTPError as e:
            print(f"      נכשל: {e.code} {e.read().decode()[:200]}", file=sys.stderr)
            failed += 1
        except TRANSIENT as e:
            print(f"      נכשל: אין תשובה מהשרת ({type(e).__name__})", file=sys.stderr)
            failed += 1

    if args.dry_run:
        print("\n--dry-run — לא שונה כלום.")
        return
    print(f"\nתוקנו {ok} מתוך {len(patches)}.")
    if failed:
        print(f"{failed} נכשלו — אפשר להריץ שוב.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
