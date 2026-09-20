#!/usr/bin/env python3
"""מצרף למתכונים שהגיעו מהבלוג את התמונות שלהם.

    python attach_blog_images.py
    python attach_blog_images.py --dry-run

התמונה לא מקושרת מהבלוג אלא מועתקת לאחסון של האתר: הכתובת שהבלוג נותן
תלויה בכך שהבלוג ימשיך להתקיים, ו-Next.js ממילא חוסם תמונות מדומיינים שלא
אושרו מראש. נקודת הקצה של ההעלאה מקטינה, ממירה ל-WebP ומחזירה כתובת באותו
דומיין של האתר.

ההתאמה היא לפי כותרת, כמו בייבוא. מתכון שכבר יש לו תמונה מדולג, כך שאפשר
להריץ שוב בלי לשכפל.

צריך להתחבר עם החשבון שהמתכונים שייכים לו. הסיסמה נשאלת בזמן ההרצה ולא
נשמרת; אפשר גם להגדיר מראש RECIPE_TOKEN.
"""
import argparse
import getpass
import html
import http.client
import json
import os
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

LIVE_API = "https://recipeapp-backend-iwn0.onrender.com"
BLOG = "hbeckerblog.wordpress.com"
WP_API = f"https://public-api.wordpress.com/rest/v1.1/sites/{BLOG}/posts/"

TRANSIENT = (http.client.HTTPException, socket.timeout, urllib.error.URLError, ConnectionError)
RETRY_CODES = {429, 500, 502, 503, 504}

# The same trimming the import did, so the titles still line up.
PREFIX = re.compile(r"^(הדרכה מצולמת|המשך הדרכה)\s*[-–:.]*\s*|^מתכון צ'ופר;\s*")


def ascii_url(url: str) -> str:
    """A URL urllib can actually send.

    The blog names some of its uploads in Hebrew, and urllib puts the path on
    the wire as ASCII — an unescaped Hebrew filename raises before the request
    is ever made. Percent-encoding the path and query fixes it, and leaves a
    URL that is already encoded untouched.
    """
    parts = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((
        parts.scheme,
        parts.netloc.encode("idna").decode("ascii") if not parts.netloc.isascii() else parts.netloc,
        urllib.parse.quote(parts.path, safe="/%"),
        urllib.parse.quote(parts.query, safe="=&%?"),
        parts.fragment,
    ))


def _once(url, data=None, token=None, method="GET", content_type=None):
    req = urllib.request.Request(ascii_url(url), data=data, method=method)
    if content_type:
        req.add_header("Content-Type", content_type)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    req.add_header("User-Agent", "recipe-import/1.0")
    with urllib.request.urlopen(req, timeout=120) as res:
        body = res.read()
        ctype = res.headers.get("Content-Type", "")
        if "json" in ctype:
            return json.loads(body.decode())
        return body


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


def form(payload):
    return urllib.parse.urlencode(payload).encode(), "application/x-www-form-urlencoded"


def multipart(filename, content_type, blob):
    boundary = uuid.uuid4().hex
    body = b"".join([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode(),
        f"Content-Type: {content_type}\r\n\r\n".encode(),
        blob, b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    return body, f"multipart/form-data; boundary={boundary}"


def blog_posts():
    posts, page = [], 1
    while True:
        data = call(f"{WP_API}?number=100&page={page}")
        posts += data.get("posts", [])
        if not data.get("posts") or len(posts) >= data.get("found", 0):
            break
        page += 1
    return posts


def pick_image(post):
    """The post's own photograph, preferring the one it leads with."""
    featured = (post.get("featured_image") or "").strip()
    if featured:
        return featured
    for src in re.findall(r'<img[^>]+src="(https://[^"]+)"', post.get("content") or ""):
        # Emoji and avatars are not the dish.
        if any(bad in src for bad in ("gravatar", "/emoji/", "s.w.org", "pixel.wp.com")):
            continue
        return src
    return None


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
    ap = argparse.ArgumentParser(description="צירוף תמונות מהבלוג למתכונים באתר")
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    ap.add_argument("--dry-run", action="store_true", help="רק להראות, בלי לשנות")
    args = ap.parse_args()

    print("קורא את הבלוג …")
    by_title = {}
    for post in blog_posts():
        title = PREFIX.sub("", html.unescape(post["title"])).strip(" .…-–")
        image = pick_image(post)
        if title and image:
            by_title[title] = (image, post.get("URL"))
    print(f"  {len(by_title)} פוסטים עם תמונה.")

    token = os.environ.get("RECIPE_TOKEN")
    if not token and not args.dry_run:
        email = input("אימייל: ").strip()
        password = getpass.getpass("סיסמה (לא מוצגת ולא נשמרת): ")
        body, ctype = form({"username": email, "password": password})
        try:
            token = call(f"{args.api}/api/v1/auth/login", body,
                         method="POST", content_type=ctype)["access_token"]
        except urllib.error.HTTPError as e:
            sys.exit("ההתחברות נכשלה — אימייל או סיסמה שגויים."
                     if e.code == 401 else f"ההתחברות נכשלה: {e}")

    live = every_recipe(args.api, token)
    todo = [r for r in live
            if r["title"].strip() in by_title and not (r.get("image_url") or "").strip()]
    already = sum(1 for r in live
                  if r["title"].strip() in by_title and (r.get("image_url") or "").strip())

    print(f"\nמתאימים: {len(todo)}" + (f"   (ל-{already} כבר יש תמונה)" if already else ""))
    if args.dry_run:
        for r in todo:
            print(f"   id={r['id']:>4} {r['title'][:45]}")
        print("\n--dry-run — לא שונה כלום.")
        return

    done = failed = 0
    for i, r in enumerate(todo, 1):
        src, post_url = by_title[r["title"].strip()]
        label = f"  [{i}/{len(todo)}] {r['title'][:40]}"
        try:
            blob = call(src)
            if not isinstance(blob, bytes) or len(blob) < 1024:
                raise ValueError("הקובץ שהתקבל אינו תמונה")
            name = os.path.basename(urllib.parse.urlparse(src).path) or "photo.jpg"
            ext = name.rsplit(".", 1)[-1].lower()
            ctype = {"png": "image/png", "webp": "image/webp",
                     "gif": "image/gif"}.get(ext, "image/jpeg")
            body, boundary = multipart(name, ctype, blob)
            url = call(f"{args.api}/api/v1/upload", body, token=token,
                       method="POST", content_type=boundary)["url"]
            # Where the photo came from. Who took it is not ours to assume, so
            # image_credit is left alone.
            call(f"{args.api}/api/v1/recipes/{r['id']}",
                 json.dumps({"image_url": url, "image_source": post_url},
                            ensure_ascii=False).encode(),
                 token=token, method="PUT", content_type="application/json")
            print(f"{label} → {url}")
            done += 1
        except urllib.error.HTTPError as e:
            print(f"{label} — נכשל: {e.code} {e.read().decode()[:160]}", file=sys.stderr)
            failed += 1
        except (ValueError, *TRANSIENT) as e:
            print(f"{label} — נכשל: {e}", file=sys.stderr)
            failed += 1

    print(f"\nצורפו {done} תמונות." + (f" {failed} נכשלו — אפשר להריץ שוב." if failed else ""))
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
