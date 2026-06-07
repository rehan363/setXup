"""
Database Models — Phase II (Extended)
=====================================
Tables:
  - User          (existing)
  - Task          (extended: list_id, status_id, priority, dates, parent, order)
  - Organization  (BA-01)
  - Space         (BA-01)
  - Folder        (BA-01, optional layer)
  - List          (BA-01, project list container)
  - Status        (BA-01, custom statuses per space)
  - Tag           (BA-01)
  - TaskTag       (BA-01, M2M: task <-> tag)
  - Comment       (BA-01)
  - ActivityLog   (BA-01)
  - Checklist     (BA-01)
  - ChecklistItem (BA-01)
  - OrgMember     (BA-01)
  - SpaceMember   (BA-01)
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from enum import Enum


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class PriorityEnum(str, Enum):
    urgent = "urgent"
    high = "high"
    medium = "medium"
    low = "low"
    none = "none"


class OrgRoleEnum(str, Enum):
    owner = "owner"
    admin = "admin"
    member = "member"
    guest = "guest"


class StatusTypeEnum(str, Enum):
    open = "open"
    closed = "closed"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# User (existing, unchanged)
# ---------------------------------------------------------------------------

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str = Field()  # bcrypt-hashed — never store plaintext
    name: Optional[str] = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# Organization
# ---------------------------------------------------------------------------

class Organization(SQLModel, table=True):
    __tablename__ = "organizations"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, index=True)
    logo_url: Optional[str] = Field(default=None, max_length=500)
    brand_color: Optional[str] = Field(default=None, max_length=7)  # e.g. "#00607a"
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# OrgMember  (M2M: org <-> user with role)
# ---------------------------------------------------------------------------

class OrgMember(SQLModel, table=True):
    __tablename__ = "org_members"

    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organizations.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: OrgRoleEnum = Field(default=OrgRoleEnum.member)
    joined_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# Space  (department / team inside an org)
# ---------------------------------------------------------------------------

class Space(SQLModel, table=True):
    __tablename__ = "spaces"

    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organizations.id", index=True)
    name: str = Field(max_length=100)
    icon: Optional[str] = Field(default=None, max_length=10)   # emoji or icon name
    color: Optional[str] = Field(default=None, max_length=7)
    description: Optional[str] = Field(default=None, max_length=500)
    is_private: bool = Field(default=False)
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# SpaceMember  (M2M: space <-> user with role)
# ---------------------------------------------------------------------------

class SpaceMember(SQLModel, table=True):
    __tablename__ = "space_members"

    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: int = Field(foreign_key="spaces.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: OrgRoleEnum = Field(default=OrgRoleEnum.member)
    joined_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# Folder  (optional grouping layer inside a space)
# ---------------------------------------------------------------------------

class Folder(SQLModel, table=True):
    __tablename__ = "folders"

    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: int = Field(foreign_key="spaces.id", index=True)
    name: str = Field(max_length=100)
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# ProjectList  (container for tasks — named ProjectList to avoid Python builtin clash)
# ---------------------------------------------------------------------------

class ProjectList(SQLModel, table=True):
    __tablename__ = "lists"

    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: int = Field(foreign_key="spaces.id", index=True)
    folder_id: Optional[int] = Field(default=None, foreign_key="folders.id", index=True)
    name: str = Field(max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# Status  (custom status per space — e.g. "To Do", "In Progress", "Done")
# ---------------------------------------------------------------------------

class Status(SQLModel, table=True):
    __tablename__ = "statuses"

    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: int = Field(foreign_key="spaces.id", index=True)
    name: str = Field(max_length=50)
    color: str = Field(default="#9E9E9E", max_length=7)
    type: StatusTypeEnum = Field(default=StatusTypeEnum.open)
    order: int = Field(default=0)


# ---------------------------------------------------------------------------
# Tag  (org-scoped label with a color)
# ---------------------------------------------------------------------------

class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organizations.id", index=True)
    name: str = Field(max_length=50)
    color: str = Field(default="#00607a", max_length=7)


# ---------------------------------------------------------------------------
# Task  (extended with all new fields — BA-02)
# ---------------------------------------------------------------------------

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Ownership / hierarchy
    user_id: int = Field(foreign_key="users.id", index=True)
    list_id: Optional[int] = Field(default=None, foreign_key="lists.id", index=True)
    status_id: Optional[int] = Field(default=None, foreign_key="statuses.id")

    # Core fields
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False)

    # Priority & ordering
    priority: PriorityEnum = Field(default=PriorityEnum.none)
    order: int = Field(default=0)  # for drag-and-drop ordering within a list

    # Dates
    start_date: Optional[datetime] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)

    # Subtask support (self-referencing)
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")

    # Time tracking (in minutes)
    time_estimate: Optional[int] = Field(default=None)

    # Audit
    created_at: datetime = Field(default_factory=_now)
    updated_at: Optional[datetime] = Field(default=None)


# ---------------------------------------------------------------------------
# TaskTag  (M2M: task <-> tag)
# ---------------------------------------------------------------------------

class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    tag_id: int = Field(foreign_key="tags.id", index=True)


# ---------------------------------------------------------------------------
# Comment  (comments on a task)
# ---------------------------------------------------------------------------

class Comment(SQLModel, table=True):
    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    user_id: int = Field(foreign_key="users.id")
    content: str = Field(max_length=5000)
    created_at: datetime = Field(default_factory=_now)
    updated_at: Optional[datetime] = Field(default=None)


# ---------------------------------------------------------------------------
# ActivityLog  (immutable event history per task)
# ---------------------------------------------------------------------------

class ActivityLog(SQLModel, table=True):
    __tablename__ = "activity_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    user_id: int = Field(foreign_key="users.id")
    action: str = Field(max_length=100)     # e.g. "status_changed", "assigned"
    old_value: Optional[str] = Field(default=None, max_length=500)
    new_value: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# Checklist  (a named checklist block within a task)
# ---------------------------------------------------------------------------

class Checklist(SQLModel, table=True):
    __tablename__ = "checklists"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    title: str = Field(default="Checklist", max_length=100)
    created_at: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# ChecklistItem  (individual checkbox item inside a checklist)
# ---------------------------------------------------------------------------

class ChecklistItem(SQLModel, table=True):
    __tablename__ = "checklist_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    checklist_id: int = Field(foreign_key="checklists.id", index=True)
    content: str = Field(max_length=500)
    is_checked: bool = Field(default=False)
    order: int = Field(default=0)
    assigned_to: Optional[int] = Field(default=None, foreign_key="users.id")
