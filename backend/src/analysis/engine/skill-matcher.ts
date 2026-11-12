import { SKILL_SYNONYMS } from './skill-normalizer';
import { SKILL_BY_ID } from './skills';

export type MatchType = 'exact' | 'synonym' | 'partial' | 'missing';

export function matchSkill(
  jobSkill: string,
  resumeSkills: string[],
): { score: number; type: MatchType } {
  // exact match
  if (resumeSkills.includes(jobSkill)) {
    return { score: 1, type: 'exact' };
  }

  // synonym match
  const synonym = SKILL_SYNONYMS[jobSkill];
  if (synonym && resumeSkills.includes(synonym)) {
    return { score: 0.9, type: 'synonym' };
  }

  // partial match: a resume skill that implies the job skill
  // (e.g. Next.js on the resume, React in the job ad)
  for (const skill of resumeSkills) {
    if (SKILL_BY_ID.get(skill)?.implies?.includes(jobSkill)) {
      return { score: 0.7, type: 'partial' };
    }
  }

  return { score: 0, type: 'missing' };
}
