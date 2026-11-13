"use client";

import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { RESUME_MAX_BYTES } from "@/schemas/formSchema";

interface Options {
  onSelect: (file: File) => void;
  onError: (message: string) => void;
}

/** Drag-and-drop or click-to-select for one PDF, with type and size checks. */
export function useResumeUpload({ onSelect, onError }: Options) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0 || acceptedFiles.length === 0) {
        onError("Only PDF files are allowed");
        return;
      }

      const selected = acceptedFiles[0];
      if (selected.size > RESUME_MAX_BYTES) {
        onError("File size must be 5 MB or less");
        return;
      }
      onSelect(selected);
    },
    [onSelect, onError],
  );

  return useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });
}
