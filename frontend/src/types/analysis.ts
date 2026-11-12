// Response body of POST /analysis.
// Mirrors backend/src/analysis/dto/analysis-response.dto.ts.
export type MatchType = "exact" | "synonym" | "partial" | "missing";

export interface SkillMatch {
  skill: string;
  matchType: MatchType;
  score: number;
}

export interface AnalysisResponse {
  /** 0-100: how much of the job's skill list the resume covers. */
  score: number;
  resumeSkills: string[];
  jobSkills: string[];
  missingSkills: string[];
  matches: SkillMatch[];
}
