from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import users as users_router
from routers import tasks as tasks_router
from routers import orgs as orgs_router
from routers import spaces as spaces_router
from routers import lists as lists_router
from routers import tags as tags_router
from routers import comments as comments_router
from routers import dashboard as dashboard_router
from routers import templates as templates_router
from routers import statuses as statuses_router

load_dotenv()

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request, status

app = FastAPI(
    title="Todo App API",
    description="Phase II REST API for Todo App — secured with Better Auth JWT",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    T044: Map FastAPI's default 422 validation errors to 400 Bad Request
    to perfectly match our api.md contract.
    """
    errors = exc.errors()
    error_msg = errors[0]["msg"] if errors else "Invalid field values"
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": error_msg},
    )

# --- CORS Middleware (T009) ---
# Applying neon-postgres skill: keep backend stateless, allow frontend origin
origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(users_router.router)  # T015 + T016: /api/auth/register, /api/auth/login
app.include_router(tasks_router.router)  # T024-T028, BA-12: /api/tasks
app.include_router(orgs_router.router)   # BA-03: /api/orgs
app.include_router(spaces_router.router) # BA-04: /api/spaces
app.include_router(lists_router.router)  # BA-05: /api/lists, folders
app.include_router(tags_router.router)   # BA-06: /api/tags
app.include_router(comments_router.router) # BA-07: /api/comments
app.include_router(dashboard_router.router) # BA-08: /api/dashboard
app.include_router(templates_router.router) # BA-11: /api/templates
app.include_router(statuses_router.router) # Custom Statuses per Space

# --- Health Check ---
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "phase": "II"}

