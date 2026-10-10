import uuid
import re
import pymupdf as fitz
from typing import Tuple, List, Optional
from ..core.config import settings
from ..models.document import (
    TextBlock,
    PageMetadata,
    DocumentMetadata,
    DocumentUploadResponse,
)


class PDFProcessingException(Exception):
    """Base exception for PDF errors."""
    def __init__(self, message: str, status_code: int = 422):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class PDFValidationException(PDFProcessingException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=400)


class PDFSizeLimitException(PDFProcessingException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=413)


class PDFCorruptOrEncryptedException(PDFProcessingException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=422)


class PDFService:
    @staticmethod
    def validate_and_extract(
        file_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None
    ) -> DocumentUploadResponse:
        """
        Validates the PDF bytes and extracts text and layout metadata
        with 1-indexed page preservation and bounding boxes.
        """
        # 1. Check non-empty
        if not file_bytes or len(file_bytes) == 0:
            raise PDFValidationException("The uploaded file is empty (0 bytes).")

        # 2. Check file size
        file_size = len(file_bytes)
        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
            actual_mb = file_size / (1024 * 1024)
            raise PDFSizeLimitException(
                f"File size ({actual_mb:.2f} MB) exceeds maximum allowed limit ({max_mb:.0f} MB)."
            )

        # 3. Check filename extension
        if not filename.lower().endswith(".pdf"):
            raise PDFValidationException("Invalid file extension. Only .pdf files are supported.")

        # 4. Check PDF magic bytes (%PDF-)
        if not file_bytes.startswith(b"%PDF-"):
            raise PDFValidationException(
                "Invalid PDF file header. The uploaded file does not conform to the PDF specification."
            )

        # 5. Open with PyMuPDF
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            raise PDFCorruptOrEncryptedException(
                f"Failed to open PDF document. File may be damaged or corrupt: {str(e)}"
            )

        try:
            # 6. Check encryption
            if doc.is_encrypted:
                # Try empty password
                auth_success = doc.authenticate("")
                if not auth_success:
                    raise PDFCorruptOrEncryptedException(
                        "The PDF document is password-protected or encrypted. Please decrypt it before uploading."
                    )

            # 7. Check page count
            total_pages = doc.page_count
            if total_pages == 0:
                raise PDFValidationException("The PDF document contains 0 pages.")

            # 8. Extract metadata
            doc_meta_raw = doc.metadata or {}
            metadata = DocumentMetadata(
                title=doc_meta_raw.get("title") or None,
                author=doc_meta_raw.get("author") or None,
                subject=doc_meta_raw.get("subject") or None,
                keywords=doc_meta_raw.get("keywords") or None,
                creator=doc_meta_raw.get("creator") or None,
                producer=doc_meta_raw.get("producer") or None,
                creation_date=doc_meta_raw.get("creationDate") or None,
                mod_date=doc_meta_raw.get("modDate") or None,
            )

            pages_list: List[PageMetadata] = []
            total_words = 0
            total_characters = 0
            preview_chunks: List[str] = []

            # 9. Iterate pages with 1-INDEXED numbering
            for page_idx in range(total_pages):
                one_indexed_page = page_idx + 1
                page = doc.load_page(page_idx)
                rect = page.rect

                # Extract layout blocks: (x0, y0, x1, y1, text, block_no, block_type)
                raw_blocks = page.get_text("blocks")
                text_blocks: List[TextBlock] = []
                page_texts: List[str] = []

                for block in raw_blocks:
                    x0, y0, x1, y1, text, block_no, block_type = block
                    cleaned_text = text.strip()
                    if not cleaned_text:
                        continue

                    # Number of lines inside block
                    lines = [ln for ln in cleaned_text.splitlines() if ln.strip()]
                    
                    text_blocks.append(
                        TextBlock(
                            block_id=int(block_no),
                            bbox=[round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)],
                            text=cleaned_text,
                            block_type=int(block_type),
                            lines_count=max(len(lines), 1),
                        )
                    )
                    page_texts.append(cleaned_text)

                full_page_text = "\n\n".join(page_texts)
                words = re.findall(r"\b\w+\b", full_page_text)
                p_word_count = len(words)
                p_char_count = len(full_page_text)

                total_words += p_word_count
                total_characters += p_char_count

                if len(preview_chunks) < 3 and full_page_text:
                    preview_chunks.append(full_page_text[:400])

                pages_list.append(
                    PageMetadata(
                        page_number=one_indexed_page,
                        width=round(rect.width, 2),
                        height=round(rect.height, 2),
                        word_count=p_word_count,
                        character_count=p_char_count,
                        blocks=text_blocks,
                        page_text=full_page_text,
                    )
                )

            preview_text = "\n\n---\n\n".join(preview_chunks)
            if not preview_text:
                preview_text = "No extractable text found in document (may contain raster scanned pages)."

            return DocumentUploadResponse(
                document_id=str(uuid.uuid4()),
                filename=filename,
                file_size_bytes=file_size,
                total_pages=total_pages,
                total_words=total_words,
                total_characters=total_characters,
                metadata=metadata,
                pages=pages_list,
                preview_text=preview_text[:1200],
            )
        finally:
            doc.close()
