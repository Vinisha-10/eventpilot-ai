"""
EventPilot AI — Marketing Router
AI-powered marketing content generation for multiple platforms.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import MarketingGenerateRequest, APIResponse
from app.agents.marketing import MarketingAgent

router = APIRouter()


@router.get("/{event_id}", response_model=APIResponse)
async def list_marketing_content(event_id: str, user: dict = Depends(require_auth)):
    """List all generated marketing content for an event."""
    try:
        supabase = get_supabase()
        response = supabase.table("marketing_content").select("*").eq(
            "event_id", event_id
        ).order("created_at", desc=True).execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate", response_model=APIResponse)
async def generate_marketing_content(request: MarketingGenerateRequest, user: dict = Depends(require_auth)):
    """Generate marketing content using AI for a specific platform."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("*").eq("id", request.event_id).single().execute()
        event_data = event.data

        agent = MarketingAgent()
        result = await agent.execute({
            "platform": request.platform.value,
            "content_type": request.content_type,
            "event_name": event_data["name"],
            "event_type": event_data["event_type"],
            "event_date": event_data["start_date"],
            "venue": event_data.get("venue_name", ""),
            "theme": event_data.get("theme", ""),
            "tone": request.tone,
            "additional_context": request.additional_context or "",
        })

        if result.get("success") and result.get("data"):
            content_data = result["data"]

            # Save to database
            save_data = {
                "event_id": request.event_id,
                "platform": request.platform.value,
                "content_type": request.content_type,
                "title": content_data.get("title", ""),
                "content": content_data.get("content", str(content_data)),
                "hashtags": content_data.get("hashtags", []),
                "generated_by": "ai",
            }
            supabase.table("marketing_content").insert(save_data).execute()

            return APIResponse(success=True, data=content_data)

        raise HTTPException(status_code=500, detail="Failed to generate content")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}/{content_id}", response_model=APIResponse)
async def delete_marketing_content(event_id: str, content_id: str, user: dict = Depends(require_auth)):
    """Delete marketing content."""
    try:
        supabase = get_supabase()
        supabase.table("marketing_content").delete().eq(
            "id", content_id
        ).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Content deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
