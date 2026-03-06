"use client";

import { useState } from "react";
import MultiStepForm from "@/components/forms/MultiStepForm";
import ResumeUpload from "@/components/forms/ResumeUpload";
import JobDescriptionForm from "@/components/forms/JobDescriptionForm";
import { Toaster } from "react-hot-toast";
import { TestAnalysis } from "@/components/analysis/TestAnalysis";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function TestFormPage() {
  const [resumeText, setResumeText] = useState("");

  const steps = [
    <ResumeUpload key="resume" onUpload={setResumeText} />,
    <JobDescriptionForm key="job" />,
    <ErrorBoundary>
      <TestAnalysis key="result" resumeText={resumeText} />
    </ErrorBoundary>,
  ];

  return (
    <main style={{ padding: 50 }}>
      <h1>Multi-Step Form Test</h1>
      <MultiStepForm steps={steps} />
      <Toaster position="top-right" />
    </main>
  );
}