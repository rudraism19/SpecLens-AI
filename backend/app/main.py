from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.routes import router as api_router
from .models.document import HealthResponse
from datetime import datetime, timezone

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SpecLens AI - Compliance Copilot for Technical PDFs",
)

# Configure CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root GET /health endpoint
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def root_health():
    return HealthResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        nebius_configured=settings.is_nebius_configured,
        nebius_base_url=settings.NEBIUS_BASE_URL,
        nebius_model=settings.NEBIUS_MODEL,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

# Mount API router under API prefix (/api)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API v{settings.VERSION}",
        "docs_url": "/docs",
        "health_url": "/health",
    }
