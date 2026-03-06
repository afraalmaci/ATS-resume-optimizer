"use client";
import React from "react";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { ResumeUploadProps } from "@/types/form.types";
import styles from "@/styles/ResumeUpload.module.css";

export default function ResumeUpload({ onUpload }: ResumeUploadProps) {
  const { file, loading, removeFile, getRootProps, getInputProps, isDragActive } =
    useResumeUpload();

  React.useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (onUpload) onUpload(text);
    };

    reader.readAsText(file); // TODO : pdf parsing -> add  pdf lib 
  }, [file, onUpload]);

  return (
    <div>
      {/* Drag & Drop */}
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

      {/* File info + remove */}
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