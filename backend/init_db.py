"""
T011: Database Initialization Script
Run this once to create all SQLModel tables in Neon Postgres.
Usage: uv run python init_db.py
"""
from dotenv import load_dotenv
load_dotenv()

from sqlmodel import SQLModel
from database import engine
import models  # noqa: F401 — import models so SQLModel registers the tables

def init_db():
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("[OK] Tables created successfully.")

if __name__ == "__main__":
    init_db()
