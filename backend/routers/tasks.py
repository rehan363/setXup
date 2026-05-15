"""
routers/tasks.py  —  T024–T028, T030 (US2)

All task endpoints require a valid Bearer JWT.
Business logic is in services/task_service.py — this file is intentionally thin.

Routes:
  GET    /api/tasks           → list user's tasks
  POST   /api/tasks           → create task
  GET    /api/tasks/{id}      → get one task
  PATCH  /api/tasks/{id}      → partial update
  DELETE /api/tasks/{id}      → delete (204)

User isolation: enforced in task_service via get_current_user_id_int dependency.
Contract: specs/002-phase2-webapp/contracts/api.md
"""

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from auth import get_current_user_id_int
from database import get_session
from schemas import TaskCreate, TaskRead, TaskUpdate
from services import task_service

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# ── T025 — GET /api/tasks ─────────────────────────────────────────────────────
@router.get(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="List all tasks for the authenticated user",
)
def list_tasks(
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    tasks = task_service.list_tasks(session, user_id)
    return {"tasks": [TaskRead.model_validate(t) for t in tasks]}


# ── T024 — POST /api/tasks ────────────────────────────────────────────────────
@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
def create_task(
    body: TaskCreate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.create_task(session, body, user_id)


# ── T026 — GET /api/tasks/{task_id} ──────────────────────────────────────────
@router.get(
    "/{task_id}",
    response_model=TaskRead,
    status_code=status.HTTP_200_OK,
    summary="Get a specific task",
)
def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.get_task(session, task_id, user_id)


# ── T027 — PATCH /api/tasks/{task_id} ────────────────────────────────────────
@router.patch(
    "/{task_id}",
    response_model=TaskRead,
    status_code=status.HTTP_200_OK,
    summary="Partially update a task",
)
def update_task(
    task_id: int,
    body: TaskUpdate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.update_task(session, task_id, body, user_id)


# ── T028 — DELETE /api/tasks/{task_id} ───────────────────────────────────────
@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    task_service.delete_task(session, task_id, user_id)
