"""
EventPilot AI — FastAPI Application Entry Point
Main application with router registration, CORS, and middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.middleware import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    settings = get_settings()
    print(f"[START] {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"   Gemini API: {'[OK] configured' if settings.GEMINI_API_KEY else '[MISSING] not configured'}")
    print(f"   Supabase: {'[OK] configured' if settings.SUPABASE_URL else '[MISSING] not configured'}")
    print(f"   HuggingFace: {'[OK] configured' if settings.HUGGINGFACE_API_KEY else '[WARN] not configured (optional)'}")
    print(f"   Resend: {'[OK] configured' if settings.RESEND_API_KEY else '[WARN] not configured (emails will log to console)'}")
    yield
    print(f"[SHUTDOWN] {settings.APP_NAME} shutting down...")


# Create FastAPI app
app = FastAPI(
    title="EventPilot AI",
    description="AI-Powered Event Management Platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    max_requests=settings.RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)

# Register routers
from app.routers import auth, events, guests, budget, vendors, tasks, marketing, schedule, chat

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(guests.router, prefix="/api/guests", tags=["Guests"])
app.include_router(budget.router, prefix="/api/budget", tags=["Budget"])
app.include_router(vendors.router, prefix="/api/vendors", tags=["Vendors"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(marketing.router, prefix="/api/marketing", tags=["Marketing"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
