# Implementation Plan: Phase II Full-Stack Web Application

**Branch**: `002-phase2-webapp` | **Date**: 2026-04-27 | **Spec**: `specs/002-phase2-webapp/spec.md`
**Input**: Feature specification from `/specs/002-phase2-webapp/spec.md`

## Summary

Convert the Phase I console application into a full-stack web application with user authentication, task CRUD via REST API, and a modern responsive frontend. Backend uses FastAPI + SQLModel + Neon Postgres with JWT authentication. Frontend uses Next.js 16 + Better Auth + Tailwind CSS. User data isolation is enforced at the database layer.

## Technical Context

**Language/Version**: Python 3.13+ (Backend), TypeScript (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Pydantic, Better Auth, Next.js 16, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL
**Testing**: FastAPI TestClient, Playwright/Cypress for E2E
**Target Platform**: Web browsers (Chrome, Firefox, Safari, mobile)
**Project Type**: Full-stack web-service with SPA frontend
**Performance Goals**: <200ms API response p95, initial load <3s
**Constraints**: Shared JWT secret between frontend/backend, stateless backend
**Scale/Scope**: Single-user authentication, 100 tasks per user estimate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status | Notes |
|------|-------------|--------|-------|
| GC-01 | Spec-First: Feature spec exists with user stories | PASS | `specs/002-phase2-webapp/spec.md` present |
| GC-02 | No Manual Code: All code via opencode | ENFORCED | No manual implementation yet |
| GC-03 | Clean Architecture: Separated frontend/backend | ENFORCED | `frontend/` and `backend/` directories |
| GC-04 | REST API: Backend exposes HTTP endpoints | PENDING | Implementation required |
| GC-05 | Database Persistence: Neon Postgres + SQLModel | PENDING | Implementation required |
| GC-06 | Auth Pattern: Better Auth + JWT + Shared Secret | PENDING | Implementation required |
| GC-07 | User Isolation: All queries filter by `user_id` | PENDING | Implementation required |
| GC-08 | Environment Variables: No hardcoded secrets | PENDING | `.env` pattern to use |

## Project Structure

### Documentation (this feature)

```text
specs/002-phase2-webapp/
├── plan.md              # This file
├── research.md          # Phase 0 output (auth patterns, API design)
├── data-model.md        # Phase 1 output (User, Task, Session models)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (implementation tasks)
```

### Source Code (repository root)

```text
hackathon-todo/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── (app)/          # Protected app pages
│   │   ├── layout.tsx      # Root layout
│   │   └── api/            # Server actions
│   ├── components/         # React components
│   │   ├── ui/             # Base UI components
│   │   └── tasks/          # Task-specific components
│   ├── lib/                # Utilities
│   │   ├── auth.ts         # Better Auth config
│   │   ├── api-client.ts   # API client
│   │   └── utils.ts        # Helpers
│   ├── .env.local          # Environment (not committed)
│   └── agents.md           # Frontend implementation guide
│
├── backend/                 # FastAPI application
│   ├── main.py            # App entry, CORS, middleware
│   ├── models.py          # SQLModel definitions
│   ├── schemas.py         # Pydantic request/response
│   ├── auth.py            # JWT verification middleware
│   ├── database.py       # Neon connection setup
│   ├── routers/          # API route handlers
│   │   ├── tasks.py       # Task CRUD endpoints
│   │   └── users.py       # User auth endpoints
│   ├── .env               # Environment (not committed)
│   └── agents.md          # Backend implementation guide
│
└── specs/                   # Monorepo specs (existing)
    └── 002-phase2-webapp/ # This feature
```

**Structure Decision**: Option 2 Web application structure per constitution. Frontend and backend in separate directories, communicating via HTTP REST API. JWT tokens for stateless authentication.

## Phase 0: Research

### Research Tasks (NEEDS CLARIFICATION items identified)

| Item | Research Topic | Rationale |
|------|----------------|-----------|
| R-01 | Better Auth JWT configuration | Need correct token structure and signing |
| R-02 | FastAPI JWT verification patterns | Middleware approach for protected routes |
| R-03 | Neon Postgres connection patterns | Best practices for serverless connections |
| R-04 | Next.js 16 App Router + Better Auth integration | Modern React Server Components approach |
| R-05 | CORS configuration for frontend/backend | Development and production origins |

### Phase 0 Output: research.md

See `specs/002-phase2-webapp/research.md` (generated below).

## Phase 1: Design & Contracts

### Data Model

See `specs/002-phase2-webapp/data-model.md` (generated below).

### API Contracts

See `specs/002-phase2-webapp/contracts/` (generated below).

### Quickstart

See `specs/002-phase2-webapp/quickstart.md` (generated below).