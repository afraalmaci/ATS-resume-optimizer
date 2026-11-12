"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { toast } from "react-hot-toast";
import { RESUME_MAX_BYTES } from "@/schemas/formSchema";

// initialFile restores the selection when the step is shown again.
export function useResumeUpload(initialFile: File | null = null) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      toast.error("Only PDF files are allowed!");
      return;
    }

    const selectedFile = acceptedFiles[0];

    if (selectedFile.size > RESUME_MAX_BYTES) {
      toast.error("File size must be 5 MB or less");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setFile(selectedFile);
      setLoading(false);
      toast.success("PDF selected!");
    }, 500);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    toast("File removed");
  }, []);

  const dropzoneProps = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return { file, loading, removeFile, ...dropzoneProps };
}