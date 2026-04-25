# Todo App - Hackathon II

## Project Overview
This is a monorepo using opencode with Spec-Kit for spec-driven development.
The project follows the Evolution of Todo through 5 phases.

## Tech Stack
- **Phase I**: Python Console App (UV, Python 3.13+, opencode)
- **Phase II**: Next.js + FastAPI + SQLModel + Neon DB
- **Phase III**: OpenAI ChatKit + Agents SDK + MCP SDK
- **Phase IV**: Docker + Minikube + Helm + kubectl-ai
- **Phase V**: Kafka + Dapr + DigitalOcean DOKS

## Directory Structure
```
hackathon-todo/
├── frontend/          # Next.js frontend
├── backend/          # FastAPI backend
├── specs/            # Feature specifications
├── .specify/         # Spec-Kit configuration
└── .opencode/       # opencode commands and Agent Skills
```

## Project Structure
- `/frontend` - Next.js 14 app
- `/backend` - Python FastAPI server

## Development Workflow
1. Read spec: `specs/features/[feature].md`
2. Implement backend: `@backend/agents.md`
3. Implement frontend: `@frontend/agents.md`
4. Test and iterate

## Commands
- Backend: `cd backend && uvicorn main:app --reload --port 8000`
- Frontend: `cd frontend && npm run dev`

## Spec-Kit Structure
Specifications are organized in `/specs`:
- `/specs/overview.md` - Project overview
- `/specs/architecture.md` - System architecture
- `/specs/features/` - Feature specifications
- `/specs/api/` - API specifications
- `/specs/database/` - Database specifications
- `/specs/ui/` - UI specifications

## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: `@specs/features/task-crud.md`
3. Use `/speckit.specify` to create new specs
4. Use `/speckit.plan` to generate plan
5. Use `/speckit.tasks` to break into tasks
6. Use `/speckit.implement` to implement

## Phase Progression
| Phase | Features | Technology |
|-------|----------|-------------|
| I | Add, Delete, Update, View, Mark Complete | Python Console |
| II | + REST API, Auth, Neon DB | Next.js + FastAPI |
| III | + AI Chatbot, MCP Tools | ChatKit + Agents SDK |
| IV | + Docker, K8s Deployment | Minikube + Helm |
| V | + Kafka, Dapr, Cloud | DigitalOcean DOKS |

## Key Principles
- **Spec-Driven Development**: Write spec first, then implement via opencode
- **No Manual Coding**: Use opencode to generate all code from specs
- **Reusable Intelligence**: Use Agent Skills for repeated patterns