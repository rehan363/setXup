"""
services/task_service.py  —  T029 (US2)

Business logic layer for task operations.
All functions enforce user isolation (T030) — every query/mutation
filters or checks against the caller's user_id before touching data.

Responsibilities:
  - Database I/O via SQLModel Session
  - User ownership validation (403 vs 404 distinction)
  - Timestamp management (updated_at on every mutation)

Routers are thin — they delegate everything here.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session, select

from models import Task
from schemas import TaskCreate, TaskUpdate


# ── helpers ───────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _get_owned_task(session: Session, task_id: int, user_id: int) -> Task:
    """
    Fetch a task by id.
    - 404 if the task doesn't exist at all.
    - 403 if it exists but belongs to a different user. (T030)
    """
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return task


# ── service functions ─────────────────────────────────────────────────────────

def create_task(session: Session, body: TaskCreate, user_id: int) -> Task:
    """T024 — Create a new task owned by user_id."""
    # Enforce title length (belt-and-suspenders on top of the model max_length)
    if not body.title or not body.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required",
        )
    if len(body.title) > 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be 200 characters or fewer",
        )

    task = Task(
        user_id=user_id,
        title=body.title.strip(),
        description=body.description,
        completed=body.completed,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def list_tasks(session: Session, user_id: int) -> list[Task]:
    """T025 — Return all tasks belonging to user_id (strict user isolation)."""
    return list(
        session.exec(
            select(Task)
            .where(Task.user_id == user_id)
            .order_by(Task.created_at.desc())  # type: ignore[arg-type]
        ).all()
    )


def get_task(session: Session, task_id: int, user_id: int) -> Task:
    """T026 — Return a single task; enforces ownership (T030)."""
    return _get_owned_task(session, task_id, user_id)


def update_task(
    session: Session, task_id: int, body: TaskUpdate, user_id: int
) -> Task:
    """T027 — Partial update; sets updated_at; enforces ownership (T030)."""
    task = _get_owned_task(session, task_id, user_id)

    # Apply only the fields that were explicitly provided
    update_data = body.model_dump(exclude_unset=True)

    if "title" in update_data:
        title = update_data["title"]
        if not title or not title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Title cannot be empty"
            )
        if len(title) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be 200 characters or fewer",
            )
        update_data["title"] = title.strip()

    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = _now()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, task_id: int, user_id: int) -> None:
    """T028 — Hard delete; enforces ownership (T030)."""
    task = _get_owned_task(session, task_id, user_id)
    session.delete(task)
    session.commit()
