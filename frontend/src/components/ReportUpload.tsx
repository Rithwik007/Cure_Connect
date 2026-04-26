// ─────────────────────────────────────────────
//  ReportUpload — accepts image/PDF, converts
//  to base64 via FileReader
// ─────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import type { Report } from '../types';

interface PendingReport {
  fileName: string;
  fileType: 'image' | 'pdf';
  base64Data: string;
  previewUrl?: string;
}

interface ReportUploadProps {
  reports: PendingReport[];
  onChange: (reports: PendingReport[]) => void;
}

export type { PendingReport };

const ReportUpload: React.FC<ReportUploadProps> = ({ reports, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImage && !isPdf) {
        setError('Only images (JPG, PNG) and PDF files are supported.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5 MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = (e.target?.result as string) ?? '';
        const newReport: PendingReport = {
          fileName: file.name,
          fileType: isImage ? 'image' : 'pdf',
          base64Data,
          previewUrl: isImage ? base64Data : undefined,
        };
        onChange([...reports, newReport]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReport = (index: number) => {
    onChange(reports.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          📎 Reports / Files
        </h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-teal-600 text-sm font-medium hover:text-teal-800 transition min-h-[36px] px-3"
        >
          + Attach file
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {reports.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 text-gray-400 hover:border-teal-400 hover:text-teal-500 transition flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📄</span>
          <span className="text-sm">Tap to attach images or PDFs</span>
        </button>
      )}

      {reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((rep, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200"
            >
              {rep.previewUrl ? (
                <img
                  src={rep.previewUrl}
                  alt={rep.fileName}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xl">
                  📄
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {rep.fileName}
                </p>
                <p className="text-xs text-gray-500 uppercase">{rep.fileType}</p>
              </div>
              <button
                type="button"
                onClick={() => removeReport(index)}
                className="text-red-400 hover:text-red-600 transition text-sm min-h-[36px] px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportUpload;
