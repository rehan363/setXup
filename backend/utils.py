"""
utils.py — T014 (US1)
Password hashing utilities using bcrypt directly (passlib is unmaintained
and incompatible with bcrypt >= 5.0).
"""
import bcrypt


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*.  Store the result; never store *plain."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*, False otherwise."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
