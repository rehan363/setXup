"""
Tags Router (BA-06)
====================
Endpoints:
  POST   /api/orgs/{org_id}/tags           — Create tag
  GET    /api/orgs/{org_id}/tags           — List tags
  DELETE /api/tags/{tag_id}                — Delete tag

  POST   /api/tasks/{task_id}/tags         — Attach tag to task
  DELETE /api/tasks/{task_id}/tags/{tag_id} — Remove tag from task
  GET    /api/tasks/{task_id}/tags         — Get tags on a task
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from auth import get_current_user
from models import Tag, TaskTag, Task, OrgMember, User, OrgRoleEnum
from schemas import TagCreate, TagRead, TaskTagCreate

router = APIRouter(tags=["Tags"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _require_org_member(org_id: int, user_id: int, session: Session):
    m = session.exec(
        select(OrgMember).where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    ).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this organization")


def _require_org_admin(org_id: int, user_id: int, session: Session):
    m = session.exec(
        select(OrgMember).where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    ).first()
    if not m or m.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin):
        raise HTTPException(status_code=403, detail="Admin access required")


def _get_task_or_404(task_id: int, user_id: int, session: Session) -> Task:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task


# ---------------------------------------------------------------------------
# POST /api/orgs/{org_id}/tags — Create tag
# ---------------------------------------------------------------------------

@router.post("/api/orgs/{org_id}/tags", response_model=TagRead, status_code=201)
def create_tag(
    org_id: int,
    payload: TagCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_org_member(org_id, current_user.id, session)
    tag = Tag(org_id=org_id, name=payload.name, color=payload.color)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


# ---------------------------------------------------------------------------
# GET /api/orgs/{org_id}/tags — List tags
# ---------------------------------------------------------------------------

@router.get("/api/orgs/{org_id}/tags", response_model=list[TagRead])
def list_tags(
    org_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_org_member(org_id, current_user.id, session)
    return session.exec(select(Tag).where(Tag.org_id == org_id)).all()


# ---------------------------------------------------------------------------
# DELETE /api/tags/{tag_id} — Delete tag
# ---------------------------------------------------------------------------

@router.delete("/api/tags/{tag_id}", status_code=204)
def delete_tag(
    tag_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    _require_org_admin(tag.org_id, current_user.id, session)

    # Remove all task associations first
    task_tags = session.exec(select(TaskTag).where(TaskTag.tag_id == tag_id)).all()
    for tt in task_tags:
        session.delete(tt)

    session.delete(tag)
    session.commit()


# ---------------------------------------------------------------------------
# POST /api/tasks/{task_id}/tags — Attach tag to task
# ---------------------------------------------------------------------------

@router.post("/api/tasks/{task_id}/tags", response_model=TagRead, status_code=201)
def attach_tag(
    task_id: int,
    payload: TaskTagCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(task_id, current_user.id, session)

    tag = session.get(Tag, payload.tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    existing = session.exec(
        select(TaskTag).where(TaskTag.task_id == task_id, TaskTag.tag_id == payload.tag_id)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already attached to this task")

    task_tag = TaskTag(task_id=task_id, tag_id=payload.tag_id)
    session.add(task_tag)
    session.commit()
    return tag


# ---------------------------------------------------------------------------
# DELETE /api/tasks/{task_id}/tags/{tag_id} — Remove tag from task
# ---------------------------------------------------------------------------

@router.delete("/api/tasks/{task_id}/tags/{tag_id}", status_code=204)
def detach_tag(
    task_id: int,
    tag_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _get_task_or_404(task_id, current_user.id, session)

    task_tag = session.exec(
        select(TaskTag).where(TaskTag.task_id == task_id, TaskTag.tag_id == tag_id)
    ).first()
    if not task_tag:
        raise HTTPException(status_code=404, detail="Tag not on this task")

    session.delete(task_tag)
    session.commit()


# ---------------------------------------------------------------------------
# GET /api/tasks/{task_id}/tags — Get tags on a task
# ---------------------------------------------------------------------------

@router.get("/api/tasks/{task_id}/tags", response_model=list[TagRead])
def get_task_tags(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _get_task_or_404(task_id, current_user.id, session)
    task_tags = session.exec(select(TaskTag).where(TaskTag.task_id == task_id)).all()
    tag_ids = [tt.tag_id for tt in task_tags]
    if not tag_ids:
        return []
    return session.exec(select(Tag).where(Tag.id.in_(tag_ids))).all()
