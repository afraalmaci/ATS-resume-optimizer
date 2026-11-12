// Response body of POST /analysis.
// Mirrors backend/src/analysis/dto/analysis-response.dto.ts.
export type MatchType = "exact" | "synonym" | "partial" | "missing";

export type SkillSource = "ai" | "rules";

export type SkillCategory =
  | "language"
  | "frontend"
  | "mobile"
  | "backend"
  | "database"
  | "cloud"
  | "devops"
  | "testing"
  | "practice";

export interface SkillMatch {
  skill: string;
  matchType: MatchType;
  score: number;
}

export interface SkillInfo {
  label: string;
  category: SkillCategory;
}

export interface AnalysisResponse {
  /** 0-100: how much of the job's skill list the resume covers. */
  score: number;
  resumeSkills: string[];
  jobSkills: string[];
  missingSkills: string[];
  matches: SkillMatch[];
  /** Whether the skills were found by the AI model or the rule engine. */
  source: SkillSource;
  /** Display name and category of every skill id in this response. */
  skills: Record<string, SkillInfo>;
}
