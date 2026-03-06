"use client";

import { useResumeAnalysis } from "@/hooks/useResumeAnalysis";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { SkeletonLoader } from "../ui/SkeletonLoader";

export const TestAnalysis = ({ resumeText }: { resumeText: string }) => {
  const { setAnalysisResult } = useAppStore();
  const { data, isLoading, isError, error } = useResumeAnalysis(resumeText);

  useEffect(() => {
    if (data) {
      setAnalysisResult(data);
    }
  }, [data, setAnalysisResult]);

  if (isLoading) return <SkeletonLoader />
  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h2>Analysis Result</h2>
      <p>Score: {data?.score}</p>
      <p>Feedback: {data?.feedback}</p>
      <p>Missing Keywords: {data?.missingKeywords.join(", ")}</p>
    </div>
  );
};