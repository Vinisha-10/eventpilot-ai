"""
EventPilot AI — Chat Router
AI chat assistant with tool calling and conversation history.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import ChatMessage, APIResponse
from app.agents.chat import ChatOrchestrator
import json

router = APIRouter()

# Singleton orchestrator
_orchestrator = None


def get_orchestrator() -> ChatOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ChatOrchestrator()
    return _orchestrator


@router.post("/message", response_model=APIResponse)
async def send_message(message: ChatMessage, user: dict = Depends(require_auth)):
    """Send a message to the AI chat assistant."""
    try:
        supabase = get_supabase()
        orchestrator = get_orchestrator()

        # Get event context if provided
        event_context = None
        if message.event_id:
            try:
                event = supabase.table("events").select("*").eq(
                    "id", message.event_id
                ).single().execute()
                event_context = event.data
            except Exception:
                pass

        # Get conversation history
        history = []
        try:
            history_query = supabase.table("messages").select("role,content").eq(
                "user_id", user["id"]
            )
            if message.event_id:
                history_query = history_query.eq("event_id", message.event_id)
            history_response = history_query.order("created_at", desc=True).limit(10).execute()
            history = list(reversed(history_response.data or []))
        except Exception:
            pass

        # Save user message
        supabase.table("messages").insert({
            "user_id": user["id"],
            "event_id": message.event_id,
            "role": "user",
            "content": message.content,
        }).execute()

        # Process with AI
        result = await orchestrator.chat(
            message=message.content,
            event_context=event_context,
            history=history,
        )

        # Save assistant response
        supabase.table("messages").insert({
            "user_id": user["id"],
            "event_id": message.event_id,
            "role": "assistant",
            "content": result["response"],
            "tool_calls": result.get("tool_calls"),
            "metadata": {"intent": result.get("intent")},
        }).execute()

        return APIResponse(
            success=True,
            data={
                "response": result["response"],
                "suggestions": result.get("suggestions", []),
                "tool_calls": result.get("tool_calls"),
                "intent": result.get("intent"),
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=APIResponse)
async def get_chat_history(event_id: str = None, limit: int = 50, user: dict = Depends(require_auth)):
    """Get chat history for the user, optionally filtered by event."""
    try:
        supabase = get_supabase()
        query = supabase.table("messages").select("*").eq("user_id", user["id"])
        if event_id:
            query = query.eq("event_id", event_id)
        response = query.order("created_at", desc=True).limit(limit).execute()
        return APIResponse(success=True, data=list(reversed(response.data or [])))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history", response_model=APIResponse)
async def clear_chat_history(event_id: str = None, user: dict = Depends(require_auth)):
    """Clear chat history."""
    try:
        supabase = get_supabase()
        query = supabase.table("messages").delete().eq("user_id", user["id"])
        if event_id:
            query = query.eq("event_id", event_id)
        query.execute()
        return APIResponse(success=True, message="Chat history cleared")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
