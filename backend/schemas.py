from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---------------------------------------------------------------------------
# Auth Schemas (T013 — US1)
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    """Request body for POST /register"""
    email: EmailStr
    password: str  # min 8 chars enforced in the endpoint


class UserResponse(BaseModel):
    """Returned after register and embedded in TokenResponse"""
    id: int
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """Request body for POST /login"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Returned after successful login"""
    token: str
    user: UserResponse


# ---------------------------------------------------------------------------
# Task Schemas (T008 — updated to align with Task model changes in T012)
# ---------------------------------------------------------------------------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskRead(TaskBase):
    id: int
    user_id: int                        # int FK (was str, aligned with model)
    created_at: datetime
    updated_at: Optional[datetime]      # nullable — only set on first update

    model_config = {"from_attributes": True}

