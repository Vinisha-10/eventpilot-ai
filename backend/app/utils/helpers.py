"""
EventPilot AI — Utility Helpers
Common utility functions used across the application.
"""

import json
import re
from datetime import datetime, timedelta
from typing import Any


def parse_json_from_ai(text: str) -> dict | list | None:
    """
    Extract and parse JSON from AI-generated text.
    AI models sometimes wrap JSON in markdown code blocks.
    """
    # Try direct parse first
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass

    # Try to extract from markdown code blocks
    patterns = [
        r'```json\s*([\s\S]*?)\s*```',
        r'```\s*([\s\S]*?)\s*```',
        r'\{[\s\S]*\}',
        r'\[[\s\S]*\]',
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return json.loads(match.group(1) if '```' in pattern else match.group(0))
            except (json.JSONDecodeError, IndexError):
                continue

    return None


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format a number as currency."""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "INR": "₹"}
    symbol = symbols.get(currency, "$")
    return f"{symbol}{amount:,.2f}"


def days_until(target_date: datetime) -> int:
    """Calculate days until a target date."""
    delta = target_date - datetime.now()
    return max(0, delta.days)


def generate_event_slug(name: str) -> str:
    """Generate a URL-friendly slug from an event name."""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')
    return slug


def chunk_list(lst: list, chunk_size: int) -> list[list]:
    """Split a list into chunks of specified size."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def safe_get(data: dict | None, *keys, default: Any = None) -> Any:
    """Safely navigate nested dictionaries."""
    current = data
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key)
        else:
            return default
    return current if current is not None else default
