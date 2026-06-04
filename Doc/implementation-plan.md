# Implementation Plan: Enterprise Task Management Platform

> **Status**: Planning Phase | **Scope**: Phase II Extension (ClickUp-level features)

---

## What We're Building

A ClickUp-equivalent task management system with:
- Organization → Spaces → Folders → Lists → Tasks hierarchy
- Board, List, and Calendar views
- Organization dashboard with analytics widgets
- 8 professional built-in templates
- Notion-inspired minimalist UI (see `ui-design-plan.md`)

Full feature spec: see `feature-requirements.md`

---

## Execution Phases

### Phase A: Database & Backend Extension

#### A1 — New Database Models
**Files**: `backend/models.py`

New SQLModel tables:
- `Organization` — top-level workspace
- `Space` — department/team container within org
- `Folder` — optional grouping layer within space
- `List` (project list) — task container within space/folder
- `Status` — custom status per space with color and order
- `Tag` — org-scoped label with color
- `TaskTag` — M2M: task ↔ tag
- `Comment` — rich text comment on a task
- `ActivityLog` — immutable event log per task
- `Checklist` / `ChecklistItem` — nested checklist within task
- `OrgMember` / `SpaceMember` — role-based membership

Extend existing `Task` model with:
- `list_id` (FK → List)
- `status_id` (FK → Status)
- `priority` (enum: urgent/high/medium/low/none)
- `start_date` (optional datetime)
- `due_date` (datetime)
- `parent_task_id` (self-referencing FK for subtasks)
- `time_estimate` (optional integer, minutes)
- `order` (integer, for drag-and-drop ordering)

#### A2 — Extended API Routers
**Files**: `backend/routers/`

New routers:
- `orgs.py` — CRUD for organizations
- `spaces.py` — CRUD for spaces within org
- `folders.py` — CRUD for folders within space
- `lists.py` — CRUD for lists within space/folder
- `statuses.py` — Custom status management per space
- `tags.py` — Tag CRUD and task tagging
- `comments.py` — Task comments
- `activity.py` — Task activity log
- `dashboard.py` — Aggregated stats (org + space level)
- `templates.py` — Built-in template listing and apply

Extend `tasks.py` with:
- `PATCH /tasks/{id}/status` — change status
- `POST /tasks/{id}/subtasks` — add subtask
- `GET /tasks/{id}/subtasks` — list subtasks
- `GET /tasks/{id}/activity` — task activity
- `POST /tasks/{id}/checklist` — add checklist
- `PATCH /tasks/{id}/order` — drag-and-drop reorder

#### A3 — Services Layer
**Files**: `backend/services/`

- `org_service.py` — org creation, member management
- `dashboard_service.py` — stats aggregation queries
- `template_service.py` — apply template to space/list

---

### Phase B: Frontend Structure Extension

#### B1 — Route Structure
```
frontend/app/
├── (auth)/
│   ├── login/page.tsx       ✓ exists
│   └── register/page.tsx    ✓ exists
└── (app)/
    ├── layout.tsx            ← Root app layout with sidebar
    ├── page.tsx              ← Redirect to /dashboard
    ├── dashboard/page.tsx    ← Org dashboard
    ├── spaces/
    │   ├── [spaceId]/
    │   │   ├── page.tsx      ← Space overview / default list view
    │   │   ├── board/page.tsx
    │   │   ├── list/page.tsx
    │   │   └── calendar/page.tsx
    └── settings/
        ├── org/page.tsx      ← Org settings
        └── members/page.tsx  ← Member management
```

#### B2 — Component Architecture
```
frontend/components/
├── layout/
│   ├── Sidebar.tsx           ← Main nav sidebar
│   ├── Topbar.tsx            ← Breadcrumb + actions bar
│   └── ViewToggle.tsx        ← Board/List/Calendar tabs
├── dashboard/
│   ├── StatCard.tsx          ← Number + label card
│   ├── ActivityFeed.tsx      ← Event log list
│   ├── WorkloadChart.tsx     ← Bar chart per member
│   └── UpcomingTasks.tsx     ← 7-day deadline list
├── tasks/
│   ├── TaskCard.tsx          ← Kanban card
│   ├── TaskRow.tsx           ← List view row
│   ├── TaskDetailPanel.tsx   ← Slide-in task panel
│   ├── TaskForm.tsx          ← Create/edit form modal
│   ├── SubtaskList.tsx       ← Subtask section in panel
│   └── ChecklistBlock.tsx    ← Checklist section in panel
├── views/
│   ├── BoardView.tsx         ← Kanban columns
│   ├── ListView.tsx          ← Table view
│   └── CalendarView.tsx      ← Calendar grid
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx             ← Priority + status badges
│   ├── Avatar.tsx
│   ├── TagChip.tsx
│   ├── Modal.tsx
│   ├── DropdownMenu.tsx
│   ├── Toast.tsx
│   └── EmptyState.tsx
└── spaces/
    ├── SpaceList.tsx         ← Sidebar space listing
    └── SpaceCreateModal.tsx  ← New space dialog
```

