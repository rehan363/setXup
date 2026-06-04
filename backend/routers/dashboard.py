"""
Dashboard Router (BA-08)
=========================
Endpoints:
  GET /api/orgs/{org_id}/dashboard      — Org-level stats + workload + activity + upcoming
  GET /api/spaces/{space_id}/dashboard  — Space-level stats + workload + activity + upcoming
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from auth import get_current_user
from models import Organization, Space, OrgMember, SpaceMember, ProjectList, User
from schemas import DashboardResponse, DashboardStats, WorkloadEntry, RecentActivity, TaskRead
from services import dashboard_service

router = APIRouter(tags=["Dashboard"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _require_org_member(org_id: int, user_id: int, session: Session):
    m = session.exec(
        select(OrgMember).where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    ).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this organization")


def _can_access_space(space: Space, user_id: int, session: Session) -> bool:
    org_m = session.exec(
        select(OrgMember).where(OrgMember.org_id == space.org_id, OrgMember.user_id == user_id)
    ).first()
    if not org_m:
        return False
    if not space.is_private:
        return True
    sm = session.exec(
        select(SpaceMember).where(
            SpaceMember.space_id == space.id, SpaceMember.user_id == user_id
        )
    ).first()
    return sm is not None


# ---------------------------------------------------------------------------
# GET /api/orgs/{org_id}/dashboard
# ---------------------------------------------------------------------------

@router.get("/api/orgs/{org_id}/dashboard", response_model=DashboardResponse)
def org_dashboard(
    org_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not session.get(Organization, org_id):
        raise HTTPException(status_code=404, detail="Organization not found")
    _require_org_member(org_id, current_user.id, session)

    # Stats
    raw_stats = dashboard_service.get_org_stats(org_id, current_user.id, session)
    stats = DashboardStats(**raw_stats)

    # List IDs for this org
    spaces = session.exec(select(Space).where(Space.org_id == org_id)).all()
    space_ids = [s.id for s in spaces]
    list_ids = [
        l.id for l in session.exec(
            select(ProjectList).where(ProjectList.space_id.in_(space_ids))
        ).all()
    ] if space_ids else []

    # Workload
    raw_workload = dashboard_service.get_workload(list_ids, session)
    workload = [WorkloadEntry(**w) for w in raw_workload]

    # Recent activity
    raw_activity = dashboard_service.get_recent_activity(list_ids, session)
    recent_activity = [RecentActivity.model_validate(a) for a in raw_activity]

    # Upcoming tasks (next 7 days)
    upcoming_raw = dashboard_service.get_upcoming_tasks(list_ids, current_user.id, session)
    upcoming_tasks = [TaskRead.model_validate(t) for t in upcoming_raw]

    return DashboardResponse(
        stats=stats,
        workload=workload,
        recent_activity=recent_activity,
        upcoming_tasks=upcoming_tasks,
    )


# ---------------------------------------------------------------------------
# GET /api/spaces/{space_id}/dashboard
# ---------------------------------------------------------------------------

@router.get("/api/spaces/{space_id}/dashboard", response_model=DashboardResponse)
def space_dashboard(
    space_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    space = session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    if not _can_access_space(space, current_user.id, session):
        raise HTTPException(status_code=403, detail="Access denied")

    # Stats
    raw_stats = dashboard_service.get_space_stats(space_id, current_user.id, session)
    stats = DashboardStats(**raw_stats)

    # List IDs for this space
    list_ids = [
        l.id for l in session.exec(
            select(ProjectList).where(ProjectList.space_id == space_id)
        ).all()
    ]

    raw_workload = dashboard_service.get_workload(list_ids, session)
    workload = [WorkloadEntry(**w) for w in raw_workload]

    raw_activity = dashboard_service.get_recent_activity(list_ids, session)
    recent_activity = [RecentActivity.model_validate(a) for a in raw_activity]

    upcoming_raw = dashboard_service.get_upcoming_tasks(list_ids, current_user.id, session)
    upcoming_tasks = [TaskRead.model_validate(t) for t in upcoming_raw]

    return DashboardResponse(
        stats=stats,
        workload=workload,
        recent_activity=recent_activity,
        upcoming_tasks=upcoming_tasks,
    )
