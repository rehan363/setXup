"""
services/task_service.py  —  T029 (US2)
=======================================
Business logic layer for task operations.
All functions enforce user isolation (T030) — every query/mutation
filters or checks against the caller's user_id before touching data.
"""

from datetime import datetime, timezone
from typing import Optional, List

from fastapi import HTTPException, status
from sqlmodel import Session, select

from models import Task, Status, ActivityLog, Checklist, ChecklistItem
from schemas import TaskCreate, TaskUpdate, ChecklistCreate, ChecklistItemCreate, ChecklistItemUpdate


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


def _log_activity(session: Session, task_id: int, user_id: int, action: str, old_value: Optional[str] = None, new_value: Optional[str] = None):
    log = ActivityLog(
        task_id=task_id,
        user_id=user_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
    )
    session.add(log)


# ── service functions ─────────────────────────────────────────────────────────

def create_task(session: Session, body: TaskCreate, user_id: int) -> Task:
    """T024 — Create a new task owned by user_id."""
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
        priority=body.priority,
        list_id=body.list_id,
        status_id=body.status_id,
        start_date=body.start_date,
        due_date=body.due_date,
        parent_task_id=body.parent_task_id,
        time_estimate=body.time_estimate,
    )
    session.add(task)
    session.flush()

    _log_activity(session, task.id, user_id, "created", new_value=task.title)

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
        old_title = task.title
        task.title = title.strip()
        _log_activity(session, task.id, user_id, "title_changed", old_title, task.title)

    if "description" in update_data:
        task.description = update_data["description"]
        _log_activity(session, task.id, user_id, "description_updated")

    if "completed" in update_data:
        old_completed = task.completed
        task.completed = update_data["completed"]
        if old_completed != task.completed:
            _log_activity(session, task.id, user_id, "completed_changed", str(old_completed), str(task.completed))

    if "priority" in update_data:
        old_priority = task.priority.value if task.priority else "none"
        task.priority = update_data["priority"]
        if old_priority != task.priority.value:
            _log_activity(session, task.id, user_id, "priority_changed", old_priority, task.priority.value)

    if "list_id" in update_data:
        task.list_id = update_data["list_id"]

    if "status_id" in update_data:
        old_status_id = task.status_id
        task.status_id = update_data["status_id"]
        _log_activity(session, task.id, user_id, "status_id_changed", str(old_status_id), str(task.status_id))

    if "start_date" in update_data:
        task.start_date = update_data["start_date"]

    if "due_date" in update_data:
        task.due_date = update_data["due_date"]

    if "time_estimate" in update_data:
        task.time_estimate = update_data["time_estimate"]

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


# ── status change endpoint ────────────────────────────────────────────────────

def update_task_status(session: Session, task_id: int, status_id: int, user_id: int) -> Task:
    task = _get_owned_task(session, task_id, user_id)
    status_item = session.get(Status, status_id)
    if not status_item:
        raise HTTPException(status_code=404, detail="Status not found")

    old_status_name = "None"
    if task.status_id:
        old_status = session.get(Status, task.status_id)
        if old_status:
            old_status_name = old_status.name

    task.status_id = status_id
    # If the new status type is closed, automatically set completed=True
    if status_item.type == "closed":
        task.completed = True
    else:
        task.completed = False

    task.updated_at = _now()
    _log_activity(session, task.id, user_id, "status_changed", old_status_name, status_item.name)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# ── subtask endpoints ─────────────────────────────────────────────────────────

def create_subtask(session: Session, parent_task_id: int, body: TaskCreate, user_id: int) -> Task:
    parent = _get_owned_task(session, parent_task_id, user_id)
    
    if not body.title or not body.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    subtask = Task(
        user_id=user_id,
        title=body.title.strip(),
        description=body.description,
        completed=body.completed,
        priority=body.priority,
        list_id=parent.list_id if not body.list_id else body.list_id,
        status_id=body.status_id,
        start_date=body.start_date,
        due_date=body.due_date,
        parent_task_id=parent_task_id,
        time_estimate=body.time_estimate,
    )
    session.add(subtask)
    session.flush()

    _log_activity(session, parent.id, user_id, "subtask_created", new_value=subtask.title)
    _log_activity(session, subtask.id, user_id, "created", new_value=subtask.title)

    session.commit()
    session.refresh(subtask)
    return subtask


