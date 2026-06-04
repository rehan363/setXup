"""
Spaces Router (BA-04)
======================
Endpoints:
  POST   /api/orgs/{org_id}/spaces      — Create space
  GET    /api/orgs/{org_id}/spaces      — List spaces in org
  GET    /api/spaces/{space_id}         — Get space details
  PATCH  /api/spaces/{space_id}         — Update space
  DELETE /api/spaces/{space_id}         — Delete space
  POST   /api/spaces/{space_id}/members — Add member to space
  GET    /api/spaces/{space_id}/members — List space members
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, delete

from database import get_session
from auth import get_current_user
from models import (
    Space, SpaceMember, OrgMember, Organization, User, OrgRoleEnum
)
from schemas import SpaceCreate, SpaceRead, SpaceUpdate, OrgMemberRead, OrgMemberInvite

router = APIRouter(tags=["Spaces"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_space_or_404(space_id: int, session: Session) -> Space:
    space = session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space


def _get_org_membership(org_id: int, user_id: int, session: Session) -> OrgMember | None:
    return session.exec(
        select(OrgMember).where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    ).first()


def _require_org_member(org_id: int, user_id: int, session: Session) -> OrgMember:
    m = _get_org_membership(org_id, user_id, session)
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    return m


def _require_org_admin(org_id: int, user_id: int, session: Session):
    m = _get_org_membership(org_id, user_id, session)
    if not m or m.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin):
        raise HTTPException(status_code=403, detail="Admin access required")


def _can_access_space(space: Space, user_id: int, session: Session) -> bool:
    """Returns True if user can access space (org member + private-space check)."""
    org_m = _get_org_membership(space.org_id, user_id, session)
    if not org_m:
        return False
    if not space.is_private:
        return True
    # Private space: must be in space_members
    sm = session.exec(
        select(SpaceMember).where(
            SpaceMember.space_id == space.id,
            SpaceMember.user_id == user_id
        )
    ).first()
    return sm is not None


# ---------------------------------------------------------------------------
# POST /api/orgs/{org_id}/spaces — Create space
# ---------------------------------------------------------------------------

@router.post("/api/orgs/{org_id}/spaces", response_model=SpaceRead, status_code=201)
def create_space(
    org_id: int,
    payload: SpaceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not session.get(Organization, org_id):
        raise HTTPException(status_code=404, detail="Organization not found")
    _require_org_member(org_id, current_user.id, session)

    space = Space(
        org_id=org_id,
        name=payload.name,
        icon=payload.icon,
        color=payload.color,
        description=payload.description,
        is_private=payload.is_private,
        created_by=current_user.id,
    )
    session.add(space)
    session.flush()

    # Creator auto-added as space member with owner role
    session.add(SpaceMember(space_id=space.id, user_id=current_user.id, role=OrgRoleEnum.owner))
    session.commit()
    session.refresh(space)
    return space


# ---------------------------------------------------------------------------
# GET /api/orgs/{org_id}/spaces — List spaces
# ---------------------------------------------------------------------------

@router.get("/api/orgs/{org_id}/spaces", response_model=list[SpaceRead])
def list_spaces(
    org_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _require_org_member(org_id, current_user.id, session)
    spaces = session.exec(select(Space).where(Space.org_id == org_id)).all()
    # Filter private spaces the user can't access
    return [s for s in spaces if _can_access_space(s, current_user.id, session)]


# ---------------------------------------------------------------------------
# GET /api/spaces/{space_id} — Get single space
# ---------------------------------------------------------------------------

@router.get("/api/spaces/{space_id}", response_model=SpaceRead)
def get_space(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    if not _can_access_space(space, current_user.id, session):
        raise HTTPException(status_code=403, detail="Access denied")
    return space


# ---------------------------------------------------------------------------
# PATCH /api/spaces/{space_id} — Update space
# ---------------------------------------------------------------------------

@router.patch("/api/spaces/{space_id}", response_model=SpaceRead)
def update_space(
    space_id: int,
    payload: SpaceUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _require_org_admin(space.org_id, current_user.id, session)

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(space, key, value)

    session.add(space)
    session.commit()
    session.refresh(space)
    return space


# ---------------------------------------------------------------------------
# DELETE /api/spaces/{space_id} — Delete space
# ---------------------------------------------------------------------------

@router.delete("/api/spaces/{space_id}", status_code=204)
def delete_space(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _require_org_admin(space.org_id, current_user.id, session)

    # Cascade delete all related entities to avoid ForeignKeyViolationError
    from models import Folder, ProjectList, Status, Task, Comment, Checklist, ChecklistItem, TaskTag, ActivityLog

    # 1. Fetch lists
    lists = session.exec(select(ProjectList).where(ProjectList.space_id == space_id)).all()
    list_ids = [l.id for l in lists if l.id is not None]

    # 2. Fetch folders
    folders = session.exec(select(Folder).where(Folder.space_id == space_id)).all()
    folder_ids = [f.id for f in folders if f.id is not None]

    # 3. Fetch statuses
    statuses = session.exec(select(Status).where(Status.space_id == space_id)).all()
    status_ids = [s.id for s in statuses if s.id is not None]

    # 4. Fetch tasks inside those lists
    tasks = []
    if list_ids:
        tasks = session.exec(select(Task).where(Task.list_id.in_(list_ids))).all()
    task_ids = [t.id for t in tasks if t.id is not None]

    if task_ids:
        # Checklists
        checklists = session.exec(select(Checklist).where(Checklist.task_id.in_(task_ids))).all()
        checklist_ids = [c.id for c in checklists if c.id is not None]

        if checklist_ids:
            # Delete ChecklistItems
            session.exec(delete(ChecklistItem).where(ChecklistItem.checklist_id.in_(checklist_ids)))
            # Delete Checklists
            session.exec(delete(Checklist).where(Checklist.id.in_(checklist_ids)))

        # Delete TaskTags
        session.exec(delete(TaskTag).where(TaskTag.task_id.in_(task_ids)))

        # Delete Comments
        session.exec(delete(Comment).where(Comment.task_id.in_(task_ids)))

        # Delete ActivityLogs
        session.exec(delete(ActivityLog).where(ActivityLog.task_id.in_(task_ids)))

        # Delete Tasks
        session.exec(delete(Task).where(Task.id.in_(task_ids)))

    # 5. Delete lists
    if list_ids:
        session.exec(delete(ProjectList).where(ProjectList.id.in_(list_ids)))

    # 6. Delete folders
    if folder_ids:
        session.exec(delete(Folder).where(Folder.id.in_(folder_ids)))

    # 7. Delete statuses
    if status_ids:
        session.exec(delete(Status).where(Status.id.in_(status_ids)))

    # 8. Delete space members
    session.exec(delete(SpaceMember).where(SpaceMember.space_id == space_id))

    # 9. Delete space itself
    session.delete(space)
    session.commit()


# ---------------------------------------------------------------------------
# POST /api/spaces/{space_id}/members — Add member to space
# ---------------------------------------------------------------------------

@router.post("/api/spaces/{space_id}/members", response_model=OrgMemberRead, status_code=201)
def add_space_member(
    space_id: int,
    payload: OrgMemberInvite,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _require_org_admin(space.org_id, current_user.id, session)

    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = session.exec(
        select(SpaceMember).where(
            SpaceMember.space_id == space_id, SpaceMember.user_id == user.id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already a member of this space")

    sm = SpaceMember(space_id=space_id, user_id=user.id, role=payload.role)
    session.add(sm)
    session.commit()
    session.refresh(sm)

    # Return as OrgMemberRead (reusing schema, org_id = space's org)
    return OrgMemberRead(
        id=sm.id, org_id=space.org_id,
        user_id=sm.user_id, role=sm.role, joined_at=sm.joined_at
    )


# ---------------------------------------------------------------------------
# GET /api/spaces/{space_id}/members — List space members
# ---------------------------------------------------------------------------

@router.get("/api/spaces/{space_id}/members", response_model=list[OrgMemberRead])
def list_space_members(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    if not _can_access_space(space, current_user.id, session):
        raise HTTPException(status_code=403, detail="Access denied")

    members = session.exec(
        select(SpaceMember).where(SpaceMember.space_id == space_id)
    ).all()
    return [
        OrgMemberRead(
            id=m.id, org_id=space.org_id,
            user_id=m.user_id, role=m.role, joined_at=m.joined_at
        )
        for m in members
    ]
