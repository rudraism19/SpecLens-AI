from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class TextBlock(BaseModel):
    block_id: int = Field(..., description="Index of the block within the page")
    bbox: List[float] = Field(..., description="Bounding box coordinates [x0, y0, x1, y1]")
    text: str = Field(..., description="Extracted text from the block")
    block_type: int = Field(default=0, description="Block type (0=text, 1=image)")
    lines_count: int = Field(default=1, description="Number of text lines in block")


class PageMetadata(BaseModel):
    page_number: int = Field(..., description="1-indexed page number of the document")
    width: float = Field(..., description="Width of the page in points")
    height: float = Field(..., description="Height of the page in points")
    word_count: int = Field(..., description="Total words on this page")
    character_count: int = Field(..., description="Total characters on this page")
    blocks: List[TextBlock] = Field(default_factory=list, description="Extracted text blocks with bboxes")
    page_text: str = Field(..., description="Full consolidated text of the page")


class DocumentMetadata(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    keywords: Optional[str] = None
    creator: Optional[str] = None
    producer: Optional[str] = None
    creation_date: Optional[str] = None
    mod_date: Optional[str] = None


class DocumentUploadResponse(BaseModel):
    document_id: str = Field(..., description="Unique UUID for the uploaded document")
    filename: str = Field(..., description="Original filename of the uploaded PDF")
    file_size_bytes: int = Field(..., description="Size of file in bytes")
    total_pages: int = Field(..., description="Total number of 1-indexed pages")
    total_words: int = Field(..., description="Consolidated word count across all pages")
    total_characters: int = Field(..., description="Consolidated character count across all pages")
    metadata: DocumentMetadata = Field(..., description="PDF metadata extracted from document catalog")
    pages: List[PageMetadata] = Field(..., description="List of page extractions with 1-indexed numbers")
    preview_text: str = Field(..., description="Preview snippet from the beginning of document")


class HealthResponse(BaseModel):
    status: str = "ok"
    project: str
    version: str
    nebius_configured: bool
    nebius_base_url: str
    nebius_model: str
    timestamp: str


class NebiusStatusResponse(BaseModel):
    is_configured: bool
    base_url: str
    model: str
    message: str
