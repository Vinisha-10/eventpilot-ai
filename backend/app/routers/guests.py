"""
EventPilot AI — Guests Router
Guest management, invitations, QR tickets, and seating.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import GuestCreate, GuestUpdate, BulkGuestCreate, InviteGuestsRequest, APIResponse
from app.services.qrcode_service import generate_guest_ticket_qr
from app.services.email import send_email, generate_invitation_html
from app.agents.guest import GuestAgent

router = APIRouter()


@router.get("/{event_id}", response_model=APIResponse)
async def list_guests(event_id: str, user: dict = Depends(require_auth)):
    """List all guests for an event."""
    try:
        supabase = get_supabase()
        response = supabase.table("guests").select("*").eq(
            "event_id", event_id
        ).order("name").execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}", response_model=APIResponse)
async def add_guest(event_id: str, guest: GuestCreate, user: dict = Depends(require_auth)):
    """Add a single guest to an event."""
    try:
        supabase = get_supabase()

        # Get event to verify ownership
        event = supabase.table("events").select("id,name").eq(
            "id", event_id
        ).eq("user_id", user["id"]).single().execute()

        data = guest.model_dump()
        data["event_id"] = event_id

        # Generate QR ticket
        qr = generate_guest_ticket_qr(
            event_id=event_id,
            guest_id="pending",  # Will update after insert
            guest_name=guest.name,
            event_name=event.data.get("name", "Event"),
        )
        data["qr_code"] = qr

        response = supabase.table("guests").insert(data).execute()
        return APIResponse(success=True, message="Guest added", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/bulk", response_model=APIResponse)
async def add_guests_bulk(event_id: str, request: BulkGuestCreate, user: dict = Depends(require_auth)):
    """Add multiple guests at once."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("id,name").eq(
            "id", event_id
        ).eq("user_id", user["id"]).single().execute()

        guests_data = []
        for guest in request.guests:
            data = guest.model_dump()
            data["event_id"] = event_id
            data["qr_code"] = generate_guest_ticket_qr(
                event_id=event_id, guest_id="bulk",
                guest_name=guest.name, event_name=event.data.get("name", "Event"),
            )
            guests_data.append(data)

        response = supabase.table("guests").insert(guests_data).execute()
        return APIResponse(
            success=True,
            message=f"{len(guests_data)} guests added",
            data=response.data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{event_id}/{guest_id}", response_model=APIResponse)
async def update_guest(event_id: str, guest_id: str, guest: GuestUpdate, user: dict = Depends(require_auth)):
    """Update a guest."""
    try:
        supabase = get_supabase()
        data = guest.model_dump(exclude_unset=True)
        response = supabase.table("guests").update(data).eq(
            "id", guest_id
        ).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Guest updated", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}/{guest_id}", response_model=APIResponse)
async def delete_guest(event_id: str, guest_id: str, user: dict = Depends(require_auth)):
    """Remove a guest."""
    try:
        supabase = get_supabase()
        supabase.table("guests").delete().eq("id", guest_id).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Guest removed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{event_id}/{guest_id}/qr", response_model=APIResponse)
async def get_guest_qr(event_id: str, guest_id: str, user: dict = Depends(require_auth)):
    """Get or regenerate QR ticket for a guest."""
    try:
        supabase = get_supabase()
        guest = supabase.table("guests").select("*").eq("id", guest_id).single().execute()
        event = supabase.table("events").select("name").eq("id", event_id).single().execute()

        qr = generate_guest_ticket_qr(
            event_id=event_id,
            guest_id=guest_id,
            guest_name=guest.data["name"],
            event_name=event.data["name"],
        )

        # Update the stored QR
        supabase.table("guests").update({"qr_code": qr}).eq("id", guest_id).execute()

        return APIResponse(success=True, data={"qr_code": qr})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/invite", response_model=APIResponse)
async def send_invitations(event_id: str, request: InviteGuestsRequest, user: dict = Depends(require_auth)):
    """Send email invitations to selected guests."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("*").eq("id", event_id).single().execute()
        event_data = event.data

        sent_count = 0
        for guest_id in request.guest_ids:
            guest = supabase.table("guests").select("*").eq("id", guest_id).single().execute()
            guest_data = guest.data

            if guest_data.get("email"):
                html = generate_invitation_html(
                    event_name=event_data["name"],
                    event_date=event_data["start_date"],
                    venue=event_data.get("venue_name", "TBD"),
                    guest_name=guest_data["name"],
                    message=request.message or "",
                )
                success = await send_email(
                    to=guest_data["email"],
                    subject=f"You're Invited: {event_data['name']}",
                    html_body=html,
                )
                if success:
                    supabase.table("guests").update({
                        "invitation_sent": True,
                        "invitation_sent_at": "now()",
                    }).eq("id", guest_id).execute()
                    sent_count += 1

        return APIResponse(
            success=True,
            message=f"Invitations sent to {sent_count} guests",
            data={"sent_count": sent_count}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/seating-plan", response_model=APIResponse)
async def generate_seating_plan(event_id: str, user: dict = Depends(require_auth)):
    """Generate an AI seating plan for the event's accepted guests."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("*").eq("id", event_id).single().execute()
        guests = supabase.table("guests").select("*").eq("event_id", event_id).execute()

        agent = GuestAgent()
        result = await agent.execute({
            "task": "seating",
            "event_name": event.data["name"],
            "event_type": event.data["event_type"],
            "guests": guests.data or [],
        })

        return APIResponse(success=True, data=result.get("data"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