#### B3 — State Management
Using React Context + SWR for data fetching:

- `OrgContext` — current org, spaces list
- `SpaceContext` — current space, lists, statuses, members
- `TaskContext` — current list's tasks (optimistic updates)
- SWR for all data fetching with `mutate()` for optimistic UI

---

### Phase C: Design System Implementation

**Files**: `frontend/app/globals.css`, `frontend/lib/tokens.ts`

1. Implement all CSS custom properties from `ui-design-plan.md`
2. Inter font from Google Fonts
3. Dark mode via `[data-theme="dark"]` attribute on `<html>`
4. Tailwind config extension with design tokens

---

### Phase D: Templates Implementation

**File**: `backend/data/templates.json`

JSON definition for each of 8 built-in templates:
```json
{
  "id": "software-sprint",
  "name": "Software Sprint",
  "description": "Agile sprint tracking for engineering teams",
  "statuses": [
    { "name": "Backlog", "color": "#9E9E9E", "type": "open", "order": 0 },
    { "name": "In Progress", "color": "#42A5F5", "type": "open", "order": 1 },
    { "name": "Review", "color": "#AB47BC", "type": "open", "order": 2 },
    { "name": "QA", "color": "#FF7043", "type": "open", "order": 3 },
    { "name": "Done", "color": "#66BB6A", "type": "closed", "order": 4 }
  ],
  "sample_tasks": [
    { "title": "Set up project repository", "priority": "high" },
    { "title": "Define sprint goals", "priority": "urgent" }
  ]
}
```

---

## Task Checklist

### Backend Tasks

- [x] **BA-01** Add new SQLModel tables to `models.py` (Org, Space, Folder, List, Status, Tag, Comment, ActivityLog, Checklist, OrgMember, SpaceMember)
- [x] **BA-02** Extend `Task` model (list_id, status_id, priority, start_date, parent_task_id, order)
- [x] **BA-03** Create `backend/routers/orgs.py` with CRUD endpoints
- [x] **BA-04** Create `backend/routers/spaces.py` with CRUD + member endpoints
- [x] **BA-05** Create `backend/routers/lists.py` with CRUD endpoints
- [x] **BA-06** Create `backend/routers/tags.py` with tag + task-tag endpoints
- [x] **BA-07** Create `backend/routers/comments.py` with comment CRUD
- [x] **BA-08** Create `backend/routers/dashboard.py` with aggregated stats
- [x] **BA-09** Create `backend/services/dashboard_service.py` for stats queries
- [x] **BA-10** Create `backend/data/templates.json` with 8 built-in templates
- [x] **BA-11** Create `backend/routers/templates.py` for template listing + apply
- [x] **BA-12** Extend `tasks.py` with subtask, status change, reorder endpoints
- [x] **BA-13** Run `init_db.py` to create new tables in Neon

### Frontend Tasks

- [ ] **FE-01** Implement CSS design tokens in `globals.css` (colors, typography, spacing)
- [ ] **FE-02** Build `Sidebar.tsx` with org switcher, space tree, collapse support
- [ ] **FE-03** Build `Topbar.tsx` with breadcrumb and action buttons
- [ ] **FE-04** Build `ViewToggle.tsx` — Board/List/Calendar tab strip
- [ ] **FE-05** Build `BoardView.tsx` — Kanban columns with drag-and-drop
- [ ] **FE-06** Build `TaskCard.tsx` — Kanban card with priority, assignee, tags
- [ ] **FE-07** Build `ListView.tsx` — Table with inline edit, sort, group
- [ ] **FE-08** Build `TaskRow.tsx` — Single row in list view
- [ ] **FE-09** Build `CalendarView.tsx` — Month/week/day calendar
- [ ] **FE-10** Build `TaskDetailPanel.tsx` — Slide-in panel from right
- [ ] **FE-11** Build `Dashboard` page with stat cards, activity feed, workload chart
- [ ] **FE-12** Build `StatCard.tsx`, `ActivityFeed.tsx`, `WorkloadChart.tsx`
- [ ] **FE-13** Build UI primitives: `Button`, `Input`, `Badge`, `Avatar`, `TagChip`, `Modal`, `Toast`
- [ ] **FE-14** Build `SpaceCreateModal.tsx` with template selection
- [ ] **FE-15** Build `TaskForm.tsx` — Create/edit task modal
- [ ] **FE-16** Implement dark mode toggle with `localStorage` persistence
- [ ] **FE-17** Implement responsive mobile layout (sidebar drawer + bottom nav)
- [ ] **FE-18** Build empty states with SVG illustrations for all views
- [ ] **FE-19** Implement optimistic UI for task status changes
- [ ] **FE-20** Build `api-client.ts` extension for all new endpoints

---

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| A — Backend Extension | BA-01 to BA-13 | Medium-High |
| B — Frontend Structure | FE-01 to FE-06 | High |
| C — Views | FE-07 to FE-11 | High |
| D — Dashboard & Polish | FE-12 to FE-20 | Medium |

---

*Last updated: 2026-05-17*
