"use client";

import { useState } from "react";
import MultiStepForm from "@/components/forms/MultiStepForm";
import ResumeUpload from "@/components/forms/ResumeUpload";
import JobDescriptionForm from "@/components/forms/JobDescriptionForm";
import { Toaster, toast } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { analyzeResume } from "@/lib/api";
import type { AnalysisResponse } from "@/types/analysis";

export default function TestFormPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!resumeFile) return toast.error("Please upload your resume");
    if (!jobDescription) return toast.error("Please enter job description");

    try {
      setLoading(true);
      setAnalysisResult(await analyzeResume(resumeFile, jobDescription));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // matched skills hesaplama
  const matchedSkills =
    analysisResult?.jobSkills?.filter(
      (skill: string) => !analysisResult?.missingSkills?.includes(skill)
    ) || [];

  const steps = [
    <ResumeUpload key="resume" file={resumeFile} onUpload={setResumeFile} />,

    <JobDescriptionForm
      key="job"
      value={jobDescription}
      onChange={setJobDescription}
    />,

    <ErrorBoundary key="result">
      {loading ? (
        <p>Analyzing...</p>
      ) : analysisResult ? (
        <div style={{ marginTop: 20 }}>
          <h2>Analysis Result</h2>

          <p>
            <strong>ATS Score:</strong> {analysisResult.score}%
          </p>

          <h3>Matched Skills</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {matchedSkills.map((skill: string) => (
              <li key={skill} style={{ color: "green" }}>
                ✔ {skill}
              </li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {analysisResult.missingSkills?.length ? (
              analysisResult.missingSkills.map((skill: string) => (
                <li key={skill} style={{ color: "red" }}>
                  ✘ {skill}
                </li>
              ))
            ) : (
              <p>No missing skills 🎉</p>
            )}
          </ul>
        </div>
      ) : (
        <button onClick={handleSubmit}>Submit for Analysis</button>
      )}
    </ErrorBoundary>,
  ];

  return (
    <main style={{ padding: 50 }}>
      <h1>ATS Resume Analyzer</h1>

      <MultiStepForm
        steps={steps}
        canGoNext={[resumeFile !== null, jobDescription.trim() !== ""]}
      />

      <Toaster position="top-right" />
    </main>
  );
}