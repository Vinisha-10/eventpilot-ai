"""
EventPilot AI — Base Agent
Abstract base class for all AI agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional
from app.services.ai_provider import get_ai_provider
from app.utils.helpers import parse_json_from_ai
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Base class for all EventPilot AI agents.
    Each agent specializes in a specific aspect of event management.
    """

    def __init__(self):
        self.ai = get_ai_provider()
        self.name = self.__class__.__name__

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """The system prompt that defines this agent's personality and capabilities."""
        pass

    @abstractmethod
    def build_prompt(self, context: dict) -> str:
        """Build the user prompt from the given context."""
        pass

    async def execute(self, context: dict) -> dict:
        """
        Execute the agent's task:
        1. Build prompt from context
        2. Call AI provider
        3. Parse and return structured response
        """
        try:
            prompt = self.build_prompt(context)
            logger.info(f"[{self.name}] Executing with prompt length: {len(prompt)}")

            raw_response = await self.ai.generate(
                prompt=prompt,
                system_prompt=self.system_prompt,
                temperature=0.7,
                max_tokens=4096,
            )

            # Try to parse as JSON first
            parsed = parse_json_from_ai(raw_response)
            if parsed:
                return {"success": True, "data": parsed, "raw": raw_response}

            # Return raw text if JSON parsing fails
            return {"success": True, "data": {"content": raw_response}, "raw": raw_response}

        except Exception as e:
            logger.error(f"[{self.name}] Error: {e}")
            return {"success": False, "error": str(e), "data": None}

    async def generate_text(self, prompt: str, system: str = "") -> str:
        """Simple text generation helper for agents that need raw text output."""
        return await self.ai.generate(
            prompt=prompt,
            system_prompt=system or self.system_prompt,
            temperature=0.7,
            max_tokens=2048,
        )
