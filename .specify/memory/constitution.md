# Todo App Constitution

> **Phase**: II (Full-Stack Web Application)
> **Version**: 2.1.0
> **Ratified**: 2026-04-27

---

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)
Every feature MUST be defined in a specification before implementation begins. The specification MUST contain user stories, acceptance criteria, and clear scope boundaries. opencode SHALL NOT generate any code without a referenced Task ID from the specification. This ensures traceable requirements and eliminates scope creep.

### II. No Manual Code Generation
The developer SHALL NOT write code manually. All implementation MUST be generated through opencode from specifications. If the generated code does not match requirements, the specification SHALL be refined until opencode produces correct output. This enforces the spec-driven development methodology central to the hackathon.

### III. Clean Architecture
All code MUST follow clean code principles: single responsibility, clear naming conventions, and proper separation of concerns. Python projects MUST use proper module structure with separate directories for models, services, and CLI interface. No procedural code in module root unless it's a simple wrapper. Frontend code MUST follow React/Next.js best practices with component co-location and proper prop typing.

### IV. In-Memory State Management (Phase I Only)
For Phase I, data was stored in memory only. This principle is deprecated in Phase II in favor of Database Persistence.

### V. CLI-First Interface (Phase I Only)
The Phase I console application used a CLI. Phase II moves to a Web-First Interface.

---

## Governance

### Amendment Procedure
Constitution amendments REQUIRE:
1. Clear rationale for the change
2. Consistency check with all templates
3. Version bump following semantic versioning rules

### Versioning Policy
- **MAJOR**: Backward incompatible principle removal or redefinition
- **MINOR**: New principle added or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Enforcement
The constitution MUST be consulted before:
- Creating new specifications
- Implementing new features
- Adding dependencies or changing architecture
- Writing any code that touches authentication or database connections

Any deviation from these principles requires explicit approval in the specification or a constitution amendment.

**Phase I Version**: 1.0.0 | **Ratified**: 2026-04-25
**Current Version**: 2.1.0 | **Ratified**: 2026-04-27

---

# Phase II Extension: Full-Stack Web App (Better Auth + FastAPI + Neon DB)

## Core Principles (Extended)

### VI. REST API Architecture (Phase II)
All backend services MUST expose RESTful HTTP endpoints following OpenAPI standards. Endpoints MUST return proper HTTP status codes, support JSON request/response bodies, and include appropriate error responses. The FastAPI backend SHALL serve as the single source of truth for data operations and business logic.

### VII. Database Persistence (Phase II)
All task data MUST be persisted to Neon Serverless Postgres. SQLModel SHALL be used for ORM with proper table definitions. Database connection MUST use environment variables for credentials. All database queries in the backend MUST be filtered by the authenticated user's ID.

### VIII. Frontend-Backend Separation (Phase II)
The Next.js frontend and FastAPI backend MUST reside in separate directories (`frontend/` and `backend/`). The frontend MUST communicate with the backend via HTTP using a central API client. The frontend SHALL NOT have direct database access.

### IX. Authentication & Authorization (Phase II - Better Auth + JWT)
1. **Tooling**: User identity MUST be managed using **Better Auth** on the frontend.
2. **JWT Pattern**: Better Auth MUST be configured to issue **JWT tokens**.
3. **Shared Secret**: Both Frontend and Backend MUST share the same `BETTER_AUTH_SECRET` for signing and verifying tokens.
4. **Backend Verification**: The FastAPI backend MUST implement middleware to verify the JWT token in the `Authorization: Bearer <token>` header on every request.
5. **Isolation**: Every API response MUST be strictly filtered to only include data belonging to the authenticated user.

### X. Type Safety & Documentation (Phase II)
TypeScript MUST be used throughout the Next.js frontend. Python type hints MUST be used in FastAPI. The API contract MUST be documented via FastAPI's auto-generated Swagger UI (/docs).

---

## Technology Stack (Phase II)

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16+ (App Router), TypeScript, Tailwind CSS |
| **Backend** | Python FastAPI, SQLModel |
| **Database** | Neon Serverless PostgreSQL |
| **Auth** | Better Auth (Next.js) + JWT Verification (FastAPI) |
| **Security** | Shared `BETTER_AUTH_SECRET` for JWT signature |

---

## Project Structure (Phase II)

```
hackathon-todo/
├── frontend/                 # Next.js application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/               # Better Auth config & API client
│   └── agents.md          # Frontend-specific instructions
├── backend/                 # FastAPI application
│   ├── main.py            # App entrypoint & middleware
│   ├── models.py          # SQLModel definitions
│   ├── routers/           # API route handlers
│   └── agents.md          # Backend-specific instructions
├── specs/                   # Monorepo specifications
│   ├── features/          # Feature specs
│   ├── api/              # REST API & MCP specs
│   └── database/         # Database schema specs
└── agents.md                # Root constitution & navigation
```

---

## Implementation Rules (Phase II)

1. **Environment Variables**: Use `.env` files (never committed) for `DATABASE_URL` and `BETTER_AUTH_SECRET`.
2. **Stateless Backend**: The FastAPI backend must remain stateless, relying on the JWT for user identification.
3. **CORS**: FastAPI must explicitly allow the Frontend's origin for development and production.
4. **User Isolation**: Every database operation MUST include `user_id` in the filter (e.g., `select(Task).where(Task.user_id == current_user.id)`).
5. **UI Consistency**: Use the `frontend-ui-engineering` skill to ensure premium, responsive designs.
6. **Error Handling**: All API endpoints MUST return structured error responses with consistent format.
7. **Loading States**: Frontend MUST show loading indicators during API calls.
8. **Input Validation**: All user inputs MUST be validated both on client and server.

### Testing Requirements
- **Backend**: Integration tests for all API endpoints using the FastAPI TestClient
- **Frontend**: Component tests for critical UI paths
- **E2E**: At minimum, verify login flow and CRUD operations

### Security Principles
- Never expose secrets in client-side code
- Validate JWT expiration
- Use parameterized queries (via SQLModel) to prevent SQL injection
- Sanitize user inputs rendered in HTML

---

## Deliverable Checkpoints (Phase II)

For Phase II submission, the project MUST demonstrate:
1. **User Auth**: Signup/Login via Better Auth.
2. **Secure CRUD**: Tasks are saved to Neon and only visible to the owner.
3. **Responsive UI**: A modern, functional web interface for managing todos.
4. **Verified API**: Backend rejects requests without a valid JWT token.
5. **Spec Adherence**: All features traceable to `/specs`.

---

## Quick Reference

| Command | Action |
|---------|--------|
| `cd backend && uvicorn main:app --reload --port 8000` | Start FastAPI |
| `cd frontend && npm run dev` | Start Next.js |
| `./opencode --spec specs/features/` | Create feature spec |