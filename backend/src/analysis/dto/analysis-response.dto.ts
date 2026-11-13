import { SkillSource } from '../ai/skill-extraction.service';
import { SkillMatch } from '../engine/ats-scorer';
import { SkillCategory } from '../engine/skills';

export interface SkillInfo {
  label: string;
  category: SkillCategory;
}

/** Response body of POST /analysis. Mirrored in frontend/src/types/analysis.ts. */
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
