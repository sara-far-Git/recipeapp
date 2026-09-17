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
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

LIVE_API = "https://recipeapp-backend-iwn0.onrender.com"


def call(url, payload=None, token=None, method="GET", form=False):
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

    changed = skipped = 0
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
            print(f"  [{i}/{len(hits)}] {r['title']} — נכשל: {e.code}", file=sys.stderr)

    print(f'\nסומנו {changed} מתכונים בתגית "{args.tag}".'
          + (f" {skipped} כבר היו מסומנים." if skipped else ""))


if __name__ == "__main__":
    main()
