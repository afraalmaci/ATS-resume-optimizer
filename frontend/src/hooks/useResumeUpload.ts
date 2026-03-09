"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { toast } from "react-hot-toast";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function useResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      toast.error("Only PDF files are allowed!");
      return;
    }

    const selectedFile = acceptedFiles[0];

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 2MB");
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