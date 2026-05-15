# Quickstart: Phase II Full-Stack Web Application

## Prerequisites

- Python 3.13+
- Node.js 20+
- Neon Postgres account (https://neon.tech)
- npm or pnpm

---

## Environment Setup

### 1. Clone and Install

```bash
# Clone repository
cd hackathon-todo

# Backend setup
cd backend
uv sync

# Frontend setup
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/todoapp
BETTER_AUTH_SECRET=your-32-char-minimum-secret-here
ALLOWED_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```bash
BETTER_AUTH_SECRET=your-32-char-minimum-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Initialize Database

```bash
cd backend
uv run python init_db.py
```

---

## Running the Application

### Start Backend

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

Backend available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend available at: http://localhost:3000

---

## First-Time Setup

1. Navigate to http://localhost:3000
2. Click "Register" to create account
3. Log in with email/password
4. Start adding tasks!

---

## Common Commands

| Command | Description |
|---------|-------------|
| `cd backend && uv run uvicorn main:app --reload` | Start backend |
| `cd frontend && npm run dev` | Start frontend |
| `cd backend && uv run pytest` | Run backend tests |
| `cd frontend && npm run test` | Run frontend tests |
| `cd frontend && npm run lint` | Lint frontend code |

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection issues
- Ensure IP allowlist includes your development machine

### JWT Validation Errors
- Ensure `BETTER_AUTH_SECRET` matches exactly in both .env files
- Check token expiration (default: 7 days)
- Verify Authorization header format: `Bearer <token>`

### CORS Errors
- Confirm `ALLOWED_ORIGIN` includes `http://localhost:3000`
- Check browser console for specific CORS errors
- Verify no trailing slashes in origin URL