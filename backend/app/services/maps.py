"""
EventPilot AI — Maps Service
OpenStreetMap / Nominatim geocoding and venue/vendor search.
"""

import httpx
import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
OVERPASS_BASE = "https://overpass-api.de/api/interpreter"


async def geocode_address(address: str) -> Optional[dict]:
    """Convert an address string to latitude/longitude coordinates."""
    settings = get_settings()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{NOMINATIM_BASE}/search",
                params={
                    "q": address,
                    "format": "json",
                    "limit": 1,
                    "addressdetails": 1,
                },
                headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
            )
            response.raise_for_status()
            results = response.json()
            if results:
                return {
                    "lat": float(results[0]["lat"]),
                    "lng": float(results[0]["lon"]),
                    "display_name": results[0].get("display_name", ""),
                    "address": results[0].get("address", {}),
                }
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
    return None


async def reverse_geocode(lat: float, lng: float) -> Optional[dict]:
    """Convert coordinates to an address."""
    settings = get_settings()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{NOMINATIM_BASE}/reverse",
                params={
                    "lat": lat,
                    "lon": lng,
                    "format": "json",
                    "addressdetails": 1,
                },
                headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
            )
            response.raise_for_status()
            data = response.json()
            return {
                "display_name": data.get("display_name", ""),
                "address": data.get("address", {}),
            }
    except Exception as e:
        logger.error(f"Reverse geocoding error: {e}")
    return None


async def search_nearby_places(
    lat: float,
    lng: float,
    category: str,
    radius_m: int = 10000,
) -> list[dict]:
    """
    Search for nearby places using Overpass API (OpenStreetMap).
    Categories map to OSM tags for venue-related searches.
    """
    # Map vendor categories to OSM tags
    osm_tags = {
        "venue": '["amenity"~"events_venue|community_centre|conference_centre|banquet_hall"]',
        "caterer": '["amenity"="restaurant"]["cuisine"]',
        "photographer": '["shop"="photo"]',
        "florist": '["shop"="florist"]',
        "baker": '["shop"="bakery"]',
        "dj": '["amenity"="nightclub"]',
        "band": '["amenity"~"music_venue|theatre"]',
        "decorator": '["shop"~"interior_decoration|craft"]',
        "transport": '["amenity"="car_rental"]',
        "equipment": '["shop"="electronics"]',
        "hotel": '["tourism"="hotel"]',
    }

    tag = osm_tags.get(category, '["amenity"~"restaurant|cafe|hotel"]')

    query = f"""
    [out:json][timeout:15];
    (
      node{tag}(around:{radius_m},{lat},{lng});
      way{tag}(around:{radius_m},{lat},{lng});
    );
    out center 20;
    """

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                OVERPASS_BASE,
                data={"data": query},
            )
            response.raise_for_status()
            data = response.json()

            places = []
            for element in data.get("elements", []):
                tags = element.get("tags", {})
                place_lat = element.get("lat") or element.get("center", {}).get("lat")
                place_lng = element.get("lon") or element.get("center", {}).get("lon")

                if place_lat and place_lng:
                    # Calculate approximate distance
                    import math
                    dlat = math.radians(place_lat - lat)
                    dlng = math.radians(place_lng - lng)
                    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(place_lat)) * math.sin(dlng/2)**2
                    distance_km = round(6371 * 2 * math.asin(math.sqrt(a)), 2)

                    places.append({
                        "name": tags.get("name", "Unnamed"),
                        "category": category,
                        "lat": place_lat,
                        "lng": place_lng,
                        "distance": distance_km,
                        "address": tags.get("addr:full", tags.get("addr:street", "")),
                        "phone": tags.get("phone", tags.get("contact:phone", "")),
                        "website": tags.get("website", tags.get("contact:website", "")),
                        "opening_hours": tags.get("opening_hours", ""),
                    })

            # Sort by distance
            places.sort(key=lambda x: x["distance"])
            return places[:20]

    except Exception as e:
        logger.error(f"Overpass API error: {e}")
        return []
