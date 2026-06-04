"""
routers/tasks.py  —  T024–T028, T030 (US2)
===========================================
All task endpoints require a valid Bearer JWT.
Business logic is in services/task_service.py — this file is intentionally thin.
"""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session

from auth import get_current_user_id_int
from database import get_session
from schemas import (
    TaskCreate, TaskRead, TaskUpdate, TaskStatusUpdate, TaskOrderUpdate,
    ChecklistCreate, ChecklistRead, ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemRead,
    ActivityLogRead
)
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


# ── PATCH /api/tasks/{task_id}/status — Change status ─────────────────────────
@router.patch(
    "/{task_id}/status",
    response_model=TaskRead,
    status_code=status.HTTP_200_OK,
    summary="Update task status",
)
def update_status(
    task_id: int,
    body: TaskStatusUpdate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.update_task_status(session, task_id, body.status_id, user_id)


# ── POST /api/tasks/{task_id}/subtasks — Add subtask ──────────────────────────
@router.post(
    "/{task_id}/subtasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a subtask under this task",
)
def add_subtask(
    task_id: int,
    body: TaskCreate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.create_subtask(session, task_id, body, user_id)


# ── GET /api/tasks/{task_id}/subtasks — List subtasks ─────────────────────────
@router.get(
    "/{task_id}/subtasks",
    response_model=list[TaskRead],
    status_code=status.HTTP_200_OK,
    summary="List all subtasks of this task",
)
def list_subtasks(
    task_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.list_subtasks(session, task_id, user_id)


# ── GET /api/tasks/{task_id}/activity — List activity ─────────────────────────
@router.get(
    "/{task_id}/activity",
    response_model=list[ActivityLogRead],
    status_code=status.HTTP_200_OK,
    summary="List activity feed for this task",
)
def list_activity(
    task_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.list_task_activity(session, task_id, user_id)


# ── PATCH /api/tasks/{task_id}/order — Reorder task ───────────────────────────
@router.patch(
    "/{task_id}/order",
    response_model=TaskRead,
    status_code=status.HTTP_200_OK,
    summary="Update task order for drag-and-drop",
)
def reorder_task(
    task_id: int,
    body: TaskOrderUpdate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.reorder_task(session, task_id, body.order, user_id)


# ── POST /api/tasks/{task_id}/checklists — Add checklist ──────────────────────
@router.post(
    "/{task_id}/checklists",
    response_model=ChecklistRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new checklist block for this task",
)
def add_checklist(
    task_id: int,
    body: ChecklistCreate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.create_checklist(session, task_id, body.title, user_id)


# ── GET /api/tasks/{task_id}/checklists — List checklists ─────────────────────
@router.get(
    "/{task_id}/checklists",
    response_model=list[ChecklistRead],
    status_code=status.HTTP_200_OK,
    summary="List all checklists of this task",
)
def list_checklists(
    task_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.list_checklists(session, task_id, user_id)


# ── DELETE /api/checklists/{checklist_id} — Delete checklist ──────────────────
@router.delete(
    "/checklists/{checklist_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a checklist block",
)
def delete_checklist(
    checklist_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    task_service.delete_checklist(session, checklist_id, user_id)


# ── POST /api/checklists/{checklist_id}/items — Add item ──────────────────────
@router.post(
    "/checklists/{checklist_id}/items",
    response_model=ChecklistItemRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add an item to a checklist",
)
def add_checklist_item(
    checklist_id: int,
    body: ChecklistItemCreate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.create_checklist_item(session, checklist_id, body.content, body.assigned_to, user_id)


# ── GET /api/checklists/{checklist_id}/items — List items ─────────────────────
@router.get(
    "/checklists/{checklist_id}/items",
    response_model=list[ChecklistItemRead],
    status_code=status.HTTP_200_OK,
    summary="List all items of a checklist",
)
def list_checklist_items(
    checklist_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.get_checklist_items(session, checklist_id, user_id)


# ── PATCH /api/checklist-items/{item_id} — Update item ───────────────────────
@router.patch(
    "/checklist-items/{item_id}",
    response_model=ChecklistItemRead,
    status_code=status.HTTP_200_OK,
    summary="Update checklist item content/status",
)
def update_checklist_item(
    item_id: int,
    body: ChecklistItemUpdate,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    return task_service.update_checklist_item(session, item_id, body, user_id)


# ── DELETE /api/checklist-items/{item_id} — Delete item ───────────────────────
@router.delete(
    "/checklist-items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete checklist item",
)
def delete_checklist_item(
    item_id: int,
    user_id: int = Depends(get_current_user_id_int),
    session: Session = Depends(get_session),
):
    task_service.delete_checklist_item(session, item_id, user_id)
