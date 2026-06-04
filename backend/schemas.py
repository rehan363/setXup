"""
Pydantic Schemas — Phase II (Extended)
========================================
Covers request bodies and response models for:
  - Auth (User register / login)
  - Tasks (extended with priority, dates, list_id, etc.)
  - Organizations
  - Spaces
  - Folders
  - ProjectLists
  - Statuses
  - Tags
  - Comments
  - ActivityLog
  - Checklists
  - Dashboard stats
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import PriorityEnum, OrgRoleEnum, StatusTypeEnum


# ---------------------------------------------------------------------------
# Auth Schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    """Request body for POST /api/auth/register"""
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    user: UserResponse


# ---------------------------------------------------------------------------
# Task Schemas (extended)
# ---------------------------------------------------------------------------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: PriorityEnum = PriorityEnum.none
    list_id: Optional[int] = None
    status_id: Optional[int] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    parent_task_id: Optional[int] = None
    time_estimate: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    list_id: Optional[int] = None
    status_id: Optional[int] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    time_estimate: Optional[int] = None


class TaskStatusUpdate(BaseModel):
    status_id: int


class TaskOrderUpdate(BaseModel):
    order: int


class TaskRead(BaseModel):
    id: int
    user_id: int
    list_id: Optional[int] = None
    status_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    completed: bool
    priority: PriorityEnum
    order: int
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    parent_task_id: Optional[int] = None
    time_estimate: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Organization Schemas
# ---------------------------------------------------------------------------

class OrgCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    brand_color: Optional[str] = None


class OrgUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    brand_color: Optional[str] = None


class OrgRead(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    brand_color: Optional[str] = None
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# OrgMember Schemas
# ---------------------------------------------------------------------------

class OrgMemberRead(BaseModel):
    id: int
    org_id: int
    user_id: int
    role: OrgRoleEnum
    joined_at: datetime
    email: Optional[str] = None
    name: Optional[str] = None

    model_config = {"from_attributes": True}


class OrgMemberInvite(BaseModel):
    email: EmailStr
    role: OrgRoleEnum = OrgRoleEnum.member


# ---------------------------------------------------------------------------
# Space Schemas
# ---------------------------------------------------------------------------

class SpaceCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    is_private: bool = False


class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None


class SpaceRead(BaseModel):
    id: int
    org_id: int
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    is_private: bool
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Folder Schemas
# ---------------------------------------------------------------------------

class FolderCreate(BaseModel):
    name: str


class FolderUpdate(BaseModel):
    name: Optional[str] = None


class FolderRead(BaseModel):
    id: int
    space_id: int
    name: str
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# ProjectList Schemas
# ---------------------------------------------------------------------------

class ListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    folder_id: Optional[int] = None


class ListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ListRead(BaseModel):
    id: int
    space_id: int
    folder_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Status Schemas
# ---------------------------------------------------------------------------

class StatusCreate(BaseModel):
    name: str
    color: str = "#9E9E9E"
    type: StatusTypeEnum = StatusTypeEnum.open
    order: int = 0


class StatusUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    type: Optional[StatusTypeEnum] = None
    order: Optional[int] = None


class StatusRead(BaseModel):
    id: int
    space_id: int
    name: str
    color: str
    type: StatusTypeEnum
    order: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Tag Schemas
# ---------------------------------------------------------------------------

class TagCreate(BaseModel):
    name: str
    color: str = "#6C47FF"


class TagRead(BaseModel):
    id: int
    org_id: int
    name: str
    color: str

    model_config = {"from_attributes": True}


class TaskTagCreate(BaseModel):
    tag_id: int


# ---------------------------------------------------------------------------
# Comment Schemas
# ---------------------------------------------------------------------------

class CommentCreate(BaseModel):
    content: str


class CommentUpdate(BaseModel):
    content: str


class CommentRead(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# ActivityLog Schemas
# ---------------------------------------------------------------------------

class ActivityLogRead(BaseModel):
    id: int
    task_id: int
    user_id: int
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Checklist Schemas
# ---------------------------------------------------------------------------

class ChecklistCreate(BaseModel):
    title: str = "Checklist"


class ChecklistRead(BaseModel):
    id: int
    task_id: int
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChecklistItemCreate(BaseModel):
    content: str
    assigned_to: Optional[int] = None


class ChecklistItemUpdate(BaseModel):
    content: Optional[str] = None
    is_checked: Optional[bool] = None
    assigned_to: Optional[int] = None


class ChecklistItemRead(BaseModel):
    id: int
    checklist_id: int
    content: str
    is_checked: bool
    order: int
    assigned_to: Optional[int] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Dashboard Schemas
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    in_progress_tasks: int
    my_tasks: int


class WorkloadEntry(BaseModel):
    user_id: int
    email: str
    task_count: int


class RecentActivity(BaseModel):
    id: int
    task_id: int
    user_id: int
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    stats: DashboardStats
    workload: List[WorkloadEntry]
    recent_activity: List[RecentActivity]
    upcoming_tasks: List[TaskRead]
