"""
EventPilot AI — Chat Orchestrator Agent
Routes natural language queries to appropriate specialized agents using tool calling.
"""

import json
from app.agents.base import BaseAgent
from app.agents.planner import PlannerAgent
from app.agents.budget import BudgetAgent
from app.agents.vendor import VendorAgent
from app.agents.guest import GuestAgent
from app.agents.marketing import MarketingAgent
from app.agents.schedule import ScheduleAgent
import logging

logger = logging.getLogger(__name__)


class ChatOrchestrator(BaseAgent):
    """
    AI chat orchestrator that understands user intent and routes
    to the appropriate specialized agent or provides direct answers.
    """

    def __init__(self):
        super().__init__()
        self.agents = {
            "planner": PlannerAgent(),
            "budget": BudgetAgent(),
            "vendor": VendorAgent(),
            "guest": GuestAgent(),
            "marketing": MarketingAgent(),
            "schedule": ScheduleAgent(),
        }

    @property
    def system_prompt(self) -> str:
        return """You are EventPilot AI, a friendly and knowledgeable event planning assistant.
You help users plan, organize, and manage events of all types.

When a user asks a question, you should:
1. Determine which tool/agent to use (if any)
2. Provide a helpful, conversational response

Available tools:
- planner: For creating event plans, timelines, checklists
- budget: For budget analysis, expense tracking, cost optimization
- vendor: For finding vendors, comparing prices, booking recommendations
- guest: For guest management, invitations, RSVPs, seating plans
- marketing: For social media posts, email campaigns, promotional content
- schedule: For creating schedules, timelines, task coordination
- direct: For general questions that don't need a specialized agent

Respond in JSON format:
{
    "intent": "planner|budget|vendor|guest|marketing|schedule|direct",
    "response": "Your conversational response to the user",
    "suggestions": ["Follow-up suggestion 1", "Follow-up suggestion 2"],
    "agent_context": {} // Additional context to pass to the specialized agent (if applicable)
}

Be warm, helpful, and proactive. Suggest next steps when appropriate."""

    def build_prompt(self, context: dict) -> str:
        message = context.get("message", "")
        event_context = context.get("event", {})
        history = context.get("history", [])

        history_text = ""
        if history:
            for msg in history[-6:]:  # Last 6 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")[:200]
                history_text += f"\n{role}: {content}"

        event_text = ""
        if event_context:
            event_text = f"""
Current Event Context:
- Name: {event_context.get('name', 'N/A')}
- Type: {event_context.get('event_type', 'N/A')}
- Date: {event_context.get('start_date', 'N/A')}
- Budget: ${event_context.get('total_budget', 0)}
- Guests: {event_context.get('max_guests', 'N/A')}
- Status: {event_context.get('status', 'N/A')}"""

        return f"""User message: {message}
{event_text}

Recent conversation:{history_text if history_text else " No previous messages"}

Determine the user's intent and provide a helpful response.
Respond ONLY with valid JSON."""

    async def chat(self, message: str, event_context: dict = None, history: list = None) -> dict:
        """
        Process a chat message:
        1. Determine intent via orchestrator
        2. Route to specialized agent if needed
        3. Combine responses
        """
        context = {
            "message": message,
            "event": event_context or {},
            "history": history or [],
        }

        # Get orchestrator's assessment
        result = await self.execute(context)

        if not result.get("success"):
            return {
                "response": "I'm sorry, I encountered an issue processing your request. Could you try rephrasing?",
                "suggestions": ["Plan my event", "Show my budget", "Find vendors nearby"],
                "tool_calls": None,
            }

        data = result.get("data", {})
        intent = data.get("intent", "direct")
        response = data.get("response", "I'm here to help with your event planning!")
        suggestions = data.get("suggestions", [])
        agent_context = data.get("agent_context", {})

        tool_calls = None

        # Route to specialized agent if needed
        if intent != "direct" and intent in self.agents:
            try:
                # Merge event context with agent-specific context
                full_context = {**(event_context or {}), **agent_context, "message": message}
                agent_result = await self.agents[intent].execute(full_context)

                if agent_result.get("success"):
                    tool_calls = [{
                        "agent": intent,
                        "result": agent_result.get("data"),
                    }]
                    # Enhance response with agent data
                    response += f"\n\nI've generated detailed {intent} information for you."

            except Exception as e:
                logger.error(f"Agent routing error: {e}")

        return {
            "response": response,
            "suggestions": suggestions,
            "tool_calls": tool_calls,
            "intent": intent,
        }
