"""
EventPilot AI — Tasks Router
Task management with Kanban-style status tracking.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import TaskCreate, TaskUpdate, APIResponse

router = APIRouter()


@router.get("/{event_id}", response_model=APIResponse)
async def list_tasks(event_id: str, user: dict = Depends(require_auth)):
    """List all tasks for an event, ordered by sort_order."""
    try:
        supabase = get_supabase()
        response = supabase.table("tasks").select("*").eq(
            "event_id", event_id
        ).order("sort_order").order("due_date").execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}", response_model=APIResponse)
async def create_task(event_id: str, task: TaskCreate, user: dict = Depends(require_auth)):
    """Create a new task."""
    try:
        supabase = get_supabase()
        data = task.model_dump()
        data["event_id"] = event_id
        if data.get("due_date"):
            data["due_date"] = data["due_date"].isoformat()
        response = supabase.table("tasks").insert(data).execute()
        return APIResponse(success=True, message="Task created", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{event_id}/{task_id}", response_model=APIResponse)
async def update_task(event_id: str, task_id: str, task: TaskUpdate, user: dict = Depends(require_auth)):
    """Update a task (status, priority, etc.)."""
    try:
        supabase = get_supabase()
        data = task.model_dump(exclude_unset=True)
        if "due_date" in data and data["due_date"]:
            data["due_date"] = data["due_date"].isoformat()

        # If status changed to 'done', set completed_at
        if data.get("status") == "done":
            from datetime import datetime
            data["completed_at"] = datetime.utcnow().isoformat()

        response = supabase.table("tasks").update(data).eq(
            "id", task_id
        ).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Task updated", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}/{task_id}", response_model=APIResponse)
async def delete_task(event_id: str, task_id: str, user: dict = Depends(require_auth)):
    """Delete a task."""
    try:
        supabase = get_supabase()
        supabase.table("tasks").delete().eq("id", task_id).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Task deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{event_id}/{task_id}/status", response_model=APIResponse)
async def update_task_status(event_id: str, task_id: str, status: str, user: dict = Depends(require_auth)):
    """Quick status update for Kanban drag-and-drop."""
    valid = ["todo", "in_progress", "done", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    try:
        supabase = get_supabase()
        update_data = {"status": status}
        if status == "done":
            from datetime import datetime
            update_data["completed_at"] = datetime.utcnow().isoformat()

        response = supabase.table("tasks").update(update_data).eq(
            "id", task_id
        ).eq("event_id", event_id).execute()
        return APIResponse(success=True, message=f"Task status updated to {status}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
