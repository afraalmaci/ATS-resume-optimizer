"use client";

import { useState } from "react";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { MultiStepFormProps } from "@/types/form.types";
import { toast } from "react-hot-toast";
import styles from "@/styles/MultiStepForm.module.css";

export default function MultiStepForm({ steps }: MultiStepFormProps) {
  const { step, next, back, currentStepIndex } = useMultiStepForm(steps);
  const [loading, setLoading] = useState(false);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleFinish = async () => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 500));
      toast.success("Form successfully submitted!");
      console.log("Form workflow finished!");
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div>{step}</div>

      <div className={styles.footer}>
        {!isFirstStep ? (
          <button onClick={back} disabled={loading} className={styles.buttonBack}>
            Back
          </button>
        ) : (
          <div />
        )}

        {!isLastStep ? (
          <button onClick={next} disabled={loading} className={styles.buttonAuto}>
            Next
          </button>
        ) : (
          <button onClick={handleFinish} disabled={loading} className={styles.buttonAuto}>
            Finish
          </button>
        )}
      </div>
    </div>
  );
}