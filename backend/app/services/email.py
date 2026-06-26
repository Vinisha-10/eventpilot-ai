"""
EventPilot AI — Email Service
Pluggable email service (Resend or console fallback).
"""

import httpx
import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_email(
    to: str | list[str],
    subject: str,
    html_body: str,
    from_email: Optional[str] = None,
) -> bool:
    """
    Send an email using Resend API or log to console as fallback.
    
    Args:
        to: Recipient email(s)
        subject: Email subject line
        html_body: HTML email body
        from_email: Sender email (defaults to config)
    
    Returns:
        True if sent successfully
    """
    settings = get_settings()
    sender = from_email or settings.RESEND_FROM_EMAIL

    if isinstance(to, str):
        to = [to]

    # If Resend API key is configured, use it
    if settings.RESEND_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    json={
                        "from": sender,
                        "to": to,
                        "subject": subject,
                        "html": html_body,
                    },
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
                logger.info(f"Email sent to {to} via Resend")
                return True
        except Exception as e:
            logger.error(f"Resend API error: {e}")
            return False
    else:
        # Console fallback — log the email for development
        logger.info(f"""
📧 EMAIL (Console Fallback - No Resend API key configured)
{'='*50}
From: {sender}
To: {', '.join(to)}
Subject: {subject}
{'='*50}
{html_body[:500]}...
{'='*50}
""")
        return True  # Return True so the app flow continues


def generate_invitation_html(
    event_name: str,
    event_date: str,
    venue: str,
    guest_name: str,
    message: str = "",
    rsvp_link: str = "#",
) -> str:
    """Generate a beautiful HTML invitation email."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0f0f23;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));
                        border:1px solid rgba(99,102,241,0.3);border-radius:24px;padding:48px;text-align:center;">
                
                <div style="font-size:48px;margin-bottom:16px;">🎉</div>
                
                <h1 style="color:#e0e7ff;font-size:28px;margin:0 0 8px;">You're Invited!</h1>
                <h2 style="color:#a5b4fc;font-size:22px;margin:0 0 32px;font-weight:normal;">{event_name}</h2>
                
                <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin:0 0 32px;">
                    <p style="color:#c7d2fe;margin:8px 0;font-size:16px;">
                        📅 <strong style="color:#e0e7ff;">{event_date}</strong>
                    </p>
                    <p style="color:#c7d2fe;margin:8px 0;font-size:16px;">
                        📍 <strong style="color:#e0e7ff;">{venue}</strong>
                    </p>
                </div>
                
                <p style="color:#c7d2fe;font-size:16px;line-height:1.6;">
                    Dear <strong style="color:#e0e7ff;">{guest_name}</strong>,
                </p>
                <p style="color:#a5b4fc;font-size:15px;line-height:1.6;">
                    {message or "We would be honored by your presence at this special event. Please let us know if you can make it!"}
                </p>
                
                <a href="{rsvp_link}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                   color:#fff;padding:14px 36px;border-radius:12px;text-decoration:none;font-size:16px;
                   font-weight:600;margin:24px 0;">
                    RSVP Now
                </a>
                
                <p style="color:#6b7280;font-size:13px;margin-top:32px;">
                    Powered by EventPilot AI ✨
                </p>
            </div>
        </div>
    </body>
    </html>
    """
