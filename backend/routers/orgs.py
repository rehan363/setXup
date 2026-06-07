"""
Organizations Router (BA-03)
=============================
Endpoints:
  POST   /api/orgs              — Create a new organization
  GET    /api/orgs              — List orgs the current user belongs to
  GET    /api/orgs/{org_id}     — Get org details
  PATCH  /api/orgs/{org_id}     — Update org (owner/admin only)
  POST   /api/orgs/{org_id}/members/invite — Invite a user by email
  GET    /api/orgs/{org_id}/members        — List all members
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, delete
from datetime import datetime, timezone

from database import get_session
from auth import get_current_user
from models import (
    Organization, OrgMember, User, OrgRoleEnum,
    Space, SpaceMember, Folder, ProjectList, Status, Tag,
    Task, TaskTag, Comment, ActivityLog, Checklist, ChecklistItem
)
from schemas import OrgCreate, OrgRead, OrgUpdate, OrgMemberRead, OrgMemberInvite

router = APIRouter(prefix="/api/orgs", tags=["Organizations"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_org_or_404(org_id: int, session: Session) -> Organization:
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


def _get_membership(org_id: int, user_id: int, session: Session) -> OrgMember | None:
    return session.exec(
        select(OrgMember)
        .where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    ).first()


def _require_admin(org_id: int, user_id: int, session: Session) -> OrgMember:
    membership = _get_membership(org_id, user_id, session)
    if not membership or membership.role not in (OrgRoleEnum.owner, OrgRoleEnum.admin):
        raise HTTPException(status_code=403, detail="Admin access required")
    return membership


# ---------------------------------------------------------------------------
# POST /api/orgs — Create organization
# ---------------------------------------------------------------------------

@router.post("/", response_model=OrgRead, status_code=status.HTTP_201_CREATED)
def create_org(
    payload: OrgCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    org = Organization(
        name=payload.name,
        logo_url=payload.logo_url,
        brand_color=payload.brand_color,
        created_by=current_user.id,
    )
    session.add(org)
    session.flush()  # get org.id before committing

    # Creator becomes the owner
    membership = OrgMember(
        org_id=org.id,
        user_id=current_user.id,
        role=OrgRoleEnum.owner,
    )
    session.add(membership)
    session.commit()
    session.refresh(org)
    return org


# ---------------------------------------------------------------------------
# GET /api/orgs — List orgs for current user
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[OrgRead])
def list_orgs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    memberships = session.exec(
        select(OrgMember).where(OrgMember.user_id == current_user.id)
    ).all()
    org_ids = [m.org_id for m in memberships]
    if not org_ids:
        return []
    orgs = session.exec(select(Organization).where(Organization.id.in_(org_ids))).all()
    return orgs


# ---------------------------------------------------------------------------
# GET /api/orgs/{org_id} — Get single org
# ---------------------------------------------------------------------------

@router.get("/{org_id}", response_model=OrgRead)
def get_org(
    org_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    org = _get_org_or_404(org_id, session)
    # Must be a member
    if not _get_membership(org_id, current_user.id, session):
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    return org


# ---------------------------------------------------------------------------
# PATCH /api/orgs/{org_id} — Update org (admin/owner)
# ---------------------------------------------------------------------------

@router.patch("/{org_id}", response_model=OrgRead)
def update_org(
    org_id: int,
    payload: OrgUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    org = _get_org_or_404(org_id, session)
    _require_admin(org_id, current_user.id, session)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)

    session.add(org)
    session.commit()
    session.refresh(org)
    return org


# ---------------------------------------------------------------------------
# POST /api/orgs/{org_id}/members/invite — Invite user by email
# ---------------------------------------------------------------------------

@router.post("/{org_id}/members/invite", response_model=OrgMemberRead, status_code=201)
def invite_member(
    org_id: int,
    payload: OrgMemberInvite,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _get_org_or_404(org_id, session)
    _require_admin(org_id, current_user.id, session)

    # Find user by email
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with that email not found")

    # Check if already a member
    existing = _get_membership(org_id, user.id, session)
    if existing:
        raise HTTPException(status_code=409, detail="User is already a member")

    membership = OrgMember(org_id=org_id, user_id=user.id, role=payload.role)
    session.add(membership)
    session.commit()
    session.refresh(membership)
    
    # Return with name and email populated
    m_read = OrgMemberRead(
        id=membership.id,
        org_id=membership.org_id,
        user_id=membership.user_id,
        role=membership.role,
        joined_at=membership.joined_at,
        email=user.email,
        name=user.name
    )
    return m_read


# ---------------------------------------------------------------------------
# GET /api/orgs/{org_id}/members — List all members
# ---------------------------------------------------------------------------

@router.get("/{org_id}/members", response_model=list[OrgMemberRead])
def list_members(
    org_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    _get_org_or_404(org_id, session)
    if not _get_membership(org_id, current_user.id, session):
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    members = session.exec(
        select(OrgMember).where(OrgMember.org_id == org_id)
    ).all()

    # Populate user name and email
    results = []
    for m in members:
        u = session.get(User, m.user_id)
        results.append(
            OrgMemberRead(
                id=m.id,
                org_id=m.org_id,
                user_id=m.user_id,
                role=m.role,
                joined_at=m.joined_at,
                email=u.email if u else None,
                name=u.name if u else None
            )
        )
    return results


# ---------------------------------------------------------------------------
# DELETE /api/orgs/{org_id} — Delete workspace (Owner only)
# ---------------------------------------------------------------------------

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_org(
    org_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    org = _get_org_or_404(org_id, session)
    
    # Require membership to delete the organization
    membership = _get_membership(org_id, current_user.id, session)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace members can delete this organization"
        )

    # 1. Fetch all spaces in the organization
    spaces_list = session.exec(select(Space).where(Space.org_id == org_id)).all()
    space_ids = [s.id for s in spaces_list]

    if space_ids:
        # 2. Fetch all folders in these spaces
        folders_list = session.exec(select(Folder).where(Folder.space_id.in_(space_ids))).all()
        folder_ids = [f.id for f in folders_list]

        # 3. Fetch all lists in these spaces
        lists_list = session.exec(select(ProjectList).where(ProjectList.space_id.in_(space_ids))).all()
        list_ids = [l.id for l in lists_list]

        if list_ids:
            # 4. Fetch all tasks in these lists
            tasks_list = session.exec(select(Task).where(Task.list_id.in_(list_ids))).all()
            task_ids = [t.id for t in tasks_list]

            if task_ids:
                # 5. Delete checklist items
                checklists_list = session.exec(select(Checklist).where(Checklist.task_id.in_(task_ids))).all()
                checklist_ids = [c.id for c in checklists_list]
                if checklist_ids:
                    session.exec(
                        delete(ChecklistItem).where(ChecklistItem.checklist_id.in_(checklist_ids))
                    )
                    # Delete checklists
                    session.exec(
                        delete(Checklist).where(Checklist.id.in_(checklist_ids))
                    )
                else:
                    # Fallback task deletion for checklist items
                    session.exec(delete(Checklist).where(Checklist.task_id.in_(task_ids)))

                # 6. Delete task tags
                session.exec(delete(TaskTag).where(TaskTag.task_id.in_(task_ids)))

                # 7. Delete comments
                session.exec(delete(Comment).where(Comment.task_id.in_(task_ids)))

                # 8. Delete activity logs
                session.exec(delete(ActivityLog).where(ActivityLog.task_id.in_(task_ids)))

                # 9. Delete tasks
                session.exec(delete(Task).where(Task.id.in_(task_ids)))

            # Delete lists
            session.exec(delete(ProjectList).where(ProjectList.id.in_(list_ids)))

        if folder_ids:
            # Delete folders
            session.exec(delete(Folder).where(Folder.id.in_(folder_ids)))

        # Delete statuses
        session.exec(delete(Status).where(Status.space_id.in_(space_ids)))

        # Delete space members
        session.exec(delete(SpaceMember).where(SpaceMember.space_id.in_(space_ids)))

        # Delete spaces
        session.exec(delete(Space).where(Space.id.in_(space_ids)))

    # 10. Delete organization tags
    session.exec(delete(Tag).where(Tag.org_id == org_id))

    # 11. Delete organization members
    session.exec(delete(OrgMember).where(OrgMember.org_id == org_id))

    # 12. Delete the organization
    session.delete(org)
    session.commit()

    return None
