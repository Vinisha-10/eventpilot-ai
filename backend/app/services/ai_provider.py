"""
EventPilot AI — AI Provider Abstraction
Unified interface for Gemini, Hugging Face, and Ollama with automatic fallback.
"""

import json
import logging
import httpx
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)


class AIProvider:
    """
    Unified AI provider with fallback chain:
    1. Google Gemini (free tier) — primary
    2. Hugging Face Inference API — fallback
    3. Template-based responses — final fallback
    """

    def __init__(self):
        self.settings = get_settings()

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        response_format: str = "text",  # "text" or "json"
    ) -> str:
        """
        Generate text using the AI provider cascade.
        Falls back automatically if a provider fails.
        """
        # Try Gemini first
        if self.settings.GEMINI_API_KEY:
            try:
                result = await self._call_gemini(prompt, system_prompt, temperature, max_tokens)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini failed: {e}")

        # Try Hugging Face
        if self.settings.HUGGINGFACE_API_KEY:
            try:
                result = await self._call_huggingface(prompt, system_prompt, temperature, max_tokens)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Hugging Face failed: {e}")

        # Try Ollama (local)
        try:
            result = await self._call_ollama(prompt, system_prompt, temperature, max_tokens)
            if result:
                return result
        except Exception as e:
            logger.warning(f"Ollama failed: {e}")

        # Final fallback: template response
        logger.warning("All AI providers failed. Using template fallback.")
        return self._template_fallback(prompt)

    async def _call_gemini(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> Optional[str]:
        """Call Google Gemini API (free tier)."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.settings.GEMINI_MODEL}:generateContent"

        # Build the request payload
        contents = []
        if system_prompt:
            contents.append({
                "role": "user",
                "parts": [{"text": f"System Instructions: {system_prompt}"}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "Understood. I'll follow these instructions."}]
            })
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                json=payload,
                params={"key": self.settings.GEMINI_API_KEY},
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            data = response.json()

            # Extract text from Gemini response
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")

        return None

    async def _call_huggingface(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> Optional[str]:
        """Call Hugging Face Inference API (free tier)."""
        url = f"https://api-inference.huggingface.co/models/{self.settings.HUGGINGFACE_MODEL}"

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "temperature": temperature,
                "max_new_tokens": min(max_tokens, 2048),
                "return_full_text": False,
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.settings.HUGGINGFACE_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list) and data:
                return data[0].get("generated_text", "")

        return None

    async def _call_ollama(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> Optional[str]:
        """Call local Ollama instance."""
        url = f"{self.settings.OLLAMA_BASE_URL}/api/generate"

        payload = {
            "model": self.settings.OLLAMA_MODEL,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            }
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")

    def _template_fallback(self, prompt: str) -> str:
        """
        Template-based fallback when no AI provider is available.
        Returns structured but generic responses.
        """
        prompt_lower = prompt.lower()

        if "plan" in prompt_lower or "timeline" in prompt_lower:
            return json.dumps({
                "timeline": [
                    {"week": "8-6 weeks before", "tasks": ["Book venue", "Set budget", "Create guest list"]},
                    {"week": "6-4 weeks before", "tasks": ["Send invitations", "Book vendors", "Plan menu"]},
                    {"week": "4-2 weeks before", "tasks": ["Confirm RSVPs", "Finalize decorations", "Plan entertainment"]},
                    {"week": "2-1 weeks before", "tasks": ["Final walkthrough", "Confirm all vendors", "Prepare materials"]},
                    {"week": "Event day", "tasks": ["Setup", "Coordinate vendors", "Enjoy the event!"]},
                ],
                "checklist": [
                    {"item": "Choose and book venue", "priority": "high"},
                    {"item": "Set budget", "priority": "high"},
                    {"item": "Create guest list", "priority": "high"},
                    {"item": "Book catering", "priority": "high"},
                    {"item": "Arrange decorations", "priority": "medium"},
                    {"item": "Book entertainment", "priority": "medium"},
                    {"item": "Send invitations", "priority": "high"},
                    {"item": "Plan transportation", "priority": "low"},
                ],
                "milestones": [
                    {"name": "Planning Started", "date": "Today"},
                    {"name": "Venue Booked", "date": "Week 1"},
                    {"name": "Invitations Sent", "date": "Week 3"},
                    {"name": "Event Day", "date": "Event Date"},
                ],
            })

        if "budget" in prompt_lower:
            return json.dumps({
                "suggestions": [
                    "Consider digital invitations to save on printing costs",
                    "Book vendors during off-peak season for better rates",
                    "Compare at least 3 quotes for each vendor category",
                    "Allocate 10-15% of budget as contingency",
                    "Prioritize must-haves over nice-to-haves",
                ],
                "typical_breakdown": {
                    "venue": "30-40%",
                    "catering": "25-35%",
                    "decoration": "10-15%",
                    "photography": "8-12%",
                    "entertainment": "5-10%",
                    "miscellaneous": "5-10%",
                }
            })

        if "marketing" in prompt_lower or "social" in prompt_lower or "post" in prompt_lower:
            return json.dumps({
                "content": "🎉 Join us for an amazing event! We've got exciting activities, great food, and wonderful company lined up. Save the date and be part of something special! #Event #Celebration #Community",
                "hashtags": ["#Event", "#Celebration", "#Community", "#SaveTheDate"],
            })

        return json.dumps({
            "message": "I'm here to help with your event planning! You can ask me about creating plans, managing budgets, finding vendors, managing guests, creating marketing content, or scheduling tasks.",
            "suggestions": [
                "Create an event plan",
                "Analyze my budget",
                "Find nearby vendors",
                "Generate marketing content",
                "Create a task schedule",
            ]
        })


# Singleton instance
_ai_provider: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    """Get or create the AI provider singleton."""
    global _ai_provider
    if _ai_provider is None:
        _ai_provider = AIProvider()
    return _ai_provider
