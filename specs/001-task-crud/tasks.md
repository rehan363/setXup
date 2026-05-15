# Tasks: Task CRUD Operations

**Feature**: Task CRUD Operations  
**Plan**: `specs/001-task-crud/plan.md`  
**Generated**: 2026-04-25

## Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
Add Task (Phase 3) [US1]
View Tasks (Phase 4) [US2]
Delete Task (Phase 5) [US3]
Update Task (Phase 6) [US4]
Mark Complete (Phase 7) [US5]
    ↓
Integration & Polish (Phase 8)
```

## Phase 1: Project Setup

- [X] T001 Initialize project structure with README, agents.md, requirements files
- [X] T002 [P] Create src/__init__.py with package metadata
- [X] T003 Verify Python 3.13+ environment

## Phase 2: Foundational

- [X] T004 Create Task model in src/models.py (dataclass per data-model.md)
- [X] T005 Create in-memory task store in src/services.py
- [X] T006 [P] Add validation functions for title/description (per FR-001, edge cases)

## Phase 3: Add Task [US1]

**Goal**: Users can add new tasks with title and optional description  
**Independent Test**: Add task, verify it appears in list

- [X] T007 [US1] Implement add_task service in src/services.py
- [X] T008 [US1] Add CLI command for adding tasks in src/cli.py

## Phase 4: View Tasks [US2]

**Goal**: Users can see all tasks with status  
**Independent Test**: Add tasks, view list, verify all appear

- [X] T009 [US2] Implement list_tasks service in src/services.py
- [X] T010 [US2] Add CLI command for listing tasks in src/cli.py
- [X] T011 [US2] Add empty list messaging

## Phase 5: Delete Task [US3]

**Goal**: Users can remove tasks by ID  
**Independent Test**: Add task, delete it, verify removed

- [X] T012 [US3] Implement delete_task service in src/services.py
- [X] T013 [US3] Add CLI command for deleting tasks in src/cli.py
- [X] T014 [US3] Handle non-existent task errors

## Phase 6: Update Task [US4]

**Goal**: Users can modify task title and description  
**Independent Test**: Add task, update it, verify changes

- [X] T015 [US4] Implement update_task service in src/services.py
- [X] T016 [US4] Add CLI command for updating tasks in src/cli.py

## Phase 7: Mark Complete [US5]

**Goal**: Users can toggle task completion status  
**Independent Test**: Add task, mark complete, verify status changes

- [X] T017 [US5] Implement toggle_complete service in src/services.py
- [X] T018 [US5] Add CLI command for marking complete in src/cli.py
- [X] T019 [US5] Toggle between complete/incomplete states

## Phase 8: Integration & Polish

- [X] T020 Integrate CLI main loop in src/cli.py
- [X] T021 Add help command
- [X] T022 Add exit command
- [X] T023 [P] Test all 5 features end-to-end
- [X] T024 Update quickstart.md with final usage

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 24 |
| Parallelizable | 3 (T002, T003, T023) |
| User Stories | 5 (US1-US5) |

## Independent Test Criteria

| User Story | Test |
|-----------|------|
| US1 Add | Add "test task", verify in list |
| US2 View | List shows all tasks with status |
| US3 Delete | Delete task, verify removed |
| US4 Update | Update title, verify change |
| US5 Complete | Toggle complete, verify status |

## MVP Scope

**Phase 3: Add Task** (US1) - Core feature, enables all testing