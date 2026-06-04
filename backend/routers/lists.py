"""
Lists & Folders Router (BA-05)
================================
Endpoints:
  POST   /api/spaces/{space_id}/folders        — Create folder
  GET    /api/spaces/{space_id}/folders        — List folders
  PATCH  /api/folders/{folder_id}              — Update folder
  DELETE /api/folders/{folder_id}              — Delete folder

  POST   /api/spaces/{space_id}/lists          — Create list (optionally in folder)
  GET    /api/spaces/{space_id}/lists          — List all lists in a space
  GET    /api/lists/{list_id}                  — Get list details
  PATCH  /api/lists/{list_id}                  — Update list
  DELETE /api/lists/{list_id}                  — Delete list
  GET    /api/lists/{list_id}/tasks            — Get tasks in list (light — full tasks via tasks router)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from auth import get_current_user
from models import Space, Folder, ProjectList, OrgMember, SpaceMember, User, OrgRoleEnum, Task
from schemas import (
    FolderCreate, FolderRead, FolderUpdate,
    ListCreate, ListRead, ListUpdate, TaskRead
)

router = APIRouter(tags=["Folders & Lists"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_space_or_404(space_id: int, session: Session) -> Space:
    space = session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space


def _assert_space_access(space: Space, user_id: int, session: Session):
    """Raises 403 if user has no access to the space."""
    org_m = session.exec(
        select(OrgMember).where(OrgMember.org_id == space.org_id, OrgMember.user_id == user_id)
    ).first()
    if not org_m:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    if space.is_private:
        sm = session.exec(
            select(SpaceMember).where(
                SpaceMember.space_id == space.id,
                SpaceMember.user_id == user_id,
            )
        ).first()
        if not sm:
            raise HTTPException(status_code=403, detail="No access to this private space")


def _assert_org_admin(org_id: int, user_id: int, session: Session):
    m = session.exec(
        select(OrgMember).where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    ).first()
    if not m or m.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin):
        raise HTTPException(status_code=403, detail="Admin access required")


# ============================================================
# FOLDER ENDPOINTS
# ============================================================

@router.post("/api/spaces/{space_id}/folders", response_model=FolderRead, status_code=201)
def create_folder(
    space_id: int,
    payload: FolderCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _assert_space_access(space, current_user.id, session)

    folder = Folder(space_id=space_id, name=payload.name, created_by=current_user.id)
    session.add(folder)
    session.commit()
    session.refresh(folder)
    return folder


@router.get("/api/spaces/{space_id}/folders", response_model=list[FolderRead])
def list_folders(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _assert_space_access(space, current_user.id, session)
    return session.exec(select(Folder).where(Folder.space_id == space_id)).all()


@router.patch("/api/folders/{folder_id}", response_model=FolderRead)
def update_folder(
    folder_id: int,
    payload: FolderUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    folder = session.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    space = _get_space_or_404(folder.space_id, session)
    _assert_org_admin(space.org_id, current_user.id, session)

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(folder, k, v)
    session.add(folder)
    session.commit()
    session.refresh(folder)
    return folder


@router.delete("/api/folders/{folder_id}", status_code=204)
def delete_folder(
    folder_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    folder = session.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    space = _get_space_or_404(folder.space_id, session)
    _assert_org_admin(space.org_id, current_user.id, session)
    session.delete(folder)
    session.commit()


# ============================================================
# LIST ENDPOINTS
# ============================================================

@router.post("/api/spaces/{space_id}/lists", response_model=ListRead, status_code=201)
def create_list(
    space_id: int,
    payload: ListCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _assert_space_access(space, current_user.id, session)

    # Validate folder belongs to this space if provided
    if payload.folder_id:
        folder = session.get(Folder, payload.folder_id)
        if not folder or folder.space_id != space_id:
            raise HTTPException(status_code=400, detail="Folder does not belong to this space")

    lst = ProjectList(
        space_id=space_id,
        folder_id=payload.folder_id,
        name=payload.name,
        description=payload.description,
        created_by=current_user.id,
    )
    session.add(lst)
    session.commit()
    session.refresh(lst)
    return lst


@router.get("/api/spaces/{space_id}/lists", response_model=list[ListRead])
def list_lists(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _assert_space_access(space, current_user.id, session)
    return session.exec(select(ProjectList).where(ProjectList.space_id == space_id)).all()


@router.get("/api/lists/{list_id}", response_model=ListRead)
def get_list(
    list_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    lst = session.get(ProjectList, list_id)
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    space = _get_space_or_404(lst.space_id, session)
    _assert_space_access(space, current_user.id, session)
    return lst


@router.patch("/api/lists/{list_id}", response_model=ListRead)
def update_list(
    list_id: int,
    payload: ListUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    lst = session.get(ProjectList, list_id)
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    space = _get_space_or_404(lst.space_id, session)
    _assert_org_admin(space.org_id, current_user.id, session)

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lst, k, v)
    session.add(lst)
    session.commit()
    session.refresh(lst)
    return lst


@router.delete("/api/lists/{list_id}", status_code=204)
def delete_list(
    list_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    lst = session.get(ProjectList, list_id)
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    space = _get_space_or_404(lst.space_id, session)
    _assert_org_admin(space.org_id, current_user.id, session)
    session.delete(lst)
    session.commit()


@router.get("/api/lists/{list_id}/tasks", response_model=list[TaskRead])
def get_tasks_in_list(
    list_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    lst = session.get(ProjectList, list_id)
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    space = _get_space_or_404(lst.space_id, session)
    _assert_space_access(space, current_user.id, session)

    tasks = session.exec(
        select(Task)
        .where(Task.list_id == list_id, Task.parent_task_id == None)
        .order_by(Task.order)
    ).all()
    return tasks
