#!/usr/bin/env python3
"""הוספת תגית לקבוצת מתכונים שכבר נמצאים באתר.

    python tag_recipes.py "מתכוני פסח.json" פסח
    python tag_recipes.py "מתכוני פסח.json" פסח --dry-run

הקובץ הוא אותו קובץ ייבוא ששימש להעלאה — התאמה נעשית לפי הכותרת, כך שאין
צורך לזכור מספרים. מתכון שכבר נושא את התגית לא נגוע שוב.

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


# Tagging a booklet is dozens of calls in a row against a server that sleeps
# when idle, so some of them meet it half awake and get no answer at all.
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
    """Same call, retried only where retrying can help.

    A 401 or a 404 will say the same thing however many times it is asked;
    a dropped connection or a waking server will not.
    """
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
    ap = argparse.ArgumentParser(description="הוספת תגית למתכונים שכבר באתר")
    ap.add_argument("file", help="קובץ הייבוא ששימש להעלאה")
    ap.add_argument("tag", help='התגית, למשל "פסח"')
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--dry-run", action="store_true", help="רק להראות, בלי לשנות")
    args = ap.parse_args()

    wanted = {r["title"].strip() for r in json.load(open(args.file, encoding="utf-8"))}
    print(f"{len(wanted)} כותרות בקובץ.")

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

    live = every_recipe(args.api, token)
    hits = [r for r in live if r["title"].strip() in wanted]
    missing = wanted - {r["title"].strip() for r in live}

    print(f"נמצאו באתר: {len(hits)}")
    if missing:
        print(f"לא נמצאו: {len(missing)} — {', '.join(sorted(missing)[:5])}"
              + (" ..." if len(missing) > 5 else ""))
    if args.dry_run:
        print("--dry-run — לא שונה כלום.")
        return

    changed = skipped = failed = 0
    for i, r in enumerate(hits, 1):
        tags = list(r.get("tags") or [])
        if args.tag in tags:
            skipped += 1
            continue
        tags.append(args.tag)
        try:
            call(f"{args.api}/api/v1/recipes/{r['id']}", {"tags": tags},
                 token=token, method="PUT")
            changed += 1
            print(f"  [{i}/{len(hits)}] {r['title']}")
        except urllib.error.HTTPError as e:
            failed += 1
            print(f"  [{i}/{len(hits)}] {r['title']} — נכשל: {e.code}", file=sys.stderr)
        # One recipe the server never answered for must not end the run with
        # the rest of the booklet still untagged.
        except TRANSIENT as e:
            failed += 1
            print(f"  [{i}/{len(hits)}] {r['title']} — נכשל: אין תשובה מהשרת ({type(e).__name__})",
                  file=sys.stderr)

    print(f'\nסומנו {changed} מתכונים בתגית "{args.tag}".'
          + (f" {skipped} כבר היו מסומנים." if skipped else ""))
    if failed:
        print(f"{failed} נכשלו — אפשר להריץ שוב, מה שכבר סומן יידלג.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
