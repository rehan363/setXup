# Modern Full-Stack Todo Application

A modern, robust, and secure full-stack Todo application developed as a decoupled monorepo. It features a responsive Next.js 16 user interface and a high-performance FastAPI backend, utilizing Neon Serverless PostgreSQL and a shared-secret JWT session authentication pattern.

---

## 🚀 Key Features

*   **Monorepo Architecture**: Decoupled frontend and backend communicating via standard HTTP REST APIs.
*   **Next.js 16 Frontend**: App Router layout, TypeScript, Tailwind CSS, and custom cookie-based React session hooks.
*   **FastAPI Backend**: Fully asynchronous endpoints, Python 3.14, and SQLModel (SQLAlchemy + Pydantic integration).
*   **Database**: Production-ready Neon Serverless PostgreSQL with automatic SQLite fallback for local test runs.
*   **Shared-Secret JWT Auth**: Secured user-isolation pattern where users can only query their own tasks.
*   **Linting & Verification**: Complete automated testing and code style checks integrated into the repository.
*   **CI/CD Ready**: Configured for automated GitHub Actions pipeline testing and deployment onto Vercel/Koyeb.

---

## 📂 Project Structure

```text
hackathon-todo/
├── frontend/              # Next.js 16 client application
│   ├── app/               # Next.js App Router (Layouts & Views)
│   ├── components/        # Reusable React UI components
│   ├── lib/               # API clients, hooks, and session helpers
│   └── package.json       # Frontend package configuration
├── backend/               # FastAPI Python application
│   ├── routers/           # HTTP route handlers (Auth, Tasks, Orgs)
│   ├── models.py          # SQLModel Database entity declarations
│   ├── schemas.py         # Request and response data models
│   ├── tests/             # Pytest test suite
│   └── pyproject.toml     # UV/Python dependency management
├── specs/                 # Spec-Kit driven application contracts
├── Doc/                   # System design and deployment documents
└── .github/workflows/     # GitHub Actions CI/CD configuration
```

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons.
*   **Backend**: FastAPI, SQLModel, Uvicorn, PyJWT, Bcrypt.
*   **Database**: Neon Serverless Postgres.
*   **Dependency Management**: `npm` (Frontend) and `uv` (Backend).

---

## 💻 Local Development Setup

### Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js (v20+)](https://nodejs.org/)
*   [uv (Python package installer)](https://docs.astral.sh/uv/)

---

### Step 1: Database Setup
The application is pre-configured to connect to **Neon Postgres** in production. For local development, create a Neon project, fetch your database connection string, and set it in your backend environment configuration.

---

### Step 2: Backend Setup & Run

1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies and create a Python virtual environment:
    ```bash
    uv sync
    ```
3.  Create a `.env` file based on `.env.example` and populate your secrets:
    ```bash
    cp .env.example .env
    ```
4.  Run database tables initialization:
    ```bash
    uv run python init_db.py
    ```
5.  Start the FastAPI development server:
    ```bash
    uv run uvicorn main:app --reload --port 8000
    ```
    *The API will be available at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.*

---

### Step 3: Frontend Setup & Run

1.  Navigate into the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file based on `.env.local.example`:
    ```bash
    cp .env.local.example .env.local
    ```
4.  Launch the Next.js development server:
    ```bash
    npm run dev
    ```
    *Open `http://localhost:3000` in your browser to interact with the application.*

---

## 🗝️ Environment Variables

### Backend Configuration (`backend/.env`)
*   `DATABASE_URL`: The Neon PostgreSQL connection string.
*   `BETTER_AUTH_SECRET`: The shared secret string used to sign/verify JWT tokens.
*   `ALLOWED_ORIGINS`: Comma-separated domains allowed to call the API (e.g., `http://localhost:3000`).

### Frontend Configuration (`frontend/.env.local`)
*   `NEXT_PUBLIC_API_URL`: Points to the running backend (defaults to `http://localhost:8000`).
*   `BETTER_AUTH_SECRET`: Must exactly match the `BETTER_AUTH_SECRET` in the backend.
*   `BETTER_AUTH_URL`: The browser URL where the frontend is hosted (defaults to `http://localhost:3000`).

---

## 🧪 Testing and Quality Checks

We use automated checking to keep the codebase clean. Run these commands locally before committing code:

### Backend Testing
```bash
cd backend
# Run test suite (executes inside a mock SQLite DB environment)
uv run pytest
# Run style check
uv run ruff check .
```

### Frontend Testing
```bash
cd frontend
# Run linter
npm run lint
# Verify TypeScript compile types
npx tsc --noEmit
```

---

## 🚀 CI/CD & Deployment

This project contains a fully automated CI/CD pipeline configured inside [.github/workflows/ci.yml](file:///.github/workflows/ci.yml).

*   **Continuous Integration (CI)**: Runs on every Pull Request to `main`. It executes backend Python tests (`pytest` via `uv`) and frontend Node tests (`eslint`, `tsc`, and `next build`).
*   **Continuous Deployment (CD)**: Automatically triggers once code is successfully merged into `main`:
    *   **Frontend** deploys to **Vercel** via Vercel's GitHub Integration.
    *   **Backend** deploys to **Koyeb** or **Render** automatically via Git hooks.
