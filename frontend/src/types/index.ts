export interface HealthResponse {
  status: string;
  project: string;
  version: string;
  nebius_configured: boolean;
  nebius_base_url: string;
  nebius_model: string;
  timestamp: string;
}

export interface TextBlock {
  block_id: number;
  bbox: [number, number, number, number];
  text: string;
  block_type: number;
  lines_count: number;
}

export interface PageMetadata {
  page_number: number;
  width: number;
  height: number;
  word_count: number;
  character_count: number;
  blocks: TextBlock[];
  page_text: string;
}

export interface DocumentMetadata {
  title?: string | null;
  author?: string | null;
  subject?: string | null;
  keywords?: string | null;
  creator?: string | null;
  producer?: string | null;
  creation_date?: string | null;
  mod_date?: string | null;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  file_size_bytes: number;
  total_pages: number;
  total_words: number;
  total_characters: number;
  metadata: DocumentMetadata;
  pages: PageMetadata[];
  preview_text: string;
}
