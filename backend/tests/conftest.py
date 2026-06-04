import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
import os
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import get_session
import models

# Use a clean SQLite file database for testing
DATABASE_URL = "sqlite:///test_db.sqlite"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

@pytest.fixture(name="session", scope="function")
def session_fixture():
    # Create all tables in the clean database
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    # Drop all tables after the test function finishes
    SQLModel.metadata.drop_all(engine)
    # Clean up test database file if it exists
    try:
        if os.path.exists("test_db.sqlite"):
            os.remove("test_db.sqlite")
    except Exception:
        pass


@pytest.fixture(name="client", scope="function")
def client_fixture(session):
    def override_get_session():
        yield session

    # Override the database session dependency
    app.dependency_overrides[get_session] = override_get_session
    
    with TestClient(app) as client:
        yield client
        
    # Clean up overrides after test
    app.dependency_overrides.clear()
