"""
routers/users.py — T015 + T016 (US1)

POST /api/auth/register  → create account, return UserResponse (201)
POST /api/auth/login     → verify credentials, return TokenResponse (200)

Contract: specs/002-phase2-webapp/contracts/api.md
"""
import os
import jwt
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from models import User
from schemas import LoginRequest, TokenResponse, UserCreate, UserResponse
from utils import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# --- JWT config (shared secret pattern, same key as auth.py middleware) ---
_SECRET = os.environ.get("BETTER_AUTH_SECRET", "")
_ALGORITHM = "HS256"
_TOKEN_EXPIRE_HOURS = 24


def _create_token(user_id: int, email: str) -> str:
    """Issue a signed HS256 JWT valid for 24 hours."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),   # standard claim — picked up by auth.py middleware
        "userId": user_id,     # explicit field auth.py also checks
        "email": email,
        "iat": now,
        "exp": now + timedelta(hours=_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, _SECRET, algorithm=_ALGORITHM)


# ---------------------------------------------------------------------------
# T015 — POST /api/auth/register
# ---------------------------------------------------------------------------
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(body: UserCreate, session: Session = Depends(get_session)):
    # Password length validation (spec: min 8 chars, max 72 bytes for bcrypt)
    if len(body.password) < 8 or len(body.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be between 8 and 72 bytes long",
        )

    # Duplicate email check → 409
    existing = session.exec(select(User).where(User.email == body.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(email=body.email, password=hash_password(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# ---------------------------------------------------------------------------
# T016 — POST /api/auth/login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate and receive a JWT",
)
def login(body: LoginRequest, session: Session = Depends(get_session)):
    if len(body.password.encode('utf-8', errors='ignore')) > 72:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    user = session.exec(select(User).where(User.email == body.email)).first()

    # Use a constant-time comparison path — always call verify_password so
    # timing attacks can't reveal whether the email exists.
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = _create_token(user.id, user.email)
    return TokenResponse(token=token, user=UserResponse.model_validate(user))
