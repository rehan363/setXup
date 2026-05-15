from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import users as users_router
from routers import tasks as tasks_router

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
app.include_router(tasks_router.router)  # T024-T028: /api/tasks

# --- Health Check ---
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "phase": "II"}
