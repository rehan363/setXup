---

description: "Task list for Phase II Full-Stack Web Application implementation"
---

# Tasks: Phase II Full-Stack Web Application

**Input**: Design documents from `/specs/002-phase2-webapp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure per plan.md (`backend/`)
- [X] T002 Create frontend directory structure per plan.md (`frontend/`)
- [X] T003 [P] Initialize Python backend with uv (pyproject.toml, dependencies)
- [X] T004 [P] Initialize Next.js frontend with npm (package.json, dependencies)
- [X] T005 Create `.env` template files for backend and frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T006 Configure Neon Postgres database connection in `backend/database.py`
- [X] T007 [P] Implement SQLModel User and Task tables in `backend/models.py`
- [X] T008 [P] Create Pydantic schemas for auth and tasks in `backend/schemas.py`
- [X] T009 Configure CORS middleware in `backend/main.py`
- [X] T010 Implement JWT verification middleware in `backend/auth.py`
- [X] T011 Create database initialization script in `backend/init_db.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Allow new users to register and existing users to log in with JWT token generation

**Independent Test**: Can be tested by completing registration, logging out, and logging back in to verify persistent identity

### Implementation for User Story 1

- [X] T012 [P] [US1] Create User model in `backend/models.py` (already in T007)
- [X] T013 [P] [US1] Create auth schemas in `backend/schemas.py` (already in T008)
- [X] T014 [US1] Implement password hashing utility in `backend/utils.py`
- [X] T015 [US1] Implement user registration endpoint in `backend/routers/users.py`
- [X] T016 [US1] Implement user login endpoint with JWT generation in `backend/routers/users.py`
- [X] T017 [US1] Add JWT middleware to protect routes in `backend/auth.py` (already in T010)
- [X] T018 [US1] Add Better Auth frontend configuration in `frontend/lib/auth.ts`
- [X] T019 [US1] Create login page UI in `frontend/app/(auth)/login/page.tsx`
- [X] T020 [US1] Create register page UI in `frontend/app/(auth)/register/page.tsx`
- [X] T021 [US1] Implement auth API client in `frontend/lib/api-client.ts`

**Checkpoint**: User Story 1 should be functional - users can register, login, and receive JWT tokens

---

## Phase 4: User Story 2 - Authenticated Task Management (Priority: P1)

**Goal**: Allow authenticated users to create, read, update, and delete their own tasks with user isolation

**Independent Test**: Can be tested by creating tasks, logging out, logging in as a different user, and verifying tasks are not visible

### Implementation for User Story 2

- [X] T022 [P] [US2] Create Task model in `backend/models.py` (already in T007)
- [X] T023 [P] [US2] Create task schemas in `backend/schemas.py` (already in T008)
- [X] T024 [US2] Implement task creation endpoint in `backend/routers/tasks.py`
- [X] T025 [US2] Implement task list endpoint with user_id filter in `backend/routers/tasks.py`
- [X] T026 [US2] Implement task get endpoint in `backend/routers/tasks.py`
- [X] T027 [US2] Implement task update endpoint in `backend/routers/tasks.py`
- [X] T028 [US2] Implement task delete endpoint in `backend/routers/tasks.py`
- [X] T029 [US2] Implement task service layer in `backend/services/task_service.py`
- [X] T030 [US2] Add user isolation validation for all endpoints

**Checkpoint**: User Story 2 should be functional - users can CRUD their own tasks only

---

## Phase 5: User Story 3 - Modern Web Interface (Priority: P1)

**Goal**: Provide a modern, responsive web interface for managing tasks

**Independent Test**: Can be tested by loading the web app and completing all CRUD operations through the UI

### Implementation for User Story 3

- [X] T031 [P] [US3] Create root layout in `frontend/app/layout.tsx`
- [X] T032 [P] [US3] Create auth layout in `frontend/app/(auth)/layout.tsx`
- [X] T033 [P] [US3] Create app layout in `frontend/app/(app)/layout.tsx`
- [X] T034 [US3] Create task list UI component in `frontend/components/tasks/TaskList.tsx`
- [X] T035 [US3] Create task item component in `frontend/components/tasks/TaskItem.tsx`
- [X] T036 [US3] Create task form component in `frontend/components/tasks/TaskForm.tsx`
- [X] T037 [US3] Create main tasks page in `frontend/app/(app)/page.tsx`
- [X] T038 [US3] Add session management and protected routes middleware
- [X] T039 [US3] Add loading and error states to UI
- [X] T040 [US3] Make UI responsive for mobile devices

**Checkpoint**: User Story 3 should be functional - complete UI experience for task management

---

## Phase 6: User Story 4 - REST API Access (Priority: P2)

**Goal**: Expose a REST API for programmatic task access with proper authentication

**Independent Test**: Can be tested by making HTTP requests to the API endpoints and verifying responses

### Implementation for User Story 4

- [X] T041 [P] [US4] Verify all task endpoints return proper JSON in `backend/routers/tasks.py`
- [X] T042 [P] [US4] Verify error responses follow contract in `backend/routers/tasks.py`
- [X] T043 [US4] Configure OpenAPI/Swagger documentation in `backend/main.py`
- [X] T044 [US4] Add comprehensive error handling for all endpoints

**Checkpoint**: User Story 4 should be functional - API is documented and properly returns errors

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T045 Add input validation for title length limits
- [X] T046 Handle edge cases (empty task list, long titles, network errors)
- [X] T047 [P] Update quickstart.md with usage instructions
- [X] T048 Ensure all environment variables are documented
- [X] T049 Test login and task operations end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Must complete first - authentication is required for all other stories
- **User Story 2 (P1)**: Depends on US1 - needs JWT auth working first
- **User Story 3 (P1)**: Depends on US1 and US2 - needs API working first
- **User Story 4 (P2)**: Can proceed in parallel with US3 - API already implemented in US2

### Within Each User Story

- Models before services
- Services before endpoints
- Backend implementation before frontend integration
- Story complete before moving to next priority

### Parallel Opportunities

- T003 and T004 can run in parallel (project initialization)
- T007 and T008 can run in parallel (models/schemas)
- T022 and T023 can run in parallel (Task model/schemas for US2)
- T031, T032, T033 can run in parallel (layout components)
- T034, T035, T036 can run in parallel (task components)

---

## Parallel Example: Backend Setup

```bash
# Launch all models and schemas together:
Task: "Implement SQLModel User and Task tables in backend/models.py"
Task: "Create Pydantic schemas for auth and tasks in backend/schemas.py"
```

---Parallel Example: Frontend Layout

```bash
# Launch all layouts together:
Task: "Create root layout in frontend/app/layout.tsx"
Task: "Create auth layout in frontend/app/(auth)/layout.tsx"
Task: "Create app layout in frontend/app/(app)/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundational + Core US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication works!)
4. Complete Phase 4: User Story 2 (Task CRUD works!)
5. **STOP and VALIDATE**: Test core functionality
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy (Auth MVP!)
3. Add User Story 2 → Test → Deploy (Backend Complete!)
4. Add User Story 3 → Test → Deploy (Full App!)
5. Add User Story 4 → Test → Deploy (API Documented!)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth)
   - Developer B: User Story 2 (Task CRUD)
3. Stories integrate at phase boundaries

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence