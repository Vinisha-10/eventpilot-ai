"""
EventPilot AI — Database Client
Supabase Python client for database operations.
"""

from supabase import create_client, Client
from app.config import get_settings

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Get or create the Supabase client singleton."""
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
    return _supabase_client


def get_supabase_admin() -> Client:
    """
    Get a Supabase client with the service role key.
    Used for server-side operations that bypass RLS.
    """
    settings = get_settings()
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
