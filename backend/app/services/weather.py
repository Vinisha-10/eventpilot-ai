"""
EventPilot AI — Weather Service
Open-Meteo API for event-day weather forecasts.
"""

import httpx
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

OPEN_METEO_BASE = "https://api.open-meteo.com/v1"


async def get_weather_forecast(
    lat: float,
    lng: float,
    date: str | datetime,
) -> Optional[dict]:
    """
    Get weather forecast for a specific location and date.
    Open-Meteo provides free forecasts up to 16 days ahead,
    and historical data for past dates.
    """
    if isinstance(date, datetime):
        date_str = date.strftime("%Y-%m-%d")
    else:
        date_str = date

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{OPEN_METEO_BASE}/forecast",
                params={
                    "latitude": lat,
                    "longitude": lng,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max",
                    "start_date": date_str,
                    "end_date": date_str,
                    "timezone": "auto",
                },
            )
            response.raise_for_status()
            data = response.json()

            daily = data.get("daily", {})
            if daily and daily.get("time"):
                weather_codes = {
                    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                    45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
                    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
                    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Slight rain showers",
                    81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
                }

                code = daily["weathercode"][0] if daily.get("weathercode") else 0
                
                return {
                    "date": date_str,
                    "temperature_max": daily.get("temperature_2m_max", [None])[0],
                    "temperature_min": daily.get("temperature_2m_min", [None])[0],
                    "precipitation_mm": daily.get("precipitation_sum", [0])[0],
                    "precipitation_probability": daily.get("precipitation_probability_max", [0])[0],
                    "wind_speed_max": daily.get("windspeed_10m_max", [0])[0],
                    "weather_code": code,
                    "weather_description": weather_codes.get(code, "Unknown"),
                    "is_outdoor_friendly": code < 51 and (daily.get("precipitation_probability_max", [0])[0] or 0) < 40,
                    "advisory": _get_weather_advisory(code, daily),
                }

    except Exception as e:
        logger.error(f"Weather API error: {e}")
    return None


def _get_weather_advisory(code: int, daily: dict) -> str:
    """Generate a weather advisory for event planning."""
    precip_prob = daily.get("precipitation_probability_max", [0])[0] or 0
    wind = daily.get("windspeed_10m_max", [0])[0] or 0
    temp_max = daily.get("temperature_2m_max", [25])[0] or 25

    advisories = []

    if code >= 61:
        advisories.append("⚠️ Rain expected. Arrange indoor backup or tent coverage.")
    elif code >= 51:
        advisories.append("🌧️ Light drizzle possible. Consider having umbrellas available.")
    elif precip_prob > 50:
        advisories.append(f"🌂 {precip_prob}% chance of precipitation. Have a backup plan.")

    if wind > 40:
        advisories.append("💨 High winds expected. Secure outdoor decorations and avoid tall structures.")
    elif wind > 25:
        advisories.append("🍃 Moderate winds. Secure lightweight decorations.")

    if temp_max > 35:
        advisories.append("🌡️ Very hot! Ensure shade, hydration stations, and cooling for guests.")
    elif temp_max < 5:
        advisories.append("❄️ Very cold! Arrange heating and warm beverages.")

    if not advisories:
        advisories.append("☀️ Weather looks favorable for your event!")

    return " ".join(advisories)
