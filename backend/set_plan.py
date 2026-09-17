#!/usr/bin/env python3
"""שינוי המסלול של חשבון באתר.

    python set_plan.py העני_בקר pro_plus
    python set_plan.py 6 pro_plus          # לפי מספר, כשהפרופיל פרטי
    python set_plan.py someone free

המסלולים:
    free      — ברירת המחדל
    pro       — פרופיל ציבורי, מכסת סריקות גדולה יותר
    pro_plus  — כל מה שב-pro, ובנוסף מתכונים מתפרסמים מיד

צריך להתחבר עם חשבון שכתובת המייל שלו רשומה ב-ADMIN_EMAILS בשרת. הסיסמה
נשאלת בזמן ההרצה ולא נשמרת; אפשר גם להגדיר מראש RECIPE_TOKEN.
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
PLANS = ("free", "pro", "pro_plus")


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


def main():
    ap = argparse.ArgumentParser(description="שינוי המסלול של חשבון")
    ap.add_argument("who", help="שם המשתמש באתר, או מספר המשתמש")
    ap.add_argument("plan", choices=PLANS)
    ap.add_argument("--api", default=os.environ.get("RECIPE_API", LIVE_API))
    args = ap.parse_args()

    token = os.environ.get("RECIPE_TOKEN")
    if not token:
        print("התחברות עם חשבון מנהל:")
        email = input("  אימייל: ").strip()
        password = getpass.getpass("  סיסמה (לא מוצגת ולא נשמרת): ")
        try:
            token = call(f"{args.api}/api/v1/auth/login",
                         {"username": email, "password": password},
                         method="POST", form=True)["access_token"]
        except urllib.error.HTTPError as e:
            sys.exit("ההתחברות נכשלה — אימייל או סיסמה שגויים."
                     if e.code == 401 else f"ההתחברות נכשלה: {e}")

    if args.who.isdigit():
        user_id = int(args.who)
    else:
        path = urllib.parse.quote(args.who, safe="")
        try:
            user_id = call(f"{args.api}/api/v1/users/{path}", token=token)["id"]
        except urllib.error.HTTPError as e:
            # A private profile answers 404 to everyone but its owner, and a
            # private profile is exactly the case this is usually run for.
            sys.exit(f"לא מצאתי את {args.who}. אם הפרופיל פרטי אי אפשר לחפש "
                     f"אותו לפי שם — צריך את מספר המשתמש. אפשר לקחת אותו "
                     f"מתוך מתכון שלו:\n"
                     f"  curl -s {args.api}/api/v1/recipes/<מספר> | grep -o '\"id\":[0-9]*'"
                     if e.code == 404 else f"החיפוש נכשל: {e}")

    try:
        out = call(f"{args.api}/api/v1/admin/users/{user_id}/plan",
                   {"plan": args.plan}, token=token, method="PUT")
    except urllib.error.HTTPError as e:
        sys.exit("החשבון שאיתו התחברת אינו מנהל — צריך כתובת שרשומה ב-ADMIN_EMAILS."
                 if e.code == 404 else f"השינוי נכשל: {e.code} {e.read().decode()[:200]}")

    print(f"\n{args.who} → {out['plan']}")
    if out["plan"] == "pro_plus":
        print("מעכשיו כל מתכון שהחשבון הזה שומר מתפרסם מיד.")
    if not out["public_profile"]:
        print("הפרופיל עדיין פרטי — מדליקים אותו מההגדרות של אותו חשבון.")


if __name__ == "__main__":
    main()
