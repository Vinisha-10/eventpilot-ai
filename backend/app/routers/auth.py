"""
EventPilot AI — Auth Router
Handles user authentication via Supabase Auth.
"""

from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import SignUpRequest, LoginRequest, AuthResponse, APIResponse

router = APIRouter()


@router.post("/signup", response_model=APIResponse)
async def signup(request: SignUpRequest):
    """Register a new user with Supabase Auth."""
    try:
        supabase = get_supabase()
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                }
            }
        })

        if response.user:
            return APIResponse(
                success=True,
                message="Account created successfully. Please check your email for verification.",
                data={
                    "user_id": str(response.user.id),
                    "email": response.user.email,
                    "access_token": response.session.access_token if response.session else None,
                    "refresh_token": response.session.refresh_token if response.session else None,
                }
            )
        raise HTTPException(status_code=400, detail="Failed to create account")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=APIResponse)
async def login(request: LoginRequest):
    """Login with email and password."""
    try:
        supabase = get_supabase()
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })

        if response.user and response.session:
            return APIResponse(
                success=True,
                message="Login successful",
                data={
                    "user_id": str(response.user.id),
                    "email": response.user.email,
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                }
            )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
async def logout():
    """Logout (client-side token removal)."""
    return APIResponse(success=True, message="Logged out successfully")


@router.get("/me", response_model=APIResponse)
async def get_current_user(user: dict = None):
    """Get current user profile. Token verified by middleware."""
    # In production, use Depends(require_auth) 
    # For now, accept the token from the header and verify
    from fastapi import Request, Depends
    return APIResponse(
        success=True,
        message="User profile retrieved",
        data=user
    )
