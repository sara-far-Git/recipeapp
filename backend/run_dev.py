"""Dev helper: create tables & start uvicorn."""
import os, sys
os.chdir(os.path.dirname(__file__))
sys.path.insert(0, ".")

from app.core.database import engine, Base
import app.models  # noqa – registers models

print("Creating database tables …")
Base.metadata.create_all(bind=engine)
print("Done.  Starting server on http://localhost:8000")

import uvicorn
uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
