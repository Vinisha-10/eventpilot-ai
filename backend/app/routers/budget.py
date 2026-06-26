"""
EventPilot AI — Budget Router
Budget tracking, insights, and AI optimization.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import BudgetItemCreate, BudgetItemUpdate, APIResponse
from app.agents.budget import BudgetAgent

router = APIRouter()


@router.get("/{event_id}", response_model=APIResponse)
async def list_budget_items(event_id: str, user: dict = Depends(require_auth)):
    """List all budget items for an event."""
    try:
        supabase = get_supabase()
        response = supabase.table("budget_items").select("*").eq(
            "event_id", event_id
        ).order("category").execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}", response_model=APIResponse)
async def add_budget_item(event_id: str, item: BudgetItemCreate, user: dict = Depends(require_auth)):
    """Add a budget item."""
    try:
        supabase = get_supabase()
        data = item.model_dump()
        data["event_id"] = event_id
        response = supabase.table("budget_items").insert(data).execute()
        return APIResponse(success=True, message="Budget item added", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{event_id}/{item_id}", response_model=APIResponse)
async def update_budget_item(event_id: str, item_id: str, item: BudgetItemUpdate, user: dict = Depends(require_auth)):
    """Update a budget item."""
    try:
        supabase = get_supabase()
        data = item.model_dump(exclude_unset=True)
        response = supabase.table("budget_items").update(data).eq(
            "id", item_id
        ).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Budget item updated", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}/{item_id}", response_model=APIResponse)
async def delete_budget_item(event_id: str, item_id: str, user: dict = Depends(require_auth)):
    """Delete a budget item."""
    try:
        supabase = get_supabase()
        supabase.table("budget_items").delete().eq("id", item_id).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Budget item deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/insights", response_model=APIResponse)
async def get_budget_insights(event_id: str, user: dict = Depends(require_auth)):
    """Get AI-powered budget analysis and optimization suggestions."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("*").eq("id", event_id).single().execute()
        items = supabase.table("budget_items").select("*").eq("event_id", event_id).execute()

        agent = BudgetAgent()
        result = await agent.execute({
            "total_budget": event.data.get("total_budget", 0),
            "spent_budget": event.data.get("spent_budget", 0),
            "budget_items": items.data or [],
            "event_type": event.data.get("event_type", "general"),
            "start_date": event.data.get("start_date", ""),
        })

        return APIResponse(success=True, data=result.get("data"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
