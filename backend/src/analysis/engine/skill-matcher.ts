import { SKILL_SYNONYMS } from './skill-normalizer';

export function matchSkill(jobSkill: string, resumeSkills: string[]) {
  // exact match
  if (resumeSkills.includes(jobSkill)) {
    return { score: 1, type: 'exact' };
  }

  // synonym match
  const synonym = SKILL_SYNONYMS[jobSkill];
  if (synonym && resumeSkills.includes(synonym)) {
    return { score: 0.9, type: 'synonym' };
  }

  // partial match
  for (const skill of resumeSkills) {
    if (skill.includes(jobSkill) || jobSkill.includes(skill)) {
      return { score: 0.7, type: 'partial' };
    }
  }

  return { score: 0, type: 'missing' };
}
