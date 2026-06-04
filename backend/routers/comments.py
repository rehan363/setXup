"""
Comments Router (BA-07)
========================
Endpoints:
  POST   /api/tasks/{task_id}/comments         — Add comment
  GET    /api/tasks/{task_id}/comments         — List comments
  PATCH  /api/comments/{comment_id}            — Edit own comment
  DELETE /api/comments/{comment_id}            — Delete own comment (or admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timezone

from database import get_session
from auth import get_current_user
from models import Comment, Task, ActivityLog, User
from schemas import CommentCreate, CommentUpdate, CommentRead

router = APIRouter(tags=["Comments"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_task_or_404(task_id: int, session: Session) -> Task:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def _log_activity(session: Session, task_id: int, user_id: int, action: str, new_value: str = None):
    log = ActivityLog(task_id=task_id, user_id=user_id, action=action, new_value=new_value)
    session.add(log)


# ---------------------------------------------------------------------------
# POST /api/tasks/{task_id}/comments — Add comment
# ---------------------------------------------------------------------------

@router.post("/api/tasks/{task_id}/comments", response_model=CommentRead, status_code=201)
def add_comment(
    task_id: int,
    payload: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(task_id, session)

    comment = Comment(
        task_id=task_id,
        user_id=current_user.id,
        content=payload.content,
    )
    session.add(comment)

    # Log activity
    _log_activity(session, task_id, current_user.id, "commented", payload.content[:100])

    session.commit()
    session.refresh(comment)
    return comment


# ---------------------------------------------------------------------------
# GET /api/tasks/{task_id}/comments — List comments
# ---------------------------------------------------------------------------

@router.get("/api/tasks/{task_id}/comments", response_model=list[CommentRead])
def list_comments(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _get_task_or_404(task_id, session)
    return session.exec(
        select(Comment).where(Comment.task_id == task_id).order_by(Comment.created_at)
    ).all()


# ---------------------------------------------------------------------------
# PATCH /api/comments/{comment_id} — Edit own comment
# ---------------------------------------------------------------------------

@router.patch("/api/comments/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot edit another user's comment")

    comment.content = payload.content
    comment.updated_at = datetime.now(timezone.utc)
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


# ---------------------------------------------------------------------------
# DELETE /api/comments/{comment_id} — Delete own comment
# ---------------------------------------------------------------------------

@router.delete("/api/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's comment")

    session.delete(comment)
    session.commit()
