from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..core.config import settings
from ..models.document import (
    HealthResponse,
    DocumentUploadResponse,
    NebiusStatusResponse,
)
from ..services.pdf_service import (
    PDFService,
    PDFValidationException,
    PDFSizeLimitException,
    PDFCorruptOrEncryptedException,
)
from ..services.llm_service import llm_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def get_health():
    """
    Health check endpoint returning system status and Nebius configuration state.
    """
    return HealthResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        nebius_configured=settings.is_nebius_configured,
        nebius_base_url=settings.NEBIUS_BASE_URL,
        nebius_model=settings.NEBIUS_MODEL,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Documents"],
)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and validate a PDF document, extracting 1-indexed pages,
    bounding-box text blocks, and document metadata.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename.",
        )

    # Read uploaded bytes
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded stream: {str(e)}",
        )

    try:
        result = PDFService.validate_and_extract(
            file_bytes=content,
            filename=file.filename,
            content_type=file.content_type,
        )
        return result
    except PDFValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    except PDFSizeLimitException as e:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=e.message,
        )
    except PDFCorruptOrEncryptedException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during PDF extraction: {str(e)}",
        )


@router.get("/llm/status", response_model=NebiusStatusResponse, tags=["LLM"])
async def get_llm_status():
    """
    Check Nebius Token Factory configuration and status without exposing keys.
    """
    return llm_service.get_status()


@router.post("/llm/test-connection", tags=["LLM"])
async def test_llm_connection():
    """
    Test live connectivity to the Nebius Token Factory API endpoint.
    """
    return await llm_service.test_connection()
