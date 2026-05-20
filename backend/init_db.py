"""Create all database tables and apply lightweight idempotent migrations.

This script is run on container startup (see Dockerfile CMD). It:
  1. Calls Base.metadata.create_all — safe for fresh DBs.
  2. Applies any "soft" column additions for older deployments that
     already have a `users` table from before the OAuth columns existed.
     We add columns with IF NOT EXISTS / try-except so this is safe to
     run on every boot.
"""
import os, sys
os.chdir(os.path.dirname(__file__))
sys.path.insert(0, ".")

from sqlalchemy import text
from app.core.database import engine, Base
import app.models  # noqa – registers models

print("Creating database tables …")
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Lightweight idempotent migrations for previously-deployed schemas.
# These are no-ops on fresh databases (where create_all already added the
# columns) and on databases that already have them.
# ---------------------------------------------------------------------------
SOFT_MIGRATIONS = [
    # (table, column, ddl_to_add)
    ("users", "auth_provider",
     "ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local'"),
    ("users", "google_id",
     "ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"),
    ("recipes", "category",
     "ALTER TABLE recipes ADD COLUMN category VARCHAR(50)"),
]


def _has_column(conn, table: str, column: str) -> bool:
    dialect = conn.engine.dialect.name
    if dialect == "postgresql":
        sql = text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = :t AND column_name = :c"
        )
        return conn.execute(sql, {"t": table, "c": column}).first() is not None
    if dialect == "sqlite":
        rows = conn.execute(text(f"PRAGMA table_info({table})")).all()
        return any(r[1] == column for r in rows)
    # Unknown dialect — skip detection and let the ALTER decide.
    return False


with engine.begin() as conn:
    for table, column, ddl in SOFT_MIGRATIONS:
        try:
            if not _has_column(conn, table, column):
                print(f"  Adding column {table}.{column}")
                conn.execute(text(ddl))
        except Exception as exc:  # noqa: BLE001
            # Don't crash the boot for a migration we couldn't apply —
            # log it so it shows up in Render logs.
            print(f"  ! soft-migration failed for {table}.{column}: {exc}")

    # users.hashed_password used to be NOT NULL. Make it nullable so OAuth
    # users (no password) can be created. Postgres-only — sqlite ignores.
    try:
        if conn.engine.dialect.name == "postgresql":
            conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"))
    except Exception as exc:  # noqa: BLE001
        print(f"  ! could not relax hashed_password NOT NULL: {exc}")


# Helpful index on google_id for OAuth lookups
try:
    with engine.begin() as conn:
        if conn.engine.dialect.name == "postgresql":
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id "
                "ON users (google_id) WHERE google_id IS NOT NULL"
            ))
except Exception as exc:  # noqa: BLE001
    print(f"  ! could not create google_id index: {exc}")


print("Done — database ready.")
