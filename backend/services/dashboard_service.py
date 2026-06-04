"""
Dashboard Service (BA-09)
==========================
Aggregation queries for org-level and space-level dashboard stats.
"""

from datetime import datetime, timezone
from sqlmodel import Session, select, func
from models import Task, ActivityLog, User, OrgMember, SpaceMember, Space, ProjectList


def get_org_stats(org_id: int, user_id: int, session: Session) -> dict:
    """Returns aggregated task stats for an entire organization."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Get all space IDs in this org
    spaces = session.exec(select(Space).where(Space.org_id == org_id)).all()
    space_ids = [s.id for s in spaces]

    if not space_ids:
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "overdue_tasks": 0,
            "in_progress_tasks": 0,
            "my_tasks": 0,
        }

    # Get all list IDs in those spaces
    lists = session.exec(
        select(ProjectList).where(ProjectList.space_id.in_(space_ids))
    ).all()
    list_ids = [l.id for l in lists]

    if not list_ids:
        base = {"total_tasks": 0, "completed_tasks": 0, "overdue_tasks": 0,
                "in_progress_tasks": 0, "my_tasks": 0}
        return base

    # All tasks in this org's lists
    all_tasks = session.exec(
        select(Task).where(Task.list_id.in_(list_ids), Task.parent_task_id == None)
    ).all()

    total = len(all_tasks)
    completed = sum(1 for t in all_tasks if t.completed)
    overdue = sum(1 for t in all_tasks if not t.completed and t.due_date and t.due_date < now)
    in_progress = total - completed - overdue
    my_tasks = sum(1 for t in all_tasks if t.user_id == user_id and not t.completed)

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "overdue_tasks": overdue,
        "in_progress_tasks": max(in_progress, 0),
        "my_tasks": my_tasks,
    }


def get_space_stats(space_id: int, user_id: int, session: Session) -> dict:
    """Returns aggregated task stats for a single space."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    list_ids = [
        l.id for l in session.exec(
            select(ProjectList).where(ProjectList.space_id == space_id)
        ).all()
    ]

    if not list_ids:
        return {"total_tasks": 0, "completed_tasks": 0, "overdue_tasks": 0,
                "in_progress_tasks": 0, "my_tasks": 0}

    all_tasks = session.exec(
        select(Task).where(Task.list_id.in_(list_ids), Task.parent_task_id == None)
    ).all()

    total = len(all_tasks)
    completed = sum(1 for t in all_tasks if t.completed)
    overdue = sum(1 for t in all_tasks if not t.completed and t.due_date and t.due_date < now)
    in_progress = total - completed - overdue
    my_tasks = sum(1 for t in all_tasks if t.user_id == user_id and not t.completed)

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "overdue_tasks": overdue,
        "in_progress_tasks": max(in_progress, 0),
        "my_tasks": my_tasks,
    }


def get_workload(list_ids: list[int], session: Session) -> list[dict]:
    """Returns task count per assignee for given list IDs."""
    if not list_ids:
        return []

    tasks = session.exec(
        select(Task).where(
            Task.list_id.in_(list_ids),
            Task.completed == False,
            Task.parent_task_id == None,
        )
    ).all()

    counts: dict[int, int] = {}
    for t in tasks:
        counts[t.user_id] = counts.get(t.user_id, 0) + 1

    result = []
    for uid, count in counts.items():
        user = session.get(User, uid)
        if user:
            result.append({"user_id": uid, "email": user.email, "task_count": count})

    return sorted(result, key=lambda x: x["task_count"], reverse=True)


def get_recent_activity(list_ids: list[int], session: Session, limit: int = 20) -> list:
    """Returns recent activity log entries for tasks in given lists."""
    if not list_ids:
        return []

    task_ids = [
        t.id for t in session.exec(
            select(Task).where(Task.list_id.in_(list_ids))
        ).all()
    ]

    if not task_ids:
        return []

    return session.exec(
        select(ActivityLog)
        .where(ActivityLog.task_id.in_(task_ids))
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    ).all()


def get_upcoming_tasks(list_ids: list[int], user_id: int, session: Session, days: int = 7) -> list:
    """Returns tasks due in the next N days that aren't completed yet."""
    from datetime import timedelta

    if not list_ids:
        return []

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    cutoff = now + timedelta(days=days)

    return session.exec(
        select(Task).where(
            Task.list_id.in_(list_ids),
            Task.completed == False,
            Task.due_date != None,
            Task.due_date >= now,
            Task.due_date <= cutoff,
            Task.parent_task_id == None,
        ).order_by(Task.due_date)
    ).all()
