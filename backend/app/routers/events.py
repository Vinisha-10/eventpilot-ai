"""
EventPilot AI — Events Router
CRUD operations for events + AI plan generation.
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import EventCreate, EventUpdate, EventResponse, APIResponse
from app.agents.planner import PlannerAgent
from app.services.weather import get_weather_forecast

router = APIRouter()


@router.get("/", response_model=APIResponse)
async def list_events(user: dict = Depends(require_auth)):
    """List all events for the authenticated user."""
    try:
        supabase = get_supabase()
        response = supabase.table("events").select("*").eq(
            "user_id", user["id"]
        ).order("start_date", desc=False).execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=APIResponse)
async def create_event(event: EventCreate, user: dict = Depends(require_auth)):
    """Create a new event."""
    try:
        supabase = get_supabase()
        data = event.model_dump()
        data["user_id"] = user["id"]
        data["start_date"] = data["start_date"].isoformat()
        if data.get("end_date"):
            data["end_date"] = data["end_date"].isoformat()

        response = supabase.table("events").insert(data).execute()
        return APIResponse(
            success=True,
            message="Event created successfully",
            data=response.data[0] if response.data else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}", response_model=APIResponse)
async def get_event(event_id: str, user: dict = Depends(require_auth)):
    """Get a specific event by ID."""
    try:
        supabase = get_supabase()
        response = supabase.table("events").select("*").eq(
            "id", event_id
        ).eq("user_id", user["id"]).single().execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Event not found")


@router.patch("/{event_id}", response_model=APIResponse)
async def update_event(event_id: str, event: EventUpdate, user: dict = Depends(require_auth)):
    """Update an event."""
    try:
        supabase = get_supabase()
        data = event.model_dump(exclude_unset=True)
        if "start_date" in data and data["start_date"]:
            data["start_date"] = data["start_date"].isoformat()
        if "end_date" in data and data["end_date"]:
            data["end_date"] = data["end_date"].isoformat()

        response = supabase.table("events").update(data).eq(
            "id", event_id
        ).eq("user_id", user["id"]).execute()
        return APIResponse(success=True, message="Event updated", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}", response_model=APIResponse)
async def delete_event(event_id: str, user: dict = Depends(require_auth)):
    """Delete an event."""
    try:
        supabase = get_supabase()
        supabase.table("events").delete().eq(
            "id", event_id
        ).eq("user_id", user["id"]).execute()
        return APIResponse(success=True, message="Event deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/generate-plan", response_model=APIResponse)
async def generate_event_plan(event_id: str, user: dict = Depends(require_auth)):
    """Generate an AI event plan for the specified event."""
    try:
        # Fetch the event
        supabase = get_supabase()
        event_response = supabase.table("events").select("*").eq(
            "id", event_id
        ).eq("user_id", user["id"]).single().execute()
        event = event_response.data

        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Get weather forecast if we have coordinates
        weather = None
        if event.get("venue_lat") and event.get("venue_lng"):
            weather = await get_weather_forecast(
                event["venue_lat"], event["venue_lng"], event["start_date"]
            )

        # Generate AI plan
        planner = PlannerAgent()
        context = {
            **event,
            "weather": weather,
        }
        result = await planner.execute(context)

        if result.get("success") and result.get("data"):
            # Save the plan to the event
            plan_data = result["data"]
            if weather:
                plan_data["weather_advisory"] = weather.get("advisory", "")

            supabase.table("events").update(
                {"ai_plan": plan_data}
            ).eq("id", event_id).execute()

            return APIResponse(
                success=True,
                message="AI plan generated successfully",
                data=plan_data
            )

        raise HTTPException(status_code=500, detail="Failed to generate plan")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/dashboard", response_model=APIResponse)
async def get_event_dashboard(event_id: str, user: dict = Depends(require_auth)):
    """Get dashboard stats for a specific event."""
    try:
        supabase = get_supabase()

        # Fetch all related data in parallel
        event = supabase.table("events").select("*").eq("id", event_id).eq("user_id", user["id"]).single().execute()
        guests = supabase.table("guests").select("rsvp_status").eq("event_id", event_id).execute()
        tasks = supabase.table("tasks").select("status").eq("event_id", event_id).execute()
        vendors = supabase.table("vendors").select("status").eq("event_id", event_id).execute()
        budget = supabase.table("budget_items").select("estimated_cost,actual_cost").eq("event_id", event_id).execute()

        # Calculate stats
        guest_data = guests.data or []
        task_data = tasks.data or []
        vendor_data = vendors.data or []
        budget_data = budget.data or []

        return APIResponse(
            success=True,
            data={
                "event": event.data,
                "guests": {
                    "total": len(guest_data),
                    "accepted": sum(1 for g in guest_data if g["rsvp_status"] == "accepted"),
                    "declined": sum(1 for g in guest_data if g["rsvp_status"] == "declined"),
                    "pending": sum(1 for g in guest_data if g["rsvp_status"] == "pending"),
                    "maybe": sum(1 for g in guest_data if g["rsvp_status"] == "maybe"),
                },
                "tasks": {
                    "total": len(task_data),
                    "todo": sum(1 for t in task_data if t["status"] == "todo"),
                    "in_progress": sum(1 for t in task_data if t["status"] == "in_progress"),
                    "done": sum(1 for t in task_data if t["status"] == "done"),
                },
                "vendors": {
                    "total": len(vendor_data),
                    "booked": sum(1 for v in vendor_data if v["status"] == "booked"),
                    "contacted": sum(1 for v in vendor_data if v["status"] == "contacted"),
                },
                "budget": {
                    "total_estimated": sum(b.get("estimated_cost", 0) or 0 for b in budget_data),
                    "total_actual": sum(b.get("actual_cost", 0) or 0 for b in budget_data),
                },
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
