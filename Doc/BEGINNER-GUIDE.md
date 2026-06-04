# 🟣 Beginner's Complete Guide: What We're Building & How

> **Who this is for**: You are learning, things feel confusing, and you want to understand the project from zero. Read this first — before any other doc.

---

## 🧠 First — What is this project?

Your senior manager asked you to build a **task management web app** — similar to **ClickUp**.

Think of it like this:

> Imagine a **company** with different **departments** (Engineering, Marketing, HR). Each department has **projects**. Each project has **tasks**. Each task can have **sub-tasks** (smaller steps). This app helps the whole company manage all of that in one place — online, from any browser.

If you've used **ClickUp, Trello, Jira, Asana, or Notion** — we're building something exactly like that.

---

## 🗂️ The Big Picture (What the App Looks Like)

When someone opens the app, they see:

```
Left Sidebar              | Right Main Area
──────────────────────────|──────────────────────────────
🏢 My Company             | Dashboard / Board / List /
──────────────────────    | Calendar view shown here
⚡ Engineering            |
   › Sprint Board         | All tasks, cards,
   › Bug Tracker          | calendars appear here
📣 Marketing              |
   › Campaigns            |
🏢 Operations             |
──────────────────────    |
+ New Space               |
──────────────────────    |
⚙ Settings                |
👤 Your Name              |
```

**Left sidebar** = navigation (like folders in Windows Explorer)
**Right main area** = the actual content (tasks, boards, calendars)

---

## 🏗️ The Hierarchy — How Data is Organized

This is the **most important concept**. Everything in the app follows this structure:

```
ORGANIZATION  ←  The whole company (e.g., "Panaversity")
  │
  ├── SPACE  ←  A department (e.g., "Engineering")
  │     │
  │     ├── FOLDER (optional)  ←  A big project (e.g., "Q2 Launch")
  │     │     │
  │     │     └── LIST  ←  A workflow (e.g., "Sprint Backlog")
  │     │           │
  │     │           └── TASK  ←  One piece of work (e.g., "Fix login bug")
  │     │                 │
  │     │                 ├── SUBTASK  ←  Smaller step inside a task
  │     │                 └── CHECKLIST  ←  Simple checkbox items
  │     │
  │     └── LIST  ←  Another list directly in the space
  │
  └── SPACE  ←  Another department (e.g., "Marketing")
```

### Real-Life Example

| Level | Example |
|-------|---------|
| Organization | Panaversity |
| Space | Engineering Team |
| Folder | Phase II Hackathon |
| List | Bug Tracker |
| Task | Fix login button on mobile |
| Subtask | Write the failing test first |
| Checklist | □ Test on iPhone  □ Test on Android |

---

## 👀 Views — How You See Your Tasks

The same tasks can be displayed in **3 different ways** (you switch between them with tabs):

### 1. Board View (Kanban)
Tasks are shown as **cards in columns** — each column is a status.

```
TO DO (3)         IN PROGRESS (2)    DONE (4)
──────────────    ───────────────    ──────────────
Fix nav bug       Build UI           Setup repo
  Ali  High         Sara  May18        Omar  Done

Write docs        Run tests
  Omar              Ali
```

> Drag a card from "TO DO" to "IN PROGRESS" and the status changes automatically.

### 2. List View (Table)
Tasks are shown as **rows in a table** — like a spreadsheet.

```
□  Task Title          Assignee  Priority  Due Date    Status
────────────────────────────────────────────────────────────────
□  Fix nav dropdown    Ali       Urgent    May 18      To Do
□  Build hero UI       Sara      High      May 20      In Progress
✓  Setup CI/CD         Omar      Low       May 15      Done
```

> Click any cell to edit it directly.

### 3. Calendar View
Tasks are shown on a **calendar** based on their due date.

```
Mon     Tue     Wed          Thu     Fri
                Fix nav bug          Build hero
```

> Drag a task to a new day and the due date updates.

### 4. Dashboard View
A **summary page** with stats:

```
Total (48)    Active (12)    Overdue (3)    Done (33)

My Tasks                Activity Feed
○ Fix nav bug           Ali changed status: To Do → In Progress
○ Review PR #23         Sara added comment on task #7
○ Write Q2 report       Omar completed "Setup CI/CD"
```

---

## ⚙️ What Technology Are We Using?

