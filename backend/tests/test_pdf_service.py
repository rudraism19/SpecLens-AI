import io
import pymupdf as fitz
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pdf_service import (
    PDFService,
    PDFValidationException,
    PDFSizeLimitException,
    PDFCorruptOrEncryptedException,
)
from app.core.config import settings

client = TestClient(app)


def create_sample_pdf(page_texts: list[str]) -> bytes:
    """Helper to dynamically generate in-memory valid PDF bytes with PyMuPDF."""
    doc = fitz.open()
    for text in page_texts:
        page = doc.new_page(width=595, height=842)  # A4 standard
        page.insert_text(fitz.Point(50, 72), text, fontsize=12)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def test_pdf_service_valid_single_page():
    """Verify single page PDF extraction with 1-indexed numbering and bounding boxes."""
    content = "SpecLens AI Compliance Requirement 4.1: Access controls must be strictly logged."
    pdf_bytes = create_sample_pdf([content])
    
    result = PDFService.validate_and_extract(
        file_bytes=pdf_bytes,
        filename="compliance_standard.pdf"
    )
    
    assert result.total_pages == 1
    assert result.filename == "compliance_standard.pdf"
    assert len(result.pages) == 1
    
    page = result.pages[0]
    # Page must be 1-indexed
    assert page.page_number == 1
    assert "Requirement 4.1" in page.page_text
    assert page.word_count > 5
    assert len(page.blocks) >= 1
    
    block = page.blocks[0]
    assert len(block.bbox) == 4
    assert block.bbox[0] >= 0
    assert block.bbox[1] >= 0


def test_pdf_service_valid_multi_page():
    """Verify multi-page PDF preserves 1-indexed sequential numbering."""
    pages_content = [
        "Page 1: Overview and Scope of Security Policy.",
        "Page 2: Cryptographic Key Management Standards.",
        "Page 3: Incident Response and Disaster Recovery Procedure."
    ]
    pdf_bytes = create_sample_pdf(pages_content)
    
    result = PDFService.validate_and_extract(
        file_bytes=pdf_bytes,
        filename="security_manual.pdf"
    )
    
    assert result.total_pages == 3
    assert len(result.pages) == 3
    assert [p.page_number for p in result.pages] == [1, 2, 3]
    assert "Overview and Scope" in result.pages[0].page_text
    assert "Cryptographic Key" in result.pages[1].page_text
    assert "Incident Response" in result.pages[2].page_text


def test_pdf_service_rejects_empty_file():
    """Verify empty byte file is rejected with PDFValidationException."""
    with pytest.raises(PDFValidationException) as exc_info:
        PDFService.validate_and_extract(file_bytes=b"", filename="empty.pdf")
    assert "empty" in str(exc_info.value).lower()


def test_pdf_service_rejects_non_pdf_extension():
    """Verify non-.pdf extension is rejected."""
    with pytest.raises(PDFValidationException) as exc_info:
        PDFService.validate_and_extract(file_bytes=b"%PDF-fake", filename="data.txt")
    assert "only .pdf" in str(exc_info.value).lower()


def test_pdf_service_rejects_invalid_magic_header():
    """Verify non-PDF bytes are rejected even with .pdf extension."""
    with pytest.raises(PDFValidationException) as exc_info:
        PDFService.validate_and_extract(file_bytes=b"This is not a pdf file header", filename="corrupt.pdf")
    assert "header" in str(exc_info.value).lower()


def test_pdf_service_rejects_corrupt_pdf():
    """Verify malformed PDF bytes starting with %PDF- but corrupt raise 422."""
    corrupt_bytes = b"%PDF-1.4\nSome broken and unparsable garbage data without trailer"
    with pytest.raises(PDFCorruptOrEncryptedException):
        PDFService.validate_and_extract(file_bytes=corrupt_bytes, filename="broken.pdf")


def test_api_upload_endpoint_success():
    """Test POST /api/documents/upload endpoint with valid PDF file."""
    pdf_bytes = create_sample_pdf(["Section 10.3: Data Encryption at Rest."])
    response = client.post(
        "/api/documents/upload",
        files={"file": ("test_doc.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test_doc.pdf"
    assert data["total_pages"] == 1
    assert data["pages"][0]["page_number"] == 1
    assert "Data Encryption" in data["preview_text"]


def test_api_upload_endpoint_empty_file():
    """Test POST /api/documents/upload with empty file returns 400."""
    response = client.post(
        "/api/documents/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_api_upload_endpoint_invalid_file_type():
    """Test POST /api/documents/upload with text file returns 400."""
    response = client.post(
        "/api/documents/upload",
        files={"file": ("notes.txt", b"plain text", "text/plain")}
    )
    assert response.status_code == 400
    assert "only .pdf" in response.json()["detail"].lower()


def test_api_upload_endpoint_corrupt_file():
    """Test POST /api/documents/upload with corrupt bytes returns 422."""
    response = client.post(
        "/api/documents/upload",
        files={"file": ("corrupt.pdf", b"%PDF-1.7 corrupt broken payload", "application/pdf")}
    )
    assert response.status_code == 422
