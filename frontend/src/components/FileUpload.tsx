import { useState, useRef, type FC, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const MAX_SIZE_MB = 25;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const FileUpload: FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndDispatch = (file: File) => {
    setClientError(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setClientError('Only PDF files (.pdf) are supported.');
      return;
    }

    // Validate size
    if (file.size > MAX_BYTES) {
      setClientError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    if (file.size === 0) {
      setClientError('Uploaded file is empty (0 bytes).');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndDispatch(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndDispatch(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-200 cursor-pointer text-center
          ${isDragOver
            ? 'border-emerald-500 bg-emerald-500/5 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-100">
              Upload compliance specification or standard
            </h3>
            <p className="text-sm text-slate-400">
              Drag and drop your technical PDF here, or <span className="text-emerald-400 underline underline-offset-2">browse files</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              PDF Format Only
            </span>
            <span>•</span>
            <span>Max 25 MB</span>
            <span>•</span>
            <span>PyMuPDF Layout Preservation</span>
          </div>
        </div>
      </div>

      {clientError && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-sm text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{clientError}</span>
        </div>
      )}
    </div>
  );
};