Your app is split into **2 separate parts** that talk to each other:

### Part 1: Backend (The "Brain" — stores data)
- **Language**: Python
- **Framework**: FastAPI
- **Database**: Neon PostgreSQL
- **What it does**: Handles all data — creates tasks, reads tasks, updates tasks, checks if users are logged in

### Part 2: Frontend (The "Face" — what users see)
- **Language**: TypeScript (JavaScript with types)
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **What it does**: Shows the UI — the sidebar, boards, lists, calendar

### How They Talk to Each Other

```
User clicks "Create Task"
        ↓
Frontend (Next.js) sends HTTP request to Backend
        ↓
Backend (FastAPI) saves task to Database (Neon Postgres)
        ↓
Backend sends back the new task data
        ↓
Frontend shows the new task on screen
```

---

## 📁 Where Are All the Files?

```
hackathon_2/
│
├── backend/              ← Python FastAPI server (the brain)
│   ├── main.py           ← Entry point — starts the server
│   ├── models.py         ← Defines database tables (Task, User, Space...)
│   ├── schemas.py        ← Defines what data looks like going in/out
│   ├── auth.py           ← Handles login/JWT tokens
│   ├── database.py       ← Connects to Neon Postgres
│   ├── utils.py          ← Helper functions
│   └── routers/          ← API endpoints
│       ├── tasks.py      ← /api/tasks endpoints
│       └── users.py      ← /api/users endpoints
│
├── frontend/             ← Next.js app (what users see)
│   ├── app/              ← Pages
│   │   ├── layout.tsx    ← Root layout (wraps all pages)
│   │   ├── (auth)/       ← Login & Register pages
│   │   └── (app)/        ← Protected pages (only if logged in)
│   ├── components/       ← Reusable UI pieces
│   ├── lib/
│   │   ├── auth.ts       ← Frontend auth config
│   │   └── api-client.ts ← Functions to call the backend
│   └── middleware.ts     ← Redirects unauthenticated users to login
│
└── Doc/                  ← Documentation (you're reading this!)
    ├── BEGINNER-GUIDE.md ← This file
    ├── feature-requirements.md ← Full list of features
    ├── ui-design-plan.md ← How the UI should look
    └── implementation-plan.md  ← What to build in what order
```

---

## ✅ What Already Exists vs. What We Need to Build

### Already Done (Phase II basics)
- User registration (sign up)
- User login (with JWT tokens)
- Basic task creation, reading, updating, deleting
- Simple task list page in the frontend

### What We Need to Build (the ClickUp upgrade)

| Feature | What it means |
|---------|--------------|
| Organizations & Spaces | Group tasks by company → department |
| Board View | Kanban drag-and-drop columns |
| Calendar View | Tasks on a calendar |
| Dashboard | Stats overview (total tasks, overdue, etc.) |
| Priorities | Mark tasks as Urgent / High / Medium / Low |
| Tags | Label tasks with colored chips |
| Subtasks | Tasks inside tasks |
| Checklists | Simple checkbox items inside a task |
| Comments | Team members can comment on tasks |
| Activity Log | History of who changed what |
| Templates | Pre-built project setups |
| Custom Statuses | Each space defines its own workflow stages |

---

## 📋 Step-by-Step Plan: What to Build in What Order

> **Rule**: Always build the backend first, then the frontend. You can't show data that doesn't exist yet.

---

### STEP 1 — Extend the Database (Backend)

**File to edit**: `backend/models.py`

**Why**: Right now we only have a `User` table and a `Task` table. To support Organizations and Spaces, we need more tables.

**New tables to add**:
1. `Organization` — stores company name, logo
2. `Space` — stores department name, color, icon, which org it belongs to
3. `Folder` — stores folder name, which space it belongs to
4. `List` — stores list name, which space/folder it belongs to
5. `Status` — custom statuses per space (To Do, In Progress, Done...)
6. `Tag` — stores label name and color
7. `Comment` — stores task comments
8. `ActivityLog` — stores history of changes

**Also extend the Task table** to add: priority, due date, parent task (for subtasks), which list it belongs to.

---

### STEP 2 — Create New API Endpoints (Backend)

**Folder**: `backend/routers/`

**New files to create**:

