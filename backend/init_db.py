"""Create all database tables."""
import os, sys
os.chdir(os.path.dirname(__file__))
sys.path.insert(0, ".")

from app.core.database import engine, Base
import app.models  # noqa – registers models

print("Creating database tables …")
Base.metadata.create_all(bind=engine)
print("Done — database ready.")
