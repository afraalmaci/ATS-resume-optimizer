"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  steps: React.ReactNode[];
  /** Per step: whether Next is allowed. Missing entries default to true. */
  canGoNext?: boolean[];
}

export default function MultiStepForm({ steps, canGoNext = [] }: Props) {
  const [step, setStep] = useState(0);
  const nextAllowed = canGoNext[step] ?? true;

  const next = () => {
    if (nextAllowed && step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      <div style={{ marginTop: 20 }}>
        {step > 0 && (
          <button onClick={prev} style={{ marginRight: 10 }}>
            Back
          </button>
        )}

        {step < steps.length - 1 && (
          <button onClick={next} disabled={!nextAllowed}>
            Next
          </button>
        )}
      </div>

    </div>
  );
}