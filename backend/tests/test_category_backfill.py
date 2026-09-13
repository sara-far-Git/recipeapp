from sqlalchemy import create_engine, text
from app.core.category_backfill import backfill_categories


def test_backfill_is_guarded_and_repeatable():
    engine = create_engine('sqlite://')
    with engine.begin() as conn:
        conn.execute(text('CREATE TABLE recipes (id INTEGER, title TEXT, category TEXT)'))
        for row in [(1, 'עוגת שוקולד קלאסית', None), (2, 'טרמיסו ריבת חלב', 'מאפים'), (3, 'Different recipe', None)]:
            conn.execute(text('INSERT INTO recipes VALUES (:id, :title, :category)'), dict(zip(['id', 'title', 'category'], row)))
        backfill_categories(conn)
        backfill_categories(conn)
        assert conn.execute(text('SELECT category FROM recipes ORDER BY id')).scalars().all() == ['קינוחים', 'מאפים', None]
