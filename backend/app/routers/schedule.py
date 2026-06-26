"""
EventPilot AI — Schedule Router
Event schedule generation and management.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import ScheduleGenerateRequest, APIResponse
from app.agents.schedule import ScheduleAgent

router = APIRouter()


@router.post("/generate", response_model=APIResponse)
async def generate_schedule(request: ScheduleGenerateRequest, user: dict = Depends(require_auth)):
    """Generate an AI-powered event schedule."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("*").eq("id", request.event_id).single().execute()
        tasks = supabase.table("tasks").select("*").eq("event_id", request.event_id).execute()

        agent = ScheduleAgent()
        result = await agent.execute({
            "event_name": event.data["name"],
            "event_type": event.data["event_type"],
            "start_date": event.data["start_date"],
            "end_date": event.data.get("end_date", ""),
            "venue": event.data.get("venue_name", ""),
            "guest_count": event.data.get("max_guests", 0),
            "tasks": tasks.data or [],
            "preferences": request.preferences or "",
        })

        return APIResponse(success=True, data=result.get("data"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
