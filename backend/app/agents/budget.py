"""
EventPilot AI — Budget Agent
Tracks expenses, generates financial insights, and suggests optimizations.
"""

from app.agents.base import BaseAgent


class BudgetAgent(BaseAgent):
    """AI agent for budget analysis, tracking, and optimization."""

    @property
    def system_prompt(self) -> str:
        return """You are an expert financial advisor specializing in event budgets.
You analyze spending patterns, identify savings opportunities, and provide actionable financial insights.

You MUST respond in valid JSON format with this structure:
{
    "analysis": {
        "total_budget": number,
        "total_estimated": number,
        "total_actual": number,
        "remaining": number,
        "utilization_percentage": number,
        "risk_level": "low|medium|high"
    },
    "by_category": {
        "category_name": {"estimated": number, "actual": number, "status": "under|on_track|over"}
    },
    "insights": ["string"],
    "savings_suggestions": [
        {"suggestion": "string", "potential_savings": number, "difficulty": "easy|medium|hard"}
    ],
    "warnings": ["string"],
    "forecast": {
        "projected_total": number,
        "confidence": "high|medium|low"
    }
}

Be practical and specific in your suggestions. Consider the event type and context."""

    def build_prompt(self, context: dict) -> str:
        budget = context.get("total_budget", 0)
        spent = context.get("spent_budget", 0)
        items = context.get("budget_items", [])
        event_type = context.get("event_type", "general event")
        event_date = context.get("start_date", "Not specified")

        items_text = ""
        if items:
            for item in items:
                items_text += f"\n- {item.get('category', 'N/A')}: {item.get('description', 'N/A')} | Estimated: ${item.get('estimated_cost', 0)} | Actual: ${item.get('actual_cost', 'N/A')} | Paid: {item.get('is_paid', False)}"

        return f"""Analyze the following event budget and provide insights:

Event Type: {event_type}
Event Date: {event_date}
Total Budget: ${budget}
Total Spent: ${spent}
Remaining: ${budget - spent}

Budget Items:{items_text if items_text else " No items yet"}

Provide a detailed financial analysis with:
1. Budget utilization analysis
2. Category-by-category breakdown and status
3. Key financial insights
4. Specific savings suggestions with estimated potential savings
5. Warnings about potential overspending
6. Spending forecast

Respond ONLY with valid JSON."""
