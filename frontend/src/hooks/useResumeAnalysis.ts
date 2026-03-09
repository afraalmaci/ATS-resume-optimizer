"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchResumeAnalysis, AnalysisResult } from "@/lib/mockApi";

export const useResumeAnalysis = (resumeText: string) => {
  return useQuery<AnalysisResult>({
    queryKey: ["resume-analysis", resumeText],
    queryFn: () => fetchResumeAnalysis(resumeText),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};