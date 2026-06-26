"""
EventPilot AI — Marketing Agent
Generates social media content, email campaigns, and promotional materials.
"""

from app.agents.base import BaseAgent


class MarketingAgent(BaseAgent):
    """AI agent for generating marketing and promotional content."""

    @property
    def system_prompt(self) -> str:
        return """You are a creative marketing expert specializing in event promotion.
You create engaging content for social media, email campaigns, and event descriptions.
Your content is vibrant, attention-grabbing, and platform-appropriate.

Always respond in valid JSON format."""

    def build_prompt(self, context: dict) -> str:
        platform = context.get("platform", "instagram")
        content_type = context.get("content_type", "post")
        event_name = context.get("event_name", "My Event")
        event_type = context.get("event_type", "general event")
        event_date = context.get("event_date", "")
        venue = context.get("venue", "")
        theme = context.get("theme", "")
        tone = context.get("tone", "professional")
        additional = context.get("additional_context", "")

        platform_guidelines = {
            "instagram": "Use emojis, short punchy lines, 3-5 relevant hashtags. Max 2200 chars. Visual-first.",
            "linkedin": "Professional tone, industry value, thought leadership. Use 3-5 strategic hashtags.",
            "facebook": "Conversational, community-focused. Include call-to-action. Moderate length.",
            "twitter": "Concise, witty. Under 280 chars. 2-3 hashtags max.",
            "email": "Subject line, preview text, structured body with CTA. Professional but engaging.",
            "poster": "Generate a detailed text prompt for AI image generation of an event poster.",
        }

        guidelines = platform_guidelines.get(platform, "Create engaging content appropriate for the platform.")

        return f"""Create {content_type} content for {platform}:

Event: {event_name}
Type: {event_type}
Date: {event_date}
Venue: {venue}
Theme: {theme}
Tone: {tone}
Additional Context: {additional}

Platform Guidelines: {guidelines}

Respond in JSON:
{{
    "title": "string (headline or subject line)",
    "content": "string (the full post/email/description)",
    "hashtags": ["string"],
    "call_to_action": "string",
    "best_posting_time": "string",
    "tips": ["string"],
    "alternative_versions": ["string (1-2 alternative versions)"]
}}"""
