#!/usr/bin/env python3
"""מצרף למתכונים באתר תמונות מקובץ מקומי, לפי כותרת.

    python attach_local_images.py ~/Downloads/"תמונות חוברות/manifest.json"
    python attach_local_images.py <manifest> --dry-run

המניפסט הוא JSON פשוט: כותרת המתכון -> נתיב לקובץ תמונה.

    { "קרקרים לפסח": "/Users/.../קרקרים לפסח.jpg", ... }

התמונה מועלית לאחסון של האתר דרך אותה נקודת קצה שהאתר משתמש בה, כך שהיא
מוקטנת, מומרת ל-WebP, ומקבלת כתובת באותו דומיין. מתכון שכבר יש לו תמונה
מדולג, ולכן אפשר להריץ שוב.

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
import uuid

LIVE_API = "https://recipeapp-backend-iwn0.onrender.com"
TRANSIENT = (http.client.HTTPException, socket.timeout, urllib.error.URLError, ConnectionError)
# 429 is deliberately not here. The upload limit is counted by the hour, so
# waiting fifteen seconds and asking again cannot help — it only turns a clear
# stop into a long one. It is raised to the caller, which stops the run.
RETRY_CODES = {500, 502, 503, 504}
TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
         ".webp": "image/webp", ".gif": "image/gif"}


def _once(url, data=None, token=None, method="GET", content_type=None):
    req = urllib.request.Request(url, data=data, method=method)
    if content_type:
        req.add_header("Content-Type", content_type)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=120) as res:
        body = res.read()
        return json.loads(body.decode()) if body.strip() else None


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


def multipart(filename, content_type, blob):
    boundary = uuid.uuid4().hex
    body = b"".join([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="file"; filename="photo{os.path.splitext(filename)[1]}"\r\n'.encode(),
        f"Content-Type: {content_type}\r\n\r\n".encode(),
        blob, b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    return body, f"multipart/form-data; boundary={boundary}"


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
    ap = argparse.ArgumentParser(description="צירוף תמונות מקומיות למתכונים")
    ap.add_argument("manifest", help="JSON של כותרת -> נתיב תמונה")
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--dry-run", action="store_true", help="רק להראות, בלי לשנות")
    ap.add_argument("--replace", action="store_true",
                    help="להחליף גם תמונה קיימת (ברירת המחדל: לדלג עליה)")
    args = ap.parse_args()

    manifest = json.load(open(args.manifest, encoding="utf-8"))
    missing = [t for t, p in manifest.items() if not os.path.isfile(p)]
    if missing:
        print(f"{len(missing)} קבצים במניפסט אינם קיימים — למשל {missing[0]}", file=sys.stderr)
        sys.exit(1)
    print(f"{len(manifest)} תמונות במניפסט.")

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
    # Skipping what already has a photo is what makes a second run cheap after
    # the hourly allowance runs out. --replace is for the other case: a photo
    # that went up and turned out to be the wrong one to show.
    todo = [r for r in live
            if r["title"].strip() in manifest
            and (args.replace or not (r.get("image_url") or "").strip())]
    already = sum(1 for r in live
                  if r["title"].strip() in manifest and (r.get("image_url") or "").strip())
    unmatched = set(manifest) - {r["title"].strip() for r in live}

    print(f"מתאימים: {len(todo)}"
          + (f"   (ל-{already} כבר יש תמונה)" if already else "")
          + (f"   ({len(unmatched)} כותרות במניפסט לא נמצאו באתר)" if unmatched else ""))
    if args.dry_run:
        for r in todo[:10]:
            print(f"   id={r['id']:>4} {r['title'][:45]}")
        if len(todo) > 10:
            print(f"   … ועוד {len(todo) - 10}")
        print("\n--dry-run — לא שונה כלום.")
        return

    done = failed = 0
    for i, r in enumerate(todo, 1):
        path = manifest[r["title"].strip()]
        label = f"  [{i}/{len(todo)}] {r['title'][:40]}"
        try:
            blob = open(path, "rb").read()
            ctype = TYPES.get(os.path.splitext(path)[1].lower(), "image/jpeg")
            body, boundary = multipart(path, ctype, blob)
            url = call(f"{args.api}/api/v1/upload", body, token=token,
                       method="POST", content_type=boundary)["url"]
            call(f"{args.api}/api/v1/recipes/{r['id']}",
                 json.dumps({"image_url": url}).encode(),
                 token=token, method="PUT", content_type="application/json")
            print(f"{label} → {url}")
            done += 1
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:160]
            if e.code == 429:
                # The allowance is per hour. Everything after this would fail
                # the same way, so stop while the message is still useful.
                print(f"{label} — מגבלת קצב: {detail}", file=sys.stderr)
                print(f"\nצורפו {done} תמונות ונעצרנו במגבלת הקצב של ההעלאות.\n"
                      f"אפשר להריץ שוב בעוד שעה — מה שכבר עלה מדולג.\n"
                      f"כדי להעלות הרבה בבת אחת אפשר להגדיל זמנית את RATE_LIMIT_UPLOAD "
                      f"בהגדרות של רנדר, ולהחזיר אחר כך.", file=sys.stderr)
                sys.exit(1)
            print(f"{label} — נכשל: {e.code} {detail}", file=sys.stderr)
            failed += 1
        except (OSError, *TRANSIENT) as e:
            print(f"{label} — נכשל: {e}", file=sys.stderr)
            failed += 1

    print(f"\nצורפו {done} תמונות." + (f" {failed} נכשלו — אפשר להריץ שוב." if failed else ""))
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
