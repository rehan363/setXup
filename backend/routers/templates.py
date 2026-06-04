"""
Templates Router (BA-11)
=========================
Endpoints:
  GET  /api/templates                            — List all built-in templates
  GET  /api/templates/{template_id}             — Get one template details
  POST /api/spaces/{space_id}/apply-template    — Apply template to a space
    → Creates the custom statuses from the template
    → Creates a default List in the space
    → Creates sample tasks in that list
"""

import json
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from auth import get_current_user
from models import Space, OrgMember, SpaceMember, Status, ProjectList, Task, User, OrgRoleEnum, StatusTypeEnum, PriorityEnum

router = APIRouter(tags=["Templates"])

# Load template data once at startup
_TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "templates.json")

def _load_templates() -> list[dict]:
    with open(_TEMPLATES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_space_or_404(space_id: int, session: Session) -> Space:
    space = session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space


def _assert_space_access(space: Space, user_id: int, session: Session):
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


# ---------------------------------------------------------------------------
# GET /api/templates — List all templates
# ---------------------------------------------------------------------------

@router.get("/api/templates")
def list_templates():
    templates = _load_templates()
    # Return lightweight view (no sample tasks)
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "icon": t.get("icon", "📋"),
            "color": t.get("color", "#6C47FF"),
            "status_count": len(t["statuses"]),
        }
        for t in templates
    ]


# ---------------------------------------------------------------------------
# GET /api/templates/{template_id} — Get single template
# ---------------------------------------------------------------------------

@router.get("/api/templates/{template_id}")
def get_template(template_id: str):
    templates = _load_templates()
    match = next((t for t in templates if t["id"] == template_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Template not found")
    return match


# ---------------------------------------------------------------------------
# POST /api/spaces/{space_id}/apply-template — Apply template to space
# ---------------------------------------------------------------------------

@router.post("/api/spaces/{space_id}/apply-template", status_code=201)
def apply_template(
    space_id: int,
    body: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Body: { "template_id": "software-sprint" }
    Creates statuses + a default list + sample tasks in the space.
    """
    template_id = body.get("template_id")
    if not template_id:
        raise HTTPException(status_code=400, detail="template_id is required")

    templates = _load_templates()
    template = next((t for t in templates if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    space = _get_space_or_404(space_id, session)
    _assert_space_access(space, current_user.id, session)

    # 1 — Create statuses from template
    created_statuses: list[Status] = []
    for s in template["statuses"]:
        stat = Status(
            space_id=space_id,
            name=s["name"],
            color=s["color"],
            type=StatusTypeEnum(s["type"]),
            order=s["order"],
        )
        session.add(stat)
        created_statuses.append(stat)
    session.flush()  # get status IDs

    # 2 — Create a default List in the space
    default_list = ProjectList(
        space_id=space_id,
        name=template["name"],
        description=template["description"],
        created_by=current_user.id,
    )
    session.add(default_list)
    session.flush()

    # 3 — Create sample tasks in that list
    # Map first status to "open" type as default
    first_open_status = next(
        (s for s in created_statuses if s.type == StatusTypeEnum.open), None
    )

    for i, t in enumerate(template.get("sample_tasks", [])):
        priority_str = t.get("priority", "none")
        try:
            priority = PriorityEnum(priority_str)
        except ValueError:
            priority = PriorityEnum.none

        task = Task(
            user_id=current_user.id,
            list_id=default_list.id,
            status_id=first_open_status.id if first_open_status else None,
            title=t["title"],
            priority=priority,
            order=i,
        )
        session.add(task)

    session.commit()

    return {
        "message": f"Template '{template['name']}' applied successfully",
        "space_id": space_id,
        "list_id": default_list.id,
        "statuses_created": len(created_statuses),
        "tasks_created": len(template.get("sample_tasks", [])),
    }
