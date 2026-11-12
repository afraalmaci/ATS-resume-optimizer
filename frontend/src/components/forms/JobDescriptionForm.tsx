"use client";

import { JOB_DESCRIPTION_MAX_CHARS } from "@/schemas/formSchema";

interface JobDescriptionFormProps {
  value: string;
  onChange: (text: string) => void;
  maxChars?: number;
}

export default function JobDescriptionForm({
  value,
  onChange,
  maxChars = JOB_DESCRIPTION_MAX_CHARS,
}: JobDescriptionFormProps) {
  // Cut over-long input (e.g. a long paste) to the limit instead of dropping it.
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value.slice(0, maxChars));
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Enter job description here..."
        rows={6}
        style={{ width: "100%" }}
      />
      <div>
        {value.length} / {maxChars}
      </div>
    </div>
  );
}