import os
import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from database import get_session
from models import User

load_dotenv()

security = HTTPBearer()

SECRET_KEY = os.environ.get("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")
ALGORITHM = "HS256"


def _decode_user_id(credentials: HTTPAuthorizationCredentials) -> str:
    """Decode and validate the JWT, returning the raw user_id string."""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_aud": False}
        )
        # Our JWT (issued in routers/users.py) puts the id in both 'sub' and 'userId'
        user_id = payload.get("userId") or payload.get("sub") or payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        return str(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """FastAPI dependency — returns user_id as str."""
    return _decode_user_id(credentials)


def get_current_user_id_int(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> int:
    """FastAPI dependency — returns user_id as int (for FK lookups on Task)."""
    raw = _decode_user_id(credentials)
    try:
        return int(raw)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid user ID in token")


def get_current_user(
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
) -> User:
    """FastAPI dependency — returns User model instance."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


