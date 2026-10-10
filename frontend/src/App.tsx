import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { fetchHealth, uploadDocument } from './services/api';
import type { HealthResponse, DocumentUploadResponse } from './types';
import {
  FileCheck2,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentUploadResponse | null>(null);

  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend offline or health check failed:', err);
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    setUploadStage('Reading PDF and sending to backend...');

    try {
      setUploadStage('Extracting layout blocks and preserving 1-indexed pages...');
      const result = await uploadDocument(file);
      setDocument(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while processing the PDF.');
    } finally {
      setUploading(false);
      setUploadStage('');
    }
  };

  const handleReset = () => {
    setDocument(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        health={health}
        loading={healthLoading}
        onRefreshHealth={checkHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        {/* Error Alert Banner */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start justify-between gap-3 text-sm text-rose-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-200">Processing Error</strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1 rounded-md hover:bg-rose-500/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Overlay State */}
        {uploading && (
          <div className="max-w-xl mx-auto w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 my-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ingesting Technical Specification</h3>
              <p className="text-sm text-slate-400 mt-1">{uploadStage}</p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Document Ingestion / Viewer Views */}
        {!uploading && !document && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>NVIDIA Nemotron Compliance Engineering</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight m-0">
                Audit Technical Specifications with Precision
              </h2>
              <p className="text-base text-slate-400 leading-relaxed">
                SpecLens AI ingests engineering standards, compliance guidelines, and technical PDFs
                with strict 1-indexed page preservation and block-level layout coordinates.
              </p>
            </div>

            {/* Upload Area */}
            <FileUpload
              onFileSelect={handleFileUpload}
              disabled={uploading}
            />

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Layers className="w-4 h-4" />
                  <span>1-Indexed Page Preservation</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every paragraph and table retains its exact PDF page number and bounding-box coordinates for zero-hallucination citations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
                  <Cpu className="w-4 h-4" />
                  <span>Nebius Token Factory</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Server-side gateway securely ready for NVIDIA Nemotron-3 models with protected API credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <FileCheck2 className="w-4 h-4" />
                  <span>PyMuPDF Layout Engine</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-speed layout decomposition extracts text blocks and font metrics natively in CPython 3.11.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Document View */}
        {!uploading && document && (
          <DocumentViewer
            document={document}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-6 py-4 mt-auto text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SpecLens AI • Phase 1 Foundation</span>
          <span className="font-mono text-[11px]">
            FastAPI + PyMuPDF + React TypeScript + Nebius Token Factory
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
