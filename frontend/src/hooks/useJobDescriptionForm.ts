"use client";

import { useState, useCallback } from "react";

export function useJobDescriptionForm(maxChars: number = 500) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length > maxChars) {
      setError(`Maximum ${maxChars} characters allowed`);
    } else {
      setError(null);
    }
    setValue(text);
  }, [maxChars]);

  return { value, error, handleChange, maxChars };
}