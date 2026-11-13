"use client";

import { useState } from "react";
import clsx from "clsx";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import PdfPreviewModal from "./PdfPreviewModal";

interface ResumeUploadProps {
  /** The selected file. The parent owns it, so a sample can be loaded too. */
  file?: File | null;
  /** Called with the chosen file, or null when it is removed. */
  onUpload: (file: File | null) => void;
}

export default function ResumeUpload({ file = null, onUpload }: ResumeUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useResumeUpload({
    onSelect: (selected) => {
      setError(null);
      onUpload(selected);
    },
    onError: setError,
  });

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 border border-rule bg-panel-raised px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 shrink-0 bg-ok" aria-hidden />
          <span className="truncate text-sm">{file.name}</span>
          <span className="shrink-0 text-xs text-dim">
            {(file.size / 1024).toFixed(0)} KB
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setPreviewing(true)}
            className="text-xs uppercase tracking-widest text-amber underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-amber"
          >
            view
          </button>
          <button
            type="button"
            onClick={() => onUpload(null)}
            className="text-xs uppercase tracking-widest text-dim underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-amber"
          >
            remove
          </button>
        </div>
        {previewing && (
          <PdfPreviewModal file={file} onClose={() => setPreviewing(false)} />
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-4 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-amber",
          isDragActive
            ? "border-amber bg-amber/10 text-amber"
            : "border-rule text-dim hover:border-dim hover:text-ink",
        )}
      >
        <input {...getInputProps()} aria-label="Resume PDF" />
        <span className="text-sm">
          {isDragActive ? "Release to load" : "Drop a PDF here, or click to choose"}
        </span>
        <span className="text-xs text-dim">PDF · max 5 MB</span>
      </div>
      <p aria-live="polite" className="mt-2 min-h-4 text-xs text-red">
        {error}
      </p>
    </div>
  );
}
