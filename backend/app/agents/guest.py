"""
EventPilot AI — Guest Management Agent
Manages invitations, RSVPs, QR tickets, and seating plans.
"""

from app.agents.base import BaseAgent


class GuestAgent(BaseAgent):
    """AI agent for guest management, invitations, and seating arrangements."""

    @property
    def system_prompt(self) -> str:
        return """You are an expert guest management assistant for events. 
You help with invitation wording, seating arrangements, RSVP tracking, and guest communication.

Respond in valid JSON format matching the requested task type."""

    def build_prompt(self, context: dict) -> str:
        task = context.get("task", "analyze")
        event_type = context.get("event_type", "general event")
        event_name = context.get("event_name", "My Event")
        event_date = context.get("event_date", "Not specified")
        venue = context.get("venue", "Not specified")
        guests = context.get("guests", [])
        theme = context.get("theme", "")

        if task == "invitation":
            return f"""Generate a beautiful event invitation message:

Event: {event_name}
Type: {event_type}
Date: {event_date}
Venue: {venue}
Theme: {theme}

Respond in JSON:
{{
    "subject": "string",
    "greeting": "string",
    "body": "string",
    "details": "string",
    "rsvp_text": "string",
    "closing": "string",
    "tone": "string"
}}"""

        if task == "seating":
            guest_text = "\n".join([
                f"- {g.get('name', 'Guest')} (RSVP: {g.get('rsvp_status', 'pending')}, "
                f"Dietary: {g.get('dietary_requirements', 'none')}, "
                f"Plus ones: {g.get('plus_ones', 0)})"
                for g in guests[:50]
            ])

            return f"""Create a seating plan for this event:

Event: {event_name} ({event_type})
Guests:
{guest_text}

Create a seating arrangement. Respond in JSON:
{{
    "tables": [
        {{"table_number": number, "capacity": number, "guests": ["guest_name"], "notes": "string"}}
    ],
    "total_tables": number,
    "total_seated": number,
    "notes": ["string"]
}}"""

        # Default: analyze guest list
        total = len(guests)
        accepted = sum(1 for g in guests if g.get('rsvp_status') == 'accepted')
        declined = sum(1 for g in guests if g.get('rsvp_status') == 'declined')
        pending = sum(1 for g in guests if g.get('rsvp_status') == 'pending')

        return f"""Analyze the guest list for this event:

Event: {event_name} ({event_type})
Total Guests: {total}
Accepted: {accepted}
Declined: {declined}
Pending: {pending}

Respond in JSON:
{{
    "summary": "string",
    "rsvp_rate": number,
    "estimated_attendance": number,
    "action_items": ["string"],
    "suggestions": ["string"],
    "reminder_message": "string"
}}"""
