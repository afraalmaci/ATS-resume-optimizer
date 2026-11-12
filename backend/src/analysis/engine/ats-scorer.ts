import { matchSkill, MatchType } from './skill-matcher';

export interface SkillMatch {
  skill: string;
  matchType: MatchType;
  score: number;
}

export interface ATSScoreResult {
  score: number;
  missingSkills: string[];
  matches: SkillMatch[];
}

export function calculateATSScore(
  jobSkills: string[],
  resumeSkills: string[],
): ATSScoreResult {
  // Nothing to match against; avoid dividing by zero.
  if (jobSkills.length === 0) {
    return { score: 0, missingSkills: [], matches: [] };
  }

  let totalScore = 0;
  const missingSkills: string[] = [];
  const matches: SkillMatch[] = [];

  for (const jobSkill of jobSkills) {
    const match = matchSkill(jobSkill, resumeSkills);

    totalScore += match.score;

    if (match.score === 0) {
      missingSkills.push(jobSkill);
    }

    matches.push({
      skill: jobSkill,
      matchType: match.type,
      score: match.score,
    });
  }

  // The score is only how much of the job's skill list the resume covers.
  return {
    score: Math.round((totalScore / jobSkills.length) * 100),
    missingSkills,
    matches,
  };
}