def list_subtasks(session: Session, parent_task_id: int, user_id: int) -> list[Task]:
    _get_owned_task(session, parent_task_id, user_id)
    return list(
        session.exec(
            select(Task).where(Task.parent_task_id == parent_task_id, Task.user_id == user_id)
        ).all()
    )


# ── activity log endpoints ────────────────────────────────────────────────────

def list_task_activity(session: Session, task_id: int, user_id: int) -> list[ActivityLog]:
    _get_owned_task(session, task_id, user_id)
    return list(
        session.exec(
            select(ActivityLog).where(ActivityLog.task_id == task_id).order_by(ActivityLog.created_at.desc())
        ).all()
    )


# ── reordering endpoints ───────────────────────────────────────────────────────

def reorder_task(session: Session, task_id: int, order: int, user_id: int) -> Task:
    task = _get_owned_task(session, task_id, user_id)
    old_order = task.order
    task.order = order
    task.updated_at = _now()
    _log_activity(session, task.id, user_id, "task_reordered", str(old_order), str(order))
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# ── checklist endpoints ────────────────────────────────────────────────────────

def create_checklist(session: Session, task_id: int, title: str, user_id: int) -> Checklist:
    _get_owned_task(session, task_id, user_id)
    checklist = Checklist(task_id=task_id, title=title)
    session.add(checklist)
    session.commit()
    session.refresh(checklist)
    return checklist


def list_checklists(session: Session, task_id: int, user_id: int) -> list[Checklist]:
    _get_owned_task(session, task_id, user_id)
    return list(
        session.exec(
            select(Checklist).where(Checklist.task_id == task_id).order_by(Checklist.created_at)
        ).all()
    )


def delete_checklist(session: Session, checklist_id: int, user_id: int) -> None:
    checklist = session.get(Checklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    _get_owned_task(session, checklist.task_id, user_id)

    # Delete all items inside checklist first
    items = session.exec(select(ChecklistItem).where(ChecklistItem.checklist_id == checklist_id)).all()
    for item in items:
        session.delete(item)

    session.delete(checklist)
    session.commit()


def create_checklist_item(
    session: Session, checklist_id: int, content: str, assigned_to: Optional[int], user_id: int
) -> ChecklistItem:
    checklist = session.get(Checklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    _get_owned_task(session, checklist.task_id, user_id)

    # Calculate order
    existing_items = session.exec(select(ChecklistItem).where(ChecklistItem.checklist_id == checklist_id)).all()
    order = len(existing_items)

    item = ChecklistItem(
        checklist_id=checklist_id,
        content=content,
        is_checked=False,
        order=order,
        assigned_to=assigned_to,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def update_checklist_item(
    session: Session, item_id: int, body: ChecklistItemUpdate, user_id: int
) -> ChecklistItem:
    item = session.get(ChecklistItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    checklist = session.get(Checklist, item.checklist_id)
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    _get_owned_task(session, checklist.task_id, user_id)

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_checklist_item(session: Session, item_id: int, user_id: int) -> None:
    item = session.get(ChecklistItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    checklist = session.get(Checklist, item.checklist_id)
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    _get_owned_task(session, checklist.task_id, user_id)

    session.delete(item)
    session.commit()


def get_checklist_items(session: Session, checklist_id: int, user_id: int) -> list[ChecklistItem]:
    checklist = session.get(Checklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    _get_owned_task(session, checklist.task_id, user_id)

    return list(
        session.exec(
            select(ChecklistItem).where(ChecklistItem.checklist_id == checklist_id).order_by(ChecklistItem.order)
        ).all()
    )
