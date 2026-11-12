"use client";

import React from "react";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import styles from "@/styles/ResumeUpload.module.css";

interface ResumeUploadProps {
  /** The currently selected file, kept by the parent across steps. */
  file?: File | null;
  /** Called with the selected file, or null when it is removed. */
  onUpload: (file: File | null) => void;
}

export default function ResumeUpload({ file: selected = null, onUpload }: ResumeUploadProps) {
  const { file, loading, removeFile, getRootProps, getInputProps, isDragActive } =
    useResumeUpload(selected);

  React.useEffect(() => {
    onUpload(file);
  }, [file, onUpload]);

  return (
    <div>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""}`}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <input {...getInputProps()} disabled={loading} />
        {loading ? (
          <p>Loading...</p>
        ) : isDragActive ? (
          <p>Drop the PDF here ...</p>
        ) : file ? (
          <p>{file.name}</p>
        ) : (
          <p>Drag & drop your resume here, or click to select PDF</p>
        )}
      </div>

      {file && !loading && (
        <div className={styles.fileInfo}>
          <span>{file.name}</span>
          <button className={styles.removeButton} onClick={removeFile}>
            remove
          </button>
        </div>
      )}
    </div>
  );
}