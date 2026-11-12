import { matchSkill } from './skill-matcher';

export function calculateATSScore(jobSkills: string[], resumeSkills: string[]) {
  // Nothing to match against; avoid dividing by zero.
  if (jobSkills.length === 0) {
    return { score: 0, missingSkills: [], matches: [] };
  }

  let totalScore = 0;
  const missingSkills: string[] = [];
  const matches: any[] = [];

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

  let atsScore = Math.round((totalScore / jobSkills.length) * 100);

  // extra skill bonus
  if (resumeSkills.length > jobSkills.length) {
    atsScore += 5;
  }

  if (atsScore > 100) atsScore = 100;

  return {
    score: atsScore,
    missingSkills,
    matches,
  };
}
