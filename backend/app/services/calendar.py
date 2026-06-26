"""
EventPilot AI — Google Calendar Service (Scaffolded)
Google Calendar OAuth integration placeholder with clear setup instructions.
"""

import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


# ============================================
# SETUP INSTRUCTIONS
# ============================================
# To enable Google Calendar integration:
# 1. Create a project in Google Cloud Console
# 2. Enable the Google Calendar API
# 3. Create OAuth 2.0 credentials
# 4. Set the redirect URI to: {your_backend_url}/api/auth/google/callback
# 5. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env
# 6. Implement the OAuth flow in the auth router
# ============================================


async def create_calendar_event(
    summary: str,
    start_time: datetime,
    end_time: datetime,
    description: str = "",
    location: str = "",
    attendees: list[str] = None,
    access_token: str = "",
) -> Optional[dict]:
    """
    Create a Google Calendar event.
    Currently scaffolded — returns mock data until OAuth is configured.
    """
    if not access_token:
        logger.info("Google Calendar not configured. Returning mock event.")
        return {
            "id": "mock_event_id",
            "summary": summary,
            "start": start_time.isoformat(),
            "end": end_time.isoformat(),
            "description": description,
            "location": location,
            "status": "mock",
            "html_link": "#",
            "message": "Google Calendar integration not configured. Set up OAuth to enable.",
        }

    # TODO: Implement actual Google Calendar API call when OAuth is configured
    # import httpx
    # async with httpx.AsyncClient() as client:
    #     response = await client.post(
    #         "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    #         json={...},
    #         headers={"Authorization": f"Bearer {access_token}"},
    #     )
    return None


def generate_ical_event(
    summary: str,
    start_time: datetime,
    end_time: datetime,
    description: str = "",
    location: str = "",
) -> str:
    """Generate an iCal (.ics) file content for calendar download."""
    import uuid
    uid = str(uuid.uuid4())
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    start = start_time.strftime("%Y%m%dT%H%M%SZ")
    end = end_time.strftime("%Y%m%dT%H%M%SZ")

    return f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventPilot AI//EN
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{now}
DTSTART:{start}
DTEND:{end}
SUMMARY:{summary}
DESCRIPTION:{description}
LOCATION:{location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""
