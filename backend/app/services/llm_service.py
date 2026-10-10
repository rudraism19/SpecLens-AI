import logging
from typing import Optional, Dict, Any, List
from openai import AsyncOpenAI
from ..core.config import settings
from ..models.document import NebiusStatusResponse

logger = logging.getLogger("speclens.llm")


class NebiusLLMService:
    def __init__(self):
        self._client: Optional[AsyncOpenAI] = None
        if settings.is_nebius_configured:
            try:
                self._client = AsyncOpenAI(
                    base_url=settings.NEBIUS_BASE_URL,
                    api_key=settings.NEBIUS_API_KEY,
                    timeout=30.0,
                )
            except Exception as e:
                logger.warning(f"Could not initialize Nebius AsyncOpenAI client: {e}")
                self._client = None

    @property
    def is_configured(self) -> bool:
        return settings.is_nebius_configured and self._client is not None

    def get_status(self) -> NebiusStatusResponse:
        """Returns the configuration status without exposing raw API keys."""
        if not settings.is_nebius_configured:
            return NebiusStatusResponse(
                is_configured=False,
                base_url=settings.NEBIUS_BASE_URL,
                model=settings.NEBIUS_MODEL,
                message=(
                    "Nebius credentials are not configured. To enable NVIDIA Nemotron live "
                    "inference, set NEBIUS_API_KEY in backend/.env. PDF processing and extraction "
                    "remain fully operational."
                ),
            )
        
        return NebiusStatusResponse(
            is_configured=True,
            base_url=settings.NEBIUS_BASE_URL,
            model=settings.NEBIUS_MODEL,
            message=f"Nebius Token Factory client initialized for model {settings.NEBIUS_MODEL}.",
        )

    async def test_connection(self) -> Dict[str, Any]:
        """
        Attempts a live API verification against Nebius Token Factory.
        Does not guess or assume success.
        """
        if not self.is_configured:
            return {
                "success": False,
                "error": "NEBIUS_API_KEY is not configured.",
                "models_available": [],
            }

        try:
            # Query models endpoint to test token validity
            models_response = await self._client.models.list()
            model_ids = [m.id for m in models_response.data] if hasattr(models_response, "data") else []
            return {
                "success": True,
                "target_model": settings.NEBIUS_MODEL,
                "model_found": settings.NEBIUS_MODEL in model_ids,
                "total_models_available": len(model_ids),
                "sample_models": model_ids[:10],
            }
        except Exception as e:
            logger.error(f"Nebius API connection test failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "target_model": settings.NEBIUS_MODEL,
                "models_available": [],
            }


llm_service = NebiusLLMService()
