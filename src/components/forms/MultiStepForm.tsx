"use client";

import { useState } from "react";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { toast, Toaster } from "react-hot-toast";

type Props = {
  steps: React.ReactNode[];
  onFinish?: () => void;
};

export default function MultiStepForm({ steps, onFinish }: Props) {
  const { step, next, back, currentStepIndex } = useMultiStepForm(steps);
  const [loading, setLoading] = useState(false);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleFinish = async () => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Form successfully submitted!");
      if (onFinish) onFinish();
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step component */}
      <div style={{ marginBottom: 20 }}>{step}</div>

      {/* Button container */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 10,
        }}
      >
        {/* Back button */}
        {!isFirstStep ? (
          <button onClick={back} disabled={loading} style={{ marginRight: "auto" }}>
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Next / Finish button */}
        {!isLastStep ? (
          <button onClick={next} disabled={loading} style={{ marginLeft: "auto" }}>
            Next
          </button>
        ) : (
          <button onClick={handleFinish} disabled={loading} style={{ marginLeft: "auto" }}>
            Finish
          </button>
        )}
      </div>

      {/* Toast container */}
      <Toaster position="top-right" />
    </div>
  );
}