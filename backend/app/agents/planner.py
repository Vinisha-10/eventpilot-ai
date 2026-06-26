"""
EventPilot AI — Planner Agent
Creates complete event plans with timeline, checklist, milestones, and reminders.
"""

from app.agents.base import BaseAgent


class PlannerAgent(BaseAgent):
    """AI agent that generates comprehensive event plans."""

    @property
    def system_prompt(self) -> str:
        return """You are an expert event planner AI assistant. You create detailed, 
practical event plans based on the user's requirements.

You MUST respond in valid JSON format with this structure:
{
    "timeline": [
        {"phase": "string", "period": "string", "tasks": ["string"]}
    ],
    "checklist": [
        {"item": "string", "priority": "high|medium|low", "category": "string", "estimated_days": number}
    ],
    "milestones": [
        {"name": "string", "target_date": "string", "description": "string"}
    ],
    "reminders": [
        {"message": "string", "days_before_event": number, "priority": "high|medium|low"}
    ],
    "budget_breakdown": [
        {"category": "string", "percentage": number, "estimated_amount": number, "notes": "string"}
    ],
    "vendor_suggestions": [
        {"category": "string", "priority": "string", "tips": "string"}
    ],
    "risk_factors": ["string"],
    "tips": ["string"]
}

Be specific, practical, and consider the event type, budget, and timeline. 
Tailor recommendations to the specific type of event."""

    def build_prompt(self, context: dict) -> str:
        event_type = context.get("event_type", "general event")
        name = context.get("name", "My Event")
        date = context.get("start_date", "Not specified")
        budget = context.get("total_budget", "Not specified")
        guests = context.get("max_guests", "Not specified")
        venue = context.get("venue_name", "Not specified")
        theme = context.get("theme", "Not specified")
        requirements = context.get("special_requirements", "None")

        return f"""Create a complete event plan for the following event:

Event Name: {name}
Event Type: {event_type}
Date: {date}
Budget: ${budget}
Expected Guests: {guests}
Venue: {venue}
Theme: {theme}
Special Requirements: {requirements}

Generate a detailed, actionable plan with timeline, checklist, milestones, reminders, 
budget breakdown (as percentages of total budget and estimated amounts), vendor suggestions, 
and potential risk factors. Be specific to this type of event.

Respond ONLY with valid JSON."""
