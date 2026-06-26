"""
EventPilot AI — Configuration
Centralized settings loaded from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file or environment variables."""

    # --- App ---
    APP_NAME: str = "EventPilot AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:3000,https://eventpilot.vercel.app"

    # --- Supabase ---
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""  # For server-side operations

    # --- AI Providers ---
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    HUGGINGFACE_API_KEY: str = ""
    HUGGINGFACE_MODEL: str = "mistralai/Mistral-7B-Instruct-v0.3"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # --- External Services ---
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "events@eventpilot.ai"

    # --- Nominatim (OpenStreetMap) ---
    NOMINATIM_USER_AGENT: str = "EventPilotAI/1.0"

    # --- Rate Limiting ---
    RATE_LIMIT_PER_MINUTE: int = 60

    # --- JWT (uses Supabase JWT secret if needed for custom verification) ---
    JWT_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance to avoid re-reading env on every call."""
    return Settings()
