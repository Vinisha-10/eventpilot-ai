"""
EventPilot AI — Vendor Agent
Finds and ranks nearby vendors using OpenStreetMap data.
"""

from app.agents.base import BaseAgent


class VendorAgent(BaseAgent):
    """AI agent for vendor discovery, ranking, and recommendations."""

    @property
    def system_prompt(self) -> str:
        return """You are an expert event vendor advisor. You help users find and evaluate 
vendors for their events. You rank vendors based on ratings, price, distance, and relevance.

You MUST respond in valid JSON format with this structure:
{
    "recommendations": [
        {
            "name": "string",
            "category": "string",
            "why_recommended": "string",
            "estimated_price_range": "string",
            "tips": "string"
        }
    ],
    "search_tips": ["string"],
    "negotiation_tips": ["string"],
    "red_flags": ["string"],
    "questions_to_ask": ["string"]
}

Be practical and specific to the event type and location."""

    def build_prompt(self, context: dict) -> str:
        event_type = context.get("event_type", "general event")
        category = context.get("vendor_category", "all")
        location = context.get("location", "Not specified")
        budget = context.get("budget", "Not specified")
        guests = context.get("guest_count", "Not specified")
        existing_vendors = context.get("existing_vendors", [])
        nearby_places = context.get("nearby_places", [])

        places_text = ""
        if nearby_places:
            for place in nearby_places[:10]:
                places_text += f"\n- {place.get('name', 'N/A')} ({place.get('category', 'N/A')}) - {place.get('distance', 'N/A')}km away"

        existing_text = ""
        if existing_vendors:
            for v in existing_vendors:
                existing_text += f"\n- {v.get('name', 'N/A')} ({v.get('category', 'N/A')}) - Status: {v.get('status', 'N/A')}"

        return f"""Help find and evaluate vendors for this event:

Event Type: {event_type}
Vendor Category Needed: {category}
Location: {location}
Budget: {budget}
Expected Guests: {guests}

Nearby Places Found:{places_text if places_text else " No data available"}

Already Booked Vendors:{existing_text if existing_text else " None yet"}

Provide vendor recommendations, search tips, negotiation advice, red flags to watch for,
and important questions to ask potential vendors.

Respond ONLY with valid JSON."""
