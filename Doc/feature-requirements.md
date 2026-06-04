# Feature Requirements: Enterprise Task Management Platform

> **Research Basis**: Master-level analysis of ClickUp's task management architecture, cross-referenced with Linear, Asana, and Notion patterns.

---

## 1. Core Architecture: The Hierarchy

### Hierarchy Model (ClickUp-Inspired)

```
Organization (Workspace)
└── Spaces  (e.g., Marketing, Engineering, Sales)
    └── Folders  (Optional grouping layer)
        └── Lists  (e.g., Sprint Backlog, Bugs)
            └── Tasks
                └── Subtasks
                    └── Checklists
```

### 1.1 Organization (Workspace)
- Single workspace per organization — one canonical root
- Organization profile: name, logo, brand color, timezone
- Org-level settings: default permissions, billing, member roles
- **Org Dashboard**: aggregate view of all spaces, activity, and team workload

### 1.2 Spaces
- Represent departments, teams, or high-level initiatives
- Each space: name, icon/emoji, color, description
- Space-level settings cascade to all Folders, Lists, and Tasks
- Custom statuses defined per Space (e.g., `Todo → In Progress → Review → Done`)
- Private vs. public spaces
- Space members & permission overrides

### 1.3 Folders (Optional Layer)
- Group related Lists within a Space
- Used for: projects, clients, sprints, campaigns
- Folder-level statuses can override Space statuses
- Collapsible in sidebar navigation

### 1.4 Lists
- Core container where tasks live — every task MUST belong to a List
- List = specific workflow, project, or sprint
- Per-list view overrides (Board, List, Calendar)

### 1.5 Tasks

Core work item properties:

| Property | Type | Description |
|----------|------|-------------|
| `title` | string (required) | Task name (1–200 chars) |
| `description` | rich text | Detailed notes |
| `status` | enum | Defined by parent List/Space |
| `priority` | enum | Urgent / High / Medium / Low / None |
| `assignees` | user[] | One or more members |
| `due_date` | datetime | Optional deadline |
| `start_date` | datetime | Optional start date |
| `tags` | string[] | Cross-list labels |
| `time_estimate` | duration | Estimated effort |
| `parent_task_id` | FK | For subtasks |
| `list_id` | FK | Parent list |
| `created_by` | FK | Creator user |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Auto |

### 1.6 Subtasks
- Nested under parent task (1 level deep for MVP)
- Progress: "2/5 subtasks complete"
- Independently assignable and completable

### 1.7 Checklists
- Ordered checkbox items within a task
- Progress indicator: "0/4 items"
- Reorderable via drag-and-drop

---

## 2. Views

### 2.1 Board View (Kanban)
- Columns = task statuses
- Drag-and-drop cards between columns to update status
- Card shows: title, assignee avatars, priority badge, due date, tag chips
- Quick-add task button per column
- Filter cards by: assignee, priority, tag, due date

### 2.2 List View
- Vertical, spreadsheet-style task list
- Columns: checkbox, title, assignee, priority, due date, status, tags
- Inline editing for all fields
- Bulk select & bulk actions (assign, change status, delete, move)
- Group by: status, priority, assignee, tag
- Sort by: due date, priority, created date, alphabetical
- Filter by: any field combination

### 2.3 Calendar View
- Month / Week / Day toggle
- Tasks appear on their due date
- Drag tasks to reschedule (updates due_date)
- Color-coded by: priority, status, or assignee
- Overdue tasks highlighted in red
- Unscheduled tasks drawer (sidebar)

### 2.4 Dashboard View
Organization/Space-level command center:

| Widget | Description |
|--------|-------------|
| **Task Summary** | Total / Completed / Overdue / In Progress counts |
| **Completion Rate** | Progress bar this week/month |
| **Activity Feed** | Real-time log of task changes, comments |
| **My Tasks** | Tasks assigned to current user |
| **Overdue Tasks** | Tasks past due date |
| **Team Workload** | Bar chart: tasks per member |
| **Status Distribution** | Pie chart of tasks by status |
| **Upcoming Deadlines** | Tasks due in next 7 days |

Dashboard is role-aware:
- **Org Admin**: sees all spaces/members
- **Space Member**: sees their space only
- **Guest**: read-only view

---

## 3. Task Management Features (ClickUp Parity)

### 3.1 Custom Statuses
- Each Space defines its own status pipeline
- Default: `To Do → In Progress → Review → Done`
- Custom colors per status
- One "closed" type status required (maps to `completed = true`)

### 3.2 Priorities

| Level | Color |
|-------|-------|
| Urgent | Red |
| High | Orange |
| Medium | Yellow |
| Low | Blue |
| None | Gray |

### 3.3 Tags / Labels
- Org-wide or Space-scoped tags
- Multiple tags per task
- Tags are filterable across all views
- Color-coded chips

### 3.4 Assignees
- Multiple assignees per task
- Assignee avatars on task cards
- "My Tasks" filter in all views
- Workload management on dashboard