| File | What it does |
|------|-------------|
| `orgs.py` | Create/get/update organization |
| `spaces.py` | Create/get/update spaces inside an org |
| `lists.py` | Create/get/update lists inside a space |
| `tags.py` | Create tags, attach tags to tasks |
| `comments.py` | Add/read comments on tasks |
| `dashboard.py` | Return stats (total tasks, overdue count, etc.) |

---

### STEP 3 — Design System (Frontend)

**File to edit**: `frontend/app/globals.css`

Add CSS variables for colors, font sizes, spacing so all components look consistent:

```css
:root {
  --bg-primary: #FFFFFF;
  --text-primary: #1A1A1A;
  --accent-primary: #6C47FF;
  --border-subtle: #E8E8E6;
}
```

---

### STEP 4 — Build the Sidebar (Frontend)

**File to create**: `frontend/components/layout/Sidebar.tsx`

Contains: Organization name, search box, Dashboard link, list of all Spaces (expandable with their Lists inside), "New Space" button, Settings, User profile.

---

### STEP 5 — Build the Board View (Frontend)

**File to create**: `frontend/components/views/BoardView.tsx`

Kanban columns (one per status), task cards inside, drag a card to new column → API call to change status.

---

### STEP 6 — Build the List View (Frontend)

**File to create**: `frontend/components/views/ListView.tsx`

Spreadsheet-style task table. Columns: checkbox, title, assignee, priority, due date, status. Click a cell to edit inline.

---

### STEP 7 — Build the Task Detail Panel (Frontend)

**File to create**: `frontend/components/tasks/TaskDetailPanel.tsx`

Slides in from the right when you click a task. Contains: title, status, priority, assignee, due date, description, subtasks, checklist, activity log, comments.

---

### STEP 8 — Build the Calendar View (Frontend)

**File to create**: `frontend/components/views/CalendarView.tsx`

Month/week/day calendar. Tasks appear on their due date. Drag to reschedule.

---

### STEP 9 — Build the Dashboard (Frontend)

**File to create**: `frontend/app/(app)/dashboard/page.tsx`

Stats overview: total tasks, active, overdue, done. Activity feed. My tasks. Workload per team member.

---

### STEP 10 — Templates

**Backend file**: `backend/data/templates.json`

Pre-built space configs (Software Sprint, Marketing Campaign, etc.) that users can pick when creating a new Space.

---

## 🔑 Key Concepts Explained Simply

### What is an API?
Think of it as a **restaurant menu**. The frontend (customer) orders: "Give me all tasks for user 123". The backend (kitchen) prepares the data and serves it back.

In our app, all API calls go to `http://localhost:8000`:
- `GET /api/tasks` → give me all tasks
- `POST /api/tasks` → create a new task
- `PATCH /api/tasks/5` → update task number 5
- `DELETE /api/tasks/5` → delete task number 5

### What is JWT?
When you login, the backend gives you a **token** (like a wristband at a concert). Every future API request includes this token. The backend checks the token to know who you are — without needing to look you up in the database every time.

### What is a Component?
A reusable piece of UI. Instead of writing a full button in HTML every time, you create a `Button` component once and use `<Button>Click me</Button>` anywhere. Components live in `frontend/components/`.

### What is a Database Table?
Like an Excel sheet. Each table has columns (like `id`, `title`, `completed`, `user_id`) and each row is one record (one task, one user, one space).

---

## 🚦 How to Run the Project Right Now

**Terminal 1 — Start the Backend:**
```bash
cd d:\projects\hackathon\hackathon_2\backend
uv run uvicorn main:app --reload --port 8000
```
Then open: http://localhost:8000/docs — you'll see all API endpoints

**Terminal 2 — Start the Frontend:**
```bash
cd d:\projects\hackathon\hackathon_2\frontend
npm run dev
```
Then open: http://localhost:3000 — your web app

---

## 📚 Which Doc to Read for What

| Document | What it tells you |
|----------|-------------------|
| `BEGINNER-GUIDE.md` (this file) | Everything from scratch in simple language |
| `feature-requirements.md` | Complete list of ALL features with technical details |
| `ui-design-plan.md` | Exact design specs — colors, fonts, spacing, component designs |
| `implementation-plan.md` | Checklist of 33 tasks (BA-01 to FE-20) to build in order |

---

*You're not expected to know everything at once. Read this guide, look at the existing code, ask questions, and build one step at a time. Every senior developer started exactly where you are right now.* 🚀
