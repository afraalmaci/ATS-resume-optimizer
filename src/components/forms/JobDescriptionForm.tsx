"use client";

import { useJobDescriptionForm } from "@/hooks/useJobDescriptionForm";
import { toast } from "react-hot-toast";
import styles from "@/styles/JobDescriptionForm.module.css";

export default function JobDescriptionForm() {
  const { value, error, handleChange, maxChars } = useJobDescriptionForm();

  const handleBlur = () => {
    if (!value) toast.error("Job description cannot be empty");
  };

  return (
    <div className={styles.container}>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter job description here..."
        rows={6}
        className={styles.textarea}
      />
      <div className={styles.footer}>
        <span>{value.length} / {maxChars}</span>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    </div>
  );
}