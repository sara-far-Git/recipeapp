"""Assign reviewed categories only to the exact legacy recipes still missing one."""
from sqlalchemy import text

CATEGORIES = [
    (6, "נתחי סלמון בגריל עם חצי עגבניות שרי ובצל סגול", "עיקריות"),
    (3, "טרמיסו ריבת חלב", "קינוחים"),
    (2, "טרמיסו ריבת חלב", "קינוחים"),
    (1, "עוגת שוקולד קלאסית", "קינוחים"),
]


def backfill_categories(conn):
    for recipe_id, title, category in CATEGORIES:
        conn.execute(text(
            "UPDATE recipes SET category = :category "
            "WHERE id = :id AND title = :title AND (category IS NULL OR category = '')"
        ), {"id": recipe_id, "title": title, "category": category})
