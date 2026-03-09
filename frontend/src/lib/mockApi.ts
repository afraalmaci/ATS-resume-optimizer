export interface AnalysisResult {
  score: number;
  feedback: string;
  missingKeywords: string[];
}

export const fetchResumeAnalysis = (resumeText: string): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        score: Math.floor(Math.random() * 100), // 0-99 random score
        feedback: "This is a mock feedback for your resume.",
        missingKeywords: ["React", "TypeScript", "Next.js"],
      });
    }, 2000); // 2 sec delay
  });
};