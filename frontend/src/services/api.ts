import type { HealthResponse, DocumentUploadResponse } from '../types';

const API_BASE = ''; // Uses Vite proxy in development, or relative in production

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Backend health check failed: HTTP ${response.status}`);
  }

  return response.json();
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorMessage = errorJson.detail;
      }
    } catch {
      // Fallback to text status
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
