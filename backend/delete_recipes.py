#!/usr/bin/env python3
"""מחיקת מתכונים כפולים מהאתר, לפי מספר.

    python delete_recipes.py 235 236 237 238
    python delete_recipes.py 235 236 237 238 --dry-run

מחיקה היא לצמיתות. לכן הסקריפט מוחק רק מתכון שהוא כפילות מוכחת: חייב
להיות באתר מתכון אחר עם אותה כותרת ואותו תוכן בדיוק — אותם מצרכים ואותם
שלבים. מתכון יחיד, או מתכון שרק הכותרת שלו זהה, לא יימחק גם אם התבקש.

מתכון שיש עליו לייקים, שמירות או תגובות לא יימחק בלי --force, כי המחיקה
לוקחת אותם איתו.

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
    with urllib.request.urlopen(req, timeout=90) as res:
        body = res.read().decode()
        return json.loads(body) if body.strip() else None


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


def signature(recipe):
    """What makes two recipes the same recipe, rather than the same name."""
    return (
        recipe["title"].strip(),
        recipe.get("category"),
        tuple((str(i.get("name", "")).strip(), i.get("amount"), i.get("unit"))
              for i in (recipe.get("ingredients") or [])),
        tuple(str(s.get("text", "")).strip()
              for s in (recipe.get("instructions") or [])),
    )


def main():
    ap = argparse.ArgumentParser(description="מחיקת מתכונים כפולים")
    ap.add_argument("ids", nargs="+", type=int, help="מספרי המתכונים למחיקה")
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--dry-run", action="store_true", help="רק להראות, בלי למחוק")
    ap.add_argument("--force", action="store_true",
                    help="למחוק גם מתכון שיש עליו לייקים, שמירות או תגובות")
    args = ap.parse_args()

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

    listing = every_recipe(args.api, token)
    full = {}
    for item in listing:
        if item["id"] in args.ids or item["title"].strip() in {
            r["title"].strip() for r in listing if r["id"] in args.ids
        }:
            full[item["id"]] = call(f"{args.api}/api/v1/recipes/{item['id']}", token=token)

    approved, refused = [], []
    for rid in args.ids:
        target = full.get(rid)
        if not target:
            refused.append((rid, "לא נמצא באתר"))
            continue
        twins = [r for i, r in full.items()
                 if i != rid and signature(r) == signature(target)]
        if not twins:
            refused.append((rid, f"אין לו כפילות — \"{target['title']}\" יחיד באתר"))
            continue
        engagement = (target.get("likes_count", 0) + target.get("saves_count", 0)
                      + target.get("comments_count", 0))
        if engagement and not args.force:
            refused.append((rid, f"יש עליו {engagement} לייקים/שמירות/תגובות (אפשר --force)"))
            continue
        approved.append((rid, target["title"], sorted(i for i in full if i != rid
                                                      and signature(full[i]) == signature(target))))

    for rid, title, twins in approved:
        print(f"  למחיקה: id={rid} \"{title}\"  (נשאר: {', '.join(map(str, twins))})")
    for rid, why in refused:
        print(f"  לא יימחק: id={rid} — {why}", file=sys.stderr)

    if not approved:
        sys.exit("\nאין מה למחוק.")
    if args.dry_run:
        print("\n--dry-run — לא נמחק כלום.")
        return

    print(f"\nהמחיקה היא לצמיתות. {len(approved)} מתכונים.")
    if input('כדי להמשיך יש להקליד "מחק": ').strip() != "מחק":
        sys.exit("בוטל.")

    ok = 0
    for rid, title, _ in approved:
        try:
            call(f"{args.api}/api/v1/recipes/{rid}", token=token, method="DELETE")
            print(f"  נמחק id={rid} {title}")
            ok += 1
        except urllib.error.HTTPError as e:
            print(f"  id={rid} נכשל: {e.code} {e.read().decode()[:200]}", file=sys.stderr)
        except TRANSIENT as e:
            print(f"  id={rid} נכשל: אין תשובה מהשרת ({type(e).__name__})", file=sys.stderr)

    print(f"\nנמחקו {ok} מתוך {len(approved)}.")
    if ok != len(approved):
        sys.exit(1)


if __name__ == "__main__":
    main()
