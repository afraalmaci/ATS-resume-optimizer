import { SkillMatch } from '../engine/ats-scorer';

/** Response body of POST /analysis. Mirrored in frontend/src/types/analysis.ts. */
export interface AnalysisResponse {
  /** 0-100: how much of the job's skill list the resume covers. */
  score: number;
  resumeSkills: string[];
  jobSkills: string[];
  missingSkills: string[];
  matches: SkillMatch[];
}
