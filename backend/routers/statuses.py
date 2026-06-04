"""
Statuses Router
================
Endpoints for custom status management per space.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from auth import get_current_user
from models import Status, Space, SpaceMember, OrgMember, User, OrgRoleEnum, StatusTypeEnum
from schemas import StatusCreate, StatusRead, StatusUpdate

router = APIRouter(tags=["Statuses"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_status_or_404(status_id: int, session: Session) -> Status:
    item = session.get(Status, status_id)
    if not item:
        raise HTTPException(status_code=404, detail="Status not found")
    return item


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
    org_m = _get_org_membership(space.org_id, user_id, session)
    if not org_m:
        return False
    if not space.is_private:
        return True
    sm = session.exec(
        select(SpaceMember).where(
            SpaceMember.space_id == space.id,
            SpaceMember.user_id == user_id
        )
    ).first()
    return sm is not None


# ---------------------------------------------------------------------------
# GET /api/spaces/{space_id}/statuses — List statuses
# ---------------------------------------------------------------------------

@router.get("/api/spaces/{space_id}/statuses", response_model=list[StatusRead])
def list_statuses(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    if not _can_access_space(space, current_user.id, session):
        raise HTTPException(status_code=403, detail="Access denied")

    statuses = session.exec(
        select(Status).where(Status.space_id == space_id).order_by(Status.order)
    ).all()
    return statuses


# ---------------------------------------------------------------------------
# POST /api/spaces/{space_id}/statuses — Create status
# ---------------------------------------------------------------------------

@router.post("/api/spaces/{space_id}/statuses", response_model=StatusRead, status_code=201)
def create_status(
    space_id: int,
    payload: StatusCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = _get_space_or_404(space_id, session)
    _require_org_member(space.org_id, current_user.id, session)

    # Allow custom statuses addition by space members (or admins)
    if space.is_private:
        sm = session.exec(
            select(SpaceMember).where(
                SpaceMember.space_id == space.id, SpaceMember.user_id == current_user.id
            )
        ).first()
        if not sm or sm.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin, OrgRoleEnum.member):
            raise HTTPException(status_code=403, detail="Access denied")

    # Create status
    status_item = Status(
        space_id=space_id,
        name=payload.name,
        color=payload.color,
        type=payload.type,
        order=payload.order,
    )
    session.add(status_item)
    session.commit()
    session.refresh(status_item)
    return status_item


# ---------------------------------------------------------------------------
# PATCH /api/statuses/{status_id} — Update status
# ---------------------------------------------------------------------------

@router.patch("/api/statuses/{status_id}", response_model=StatusRead)
def update_status(
    status_id: int,
    payload: StatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    status_item = _get_status_or_404(status_id, session)
    space = _get_space_or_404(status_item.space_id, session)
    _require_org_member(space.org_id, current_user.id, session)

    if space.is_private:
        sm = session.exec(
            select(SpaceMember).where(
                SpaceMember.space_id == space.id, SpaceMember.user_id == current_user.id
            )
        ).first()
        if not sm or sm.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin, OrgRoleEnum.member):
            raise HTTPException(status_code=403, detail="Access denied")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(status_item, key, value)

    session.add(status_item)
    session.commit()
    session.refresh(status_item)
    return status_item


# ---------------------------------------------------------------------------
# DELETE /api/statuses/{status_id} — Delete status
# ---------------------------------------------------------------------------

@router.delete("/api/statuses/{status_id}", status_code=204)
def delete_status(
    status_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    status_item = _get_status_or_404(status_id, session)
    space = _get_space_or_404(status_item.space_id, session)
    _require_org_member(space.org_id, current_user.id, session)

    if space.is_private:
        sm = session.exec(
            select(SpaceMember).where(
                SpaceMember.space_id == space.id, SpaceMember.user_id == current_user.id
            )
        ).first()
        if not sm or sm.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin, OrgRoleEnum.member):
            raise HTTPException(status_code=403, detail="Access denied")

    session.delete(status_item)
    session.commit()
