from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SpecLens AI"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # PDF Upload Constraints
    MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    
    # Nebius Token Factory / AI Studio Configuration (Server-Side Only)
    # Never expose these credentials to the client / frontend.
    NEBIUS_API_KEY: str = Field(default="", description="Nebius Token Factory / AI Studio API Key")
    NEBIUS_BASE_URL: str = Field(
        default="https://api.tokenfactory.nebius.com/v1",
        description="Nebius Token Factory OpenAI-compatible API base URL"
    )
    NEBIUS_MODEL: str = Field(
        default="nvidia/nemotron-3-nano-30b",
        description="NVIDIA model identifier hosted on Nebius Token Factory"
    )
    
    @property
    def is_nebius_configured(self) -> bool:
        """Returns True only if NEBIUS_API_KEY is non-empty and not a placeholder."""
        key = self.NEBIUS_API_KEY.strip()
        return bool(key and not key.startswith("your_") and key != "placeholder")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
