"""
reset_db.py
===========
Drops all tables in Neon Postgres and recreates them from scratch to ensure
the schema is fully synchronized with our Phase II models.
Usage: uv run python reset_db.py
"""
import sys
from dotenv import load_dotenv
load_dotenv()

from sqlmodel import SQLModel
from database import engine
import models  # Import models so SQLModel registers all tables

def reset_database():
    print("WARNING: This will drop all tables in the database!")
    print("Dropping all tables...")
    try:
        SQLModel.metadata.drop_all(engine)
        print("[OK] All tables dropped.")
    except Exception as e:
        print(f"[ERROR] Failed to drop tables: {e}", file=sys.stderr)
        return

    print("Recreating all tables with the new schema...")
    try:
        SQLModel.metadata.create_all(engine)
        print("[OK] All tables recreated successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to recreate tables: {e}", file=sys.stderr)

if __name__ == "__main__":
    reset_database()
