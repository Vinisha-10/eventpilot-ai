"""
EventPilot AI — Middleware
CORS, rate limiting, and authentication middleware.
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter per IP address."""

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ("/health", "/docs", "/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old entries
        self.requests[client_ip] = [
            t for t in self.requests[client_ip]
            if now - t < self.window_seconds
        ]

        # Check limit
        if len(self.requests[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."}
            )

        self.requests[client_ip].append(now)
        return await call_next(request)


async def verify_supabase_token(request: Request) -> dict | None:
    """
    Extract and verify the Supabase JWT from the Authorization header.
    Returns the user data if valid, None otherwise.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    if not token:
        return None

    # We'll use Supabase's own auth verification
    from app.database import get_supabase
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "id": str(user_response.user.id),
                "email": user_response.user.email,
                "role": user_response.user.role,
            }
    except Exception:
        return None

    return None


async def require_auth(request: Request) -> dict:
    """Dependency that requires authentication. Raises 401 if not authenticated."""
    user = await verify_supabase_token(request)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Please provide a valid access token."
        )
    return user
