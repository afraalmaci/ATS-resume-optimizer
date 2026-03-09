"use client";

import { useState } from "react";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { MultiStepFormProps } from "@/types/form.types";
import { toast } from "react-hot-toast";
import styles from "@/styles/MultiStepForm.module.css";

import { motion, AnimatePresence } from "framer-motion";

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
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {step}
        </motion.div>
      </AnimatePresence>

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