### 3.5 Due Dates & Reminders
- Date picker with time (optional)
- Start date + End date support
- Overdue detection: visual red highlight
- Reminder notifications (in-app)

### 3.6 Activity Log
Every task has a chronological activity feed:
- Status changes
- Assignee changes
- Comment additions
- Due date changes
- Field edits (old → new value)

### 3.7 Comments
- Rich text comments with mentions (`@user`)
- Threaded replies
- Reactions (emoji)
- Comment editing & deletion

---

## 4. Templates

### 4.1 Professional Built-in Templates

| Template | Space Type | Statuses |
|----------|------------|----------|
| **Software Sprint** | Engineering | Backlog → In Progress → Review → QA → Done |
| **Product Roadmap** | Product | Ideation → Scoping → Building → Launched |
| **Marketing Campaign** | Marketing | Brief → Content → Review → Published |
| **Bug Tracker** | Engineering | Reported → Triaged → In Progress → Fixed → Verified |
| **Client Project** | Agency | Kickoff → Design → Dev → UAT → Delivered |
| **HR Onboarding** | HR | Pre-hire → Day 1 → Week 1 → Month 1 → Complete |
| **Content Calendar** | Marketing | Idea → Draft → Edit → Scheduled → Published |
| **Event Planning** | Operations | Planning → Execution → Day-of → Post-event |

Templates include: pre-configured statuses, sample tasks, recommended views, and usage description.

### 4.2 User-Created Templates
- Save any List as a template
- Save any task (with subtasks) as a reusable task template
- Template library per Organization

---

## 5. Search & Filtering

### 5.1 Global Search
- Fuzzy search across: task titles, descriptions, comments
- Search scope: current list, space, or entire org
- Recent searches history

### 5.2 Filters
- Filter by any combination of: Status, Priority, Assignee, Tag, Due date range, Created date range
- Save filters as "Saved Views"
- Share saved views with team

### 5.3 Sort
- Sort by: Due date, Priority, Created date, Updated date, Title
- Multi-column sort

---

## 6. Members & Permissions

| Role | Scope | Permissions |
|------|-------|-------------|
| **Owner** | Organization | Full control, billing, delete org |
| **Admin** | Organization | Manage members, spaces, settings |
| **Member** | Space | Create/edit/delete tasks in assigned spaces |
| **Guest** | List/Task | View or comment only (no edit) |

---

## 7. Database Schema (Extended)

```sql
-- Organizations
organizations (id, name, logo_url, created_by, created_at)

-- Spaces
spaces (id, org_id, name, icon, color, is_private, created_by, created_at)

-- Folders
folders (id, space_id, name, created_by, created_at)

-- Lists
lists (id, folder_id?, space_id, name, created_by, created_at)

-- Custom Statuses
statuses (id, space_id, name, color, type[open/closed], order)

-- Tags
tags (id, org_id, name, color)
task_tags (task_id, tag_id)

-- Comments
comments (id, task_id, user_id, content, created_at, updated_at)

-- Activity Log
activity_log (id, task_id, user_id, action, old_value, new_value, created_at)

-- Checklists
checklists (id, task_id, title)
checklist_items (id, checklist_id, content, is_checked, order, assigned_to)

-- Members
org_members (org_id, user_id, role, joined_at)
space_members (space_id, user_id, role)
```

---

## 8. API Endpoints (Extended)

```
# Organizations
GET/POST  /api/orgs
GET/PATCH  /api/orgs/{org_id}

# Spaces
GET/POST  /api/orgs/{org_id}/spaces
PATCH/DELETE  /api/spaces/{space_id}

# Lists
GET/POST  /api/spaces/{space_id}/lists
GET  /api/lists/{list_id}/tasks

# Tasks (Extended)
GET/POST  /api/lists/{list_id}/tasks
GET/PATCH/DELETE  /api/tasks/{task_id}
PATCH  /api/tasks/{task_id}/status
POST  /api/tasks/{task_id}/subtasks
POST  /api/tasks/{task_id}/comments
GET  /api/tasks/{task_id}/activity

# Dashboard
GET  /api/orgs/{org_id}/dashboard
GET  /api/spaces/{space_id}/dashboard
```

---

## 9. MVP Scope Priority

### P1 — Must Have
- [ ] Organization + Spaces hierarchy
- [ ] Lists within Spaces (with optional Folders)
- [ ] Task CRUD with all core properties
- [ ] Board View (Kanban)
- [ ] List View
- [ ] Calendar View
- [ ] Dashboard with basic widgets
- [ ] Custom statuses per Space
- [ ] Tags, Priorities, Assignees
- [ ] Subtasks & Activity log

### P2 — Should Have
- [ ] Comments with mentions
- [ ] Checklists
- [ ] Built-in Templates (8 templates)
- [ ] Global Search & Filters
- [ ] In-app Notifications

### P3 — Nice to Have
- [ ] Time tracking
- [ ] File attachments
- [ ] User-created templates
- [ ] Saved views
- [ ] Timeline / Gantt view

---

*Last updated: 2026-05-17 | Based on ClickUp architecture analysis*
