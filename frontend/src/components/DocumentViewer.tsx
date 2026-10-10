import { useState, type FC } from 'react';
import type { DocumentUploadResponse } from '../types';
import {
  FileText,
  Layers,
  Hash,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  Code,
  Tag,
} from 'lucide-react';

interface DocumentViewerProps {
  document: DocumentUploadResponse;
  onReset: () => void;
}

export const DocumentViewer: FC<DocumentViewerProps> = ({ document, onReset }) => {
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'blocks' | 'raw'>('blocks');

  const currentPage = document.pages.find((p) => p.page_number === selectedPageNum) || document.pages[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Action Bar & Metadata Overview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight m-0">{document.filename}</h2>
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" /> Extracted
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {document.document_id}
              </p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-sm font-medium transition-colors border border-slate-700/60 self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Upload Another Document
          </button>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Total Pages</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {document.total_pages}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">1-Indexed Preserved</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>Total Words</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {document.total_words.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {document.total_characters.toLocaleString()} characters
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>File Size</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {(document.file_size_bytes / 1024).toFixed(1)} <span className="text-sm font-normal text-slate-400">KB</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Valid PDF Structure</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Document Title</span>
            </div>
            <div className="text-sm font-semibold text-slate-200 truncate" title={document.metadata.title || 'Untitled'}>
              {document.metadata.title || 'Untitled Document'}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              Author: {document.metadata.author || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation & Layout Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: 1-Indexed Page Navigator */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:col-span-1 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Document Pages
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {document.total_pages} {document.total_pages === 1 ? 'Page' : 'Pages'}
            </span>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[500px] pr-1">
            {document.pages.map((p) => {
              const isSelected = p.page_number === selectedPageNum;
              return (
                <button
                  key={p.page_number}
                  onClick={() => setSelectedPageNum(p.page_number)}
                  className={`flex items-center justify-between p-3 rounded-xl text-left text-sm transition-all cursor-pointer flex-shrink-0 lg:flex-shrink ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                      P. {p.page_number}
                    </span>
                    <span className="text-xs truncate max-w-[120px]">
                      {p.word_count} words
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    {p.blocks.length} blocks
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Page Detail & Extracted Bounding Box Blocks */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  Page {currentPage.page_number}
                </span>
                <span className="text-xs text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  1-Indexed
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentPage.width} × {currentPage.height} pt
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentPage.blocks.length} layout text blocks • {currentPage.word_count} words
              </p>
            </div>

            {/* Toggle View Mode */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setViewMode('blocks')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'blocks'
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Layout Blocks
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'raw'
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Raw Text
              </button>
            </div>
          </div>

          {/* View Mode: Bounding Box Layout Blocks */}
          {viewMode === 'blocks' ? (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
              {currentPage.blocks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No text blocks detected on this page.
                </div>
              ) : (
                currentPage.blocks.map((block) => (
                  <div
                    key={block.block_id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 mb-2 border-b border-slate-800/60 font-mono">
                      <span className="font-semibold text-emerald-400">
                        Block #{block.block_id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          bbox: [{block.bbox.join(', ')}]
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {block.lines_count} {block.lines_count === 1 ? 'line' : 'lines'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {block.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* View Mode: Consolidated Raw Page Text */
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[550px] overflow-y-auto">
              {currentPage.page_text || 'No text extracted.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
