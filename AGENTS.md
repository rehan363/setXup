# Todo App - Hackathon II (Phase II Active)

## Project Overview
This is a monorepo using opencode with Spec-Kit for spec-driven development.
The project is currently in **Phase II: Full-Stack Web Application**.

## Tech Stack
- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLModel, Python 3.13+
- **Database**: Neon Serverless PostgreSQL
- **Auth**: Better Auth + JWT (Shared Secret Pattern)

## Directory Structure
```
hackathon-todo/
├── frontend/          # Next.js frontend
├── backend/           # FastAPI backend
├── specs/             # Feature, API, and DB specifications
├── phase1-console/    # Archived Phase I implementation
└── AGENTS.md          # Project Constitution & Navigation
```

## Development Workflow
1. **Read Spec**: Check `specs/features/`, `specs/api/`, or `specs/database/`.
2. **Implement Backend**: Navigate to `backend/` and follow `backend/agents.md`.
3. **Implement Frontend**: Navigate to `frontend/` and follow `frontend/agents.md`.
4. **Test**: Verify integration between Next.js and FastAPI.

## Key Principles (Phase II)
- **Spec-Driven**: Write specs in `/specs` before any implementation.
- **No Manual Coding**: Use opencode for all code generation.
- **Shared Secret**: Use a shared `BETTER_AUTH_SECRET` for JWT verification.
- **User Isolation**: All database operations must filter by the authenticated `user_id`.

## Commands
- **Backend**: `cd backend && uvicorn main:app --reload --port 8000`
- **Frontend**: `cd frontend && npm run dev`

## Active Plan
**Current Milestone**: Phase II - Full-Stack Web Application
**Target**: Implement authentication, REST API, and responsive web UI
**Spec**: `specs/002-phase2-webapp/spec.md`
**Plan**: `specs/002-phase2-webapp/plan.md`

## Governance
Refer to `.specify/memory/constitution.md` for the full formal rulebook.
Before starting any task, check `.agents/skills/` for relevant Agent Skills.