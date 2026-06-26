"""
EventPilot AI — Schedule Agent
Creates daily schedules, speaker timelines, and task reminders.
"""

from app.agents.base import BaseAgent


class ScheduleAgent(BaseAgent):
    """AI agent for creating event schedules and timelines."""

    @property
    def system_prompt(self) -> str:
        return """You are an expert event scheduler and timeline coordinator.
You create detailed, practical schedules considering logistics, transitions, and buffer times.

Always respond in valid JSON format."""

    def build_prompt(self, context: dict) -> str:
        event_name = context.get("event_name", "My Event")
        event_type = context.get("event_type", "general event")
        start_date = context.get("start_date", "")
        end_date = context.get("end_date", "")
        venue = context.get("venue", "")
        guests = context.get("guest_count", 0)
        tasks = context.get("tasks", [])
        preferences = context.get("preferences", "")

        tasks_text = ""
        if tasks:
            for t in tasks[:20]:
                tasks_text += f"\n- {t.get('title', 'Task')} (Priority: {t.get('priority', 'medium')}, Due: {t.get('due_date', 'N/A')})"

        return f"""Create a detailed event schedule:

Event: {event_name}
Type: {event_type}
Start: {start_date}
End: {end_date}
Venue: {venue}
Expected Guests: {guests}
Preferences: {preferences}

Existing Tasks:{tasks_text if tasks_text else " None"}

Create a comprehensive schedule. Respond in JSON:
{{
    "schedule": [
        {{
            "time": "string (HH:MM format)",
            "end_time": "string (HH:MM format)",
            "title": "string",
            "description": "string",
            "location": "string",
            "responsible": "string",
            "notes": "string"
        }}
    ],
    "setup_schedule": [
        {{"time": "string", "task": "string", "responsible": "string"}}
    ],
    "breakdown_schedule": [
        {{"time": "string", "task": "string", "responsible": "string"}}
    ],
    "reminders": [
        {{"time": "string", "message": "string", "recipient": "string"}}
    ],
    "tips": ["string"],
    "contingency_plan": ["string"]
}}"""
