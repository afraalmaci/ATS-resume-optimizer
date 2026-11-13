"use client";

import { JOB_DESCRIPTION_MAX_CHARS } from "@/schemas/formSchema";

interface JobDescriptionFormProps {
  value: string;
  onChange: (text: string) => void;
  maxChars?: number;
  /** id for an external <label>. */
  id?: string;
  /** Called on Ctrl/Cmd+Enter, e.g. to run the analysis. */
  onSubmit?: () => void;
}

export default function JobDescriptionForm({
  value,
  onChange,
  maxChars = JOB_DESCRIPTION_MAX_CHARS,
  id,
  onSubmit,
}: JobDescriptionFormProps) {
  // Cut over-long input (e.g. a long paste) to the limit instead of dropping it.
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value.slice(0, maxChars));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onSubmit && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border border-rule bg-panel-raised focus-within:border-dim">
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Paste the job ad here..."
        rows={10}
        className="block w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-dim focus:outline-none"
      />
      <div className="flex justify-end border-t border-rule px-4 py-1.5 text-xs tabular-nums text-dim">
        {value.length} / {maxChars}
      </div>
    </div>
  );
}
