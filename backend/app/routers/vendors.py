"""
EventPilot AI — Vendors Router
Vendor management, nearby search, and AI recommendations.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.middleware import require_auth
from app.models.schemas import VendorCreate, VendorUpdate, VendorSearchRequest, APIResponse
from app.services.maps import search_nearby_places, geocode_address
from app.agents.vendor import VendorAgent

router = APIRouter()


@router.get("/{event_id}", response_model=APIResponse)
async def list_vendors(event_id: str, user: dict = Depends(require_auth)):
    """List all vendors for an event."""
    try:
        supabase = get_supabase()
        response = supabase.table("vendors").select("*").eq(
            "event_id", event_id
        ).order("category").execute()
        return APIResponse(success=True, data=response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}", response_model=APIResponse)
async def add_vendor(event_id: str, vendor: VendorCreate, user: dict = Depends(require_auth)):
    """Add a vendor to an event."""
    try:
        supabase = get_supabase()
        data = vendor.model_dump()
        data["event_id"] = event_id
        response = supabase.table("vendors").insert(data).execute()
        return APIResponse(success=True, message="Vendor added", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{event_id}/{vendor_id}", response_model=APIResponse)
async def update_vendor(event_id: str, vendor_id: str, vendor: VendorUpdate, user: dict = Depends(require_auth)):
    """Update vendor details."""
    try:
        supabase = get_supabase()
        data = vendor.model_dump(exclude_unset=True)
        response = supabase.table("vendors").update(data).eq(
            "id", vendor_id
        ).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Vendor updated", data=response.data[0] if response.data else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}/{vendor_id}", response_model=APIResponse)
async def delete_vendor(event_id: str, vendor_id: str, user: dict = Depends(require_auth)):
    """Remove a vendor."""
    try:
        supabase = get_supabase()
        supabase.table("vendors").delete().eq("id", vendor_id).eq("event_id", event_id).execute()
        return APIResponse(success=True, message="Vendor removed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search/nearby", response_model=APIResponse)
async def search_nearby_vendors(request: VendorSearchRequest, user: dict = Depends(require_auth)):
    """Search for nearby vendors using OpenStreetMap."""
    try:
        places = await search_nearby_places(
            lat=request.latitude,
            lng=request.longitude,
            category=request.category.value,
            radius_m=int(request.radius_km * 1000),
        )
        return APIResponse(
            success=True,
            data={"places": places, "count": len(places)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{event_id}/recommend", response_model=APIResponse)
async def get_vendor_recommendations(event_id: str, category: str = "all", user: dict = Depends(require_auth)):
    """Get AI-powered vendor recommendations."""
    try:
        supabase = get_supabase()
        event = supabase.table("events").select("*").eq("id", event_id).single().execute()
        vendors = supabase.table("vendors").select("*").eq("event_id", event_id).execute()

        # Search nearby places if we have coordinates
        nearby = []
        if event.data.get("venue_lat") and event.data.get("venue_lng"):
            nearby = await search_nearby_places(
                event.data["venue_lat"], event.data["venue_lng"], category
            )

        agent = VendorAgent()
        result = await agent.execute({
            "event_type": event.data.get("event_type"),
            "vendor_category": category,
            "location": event.data.get("venue_address", ""),
            "budget": event.data.get("total_budget", 0),
            "guest_count": event.data.get("max_guests", 0),
            "existing_vendors": vendors.data or [],
            "nearby_places": nearby,
        })

        return APIResponse(success=True, data=result.get("data"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
