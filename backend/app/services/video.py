"""
EventPilot AI — Video Meeting Service
Generates Jitsi Meet links for virtual event coordination.
"""

import uuid
import logging

logger = logging.getLogger(__name__)

JITSI_BASE = "https://meet.jit.si"


def generate_meeting_link(
    event_name: str,
    event_id: str = "",
) -> dict:
    """
    Generate a Jitsi Meet link for an event.
    Jitsi Meet is free and requires no authentication.
    """
    # Create a URL-safe room name
    safe_name = event_name.lower().replace(" ", "-")
    room_id = f"eventpilot-{safe_name}-{uuid.uuid4().hex[:8]}"

    meeting_url = f"{JITSI_BASE}/{room_id}"

    return {
        "url": meeting_url,
        "room_id": room_id,
        "provider": "Jitsi Meet",
        "features": [
            "No account required",
            "Screen sharing",
            "Chat",
            "Recording (local)",
            "Up to 75 participants",
        ],
    }
