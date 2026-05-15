import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session

# Load .env early so DATABASE_URL is available even when this module
# is imported before main.py calls load_dotenv().
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
