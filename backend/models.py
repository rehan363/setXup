from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# User (T012 — US1)
# Stores registered user accounts. Password field holds bcrypt hash only.
# ---------------------------------------------------------------------------
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str = Field()  # bcrypt-hashed — never store plaintext
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


# ---------------------------------------------------------------------------
# Task (T007 — updated for T012 alignment with data-model.md)
# user_id is an int FK to users.id; title/description have length constraints.
# ---------------------------------------------------------------------------
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(default=None)

