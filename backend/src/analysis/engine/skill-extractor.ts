// engine/skill-extractor.ts
import { SKILLS } from './skills';
import { cleanText } from './text-utils';
import { SKILL_SYNONYMS } from './skill-normalizer';

export function extractSkills(text: string): string[] {
  const cleaned = cleanText(text); // lowercase + trim + normalize whitespace
  const words = cleaned.split(' '); // tüm kelimeleri ayır
  const foundSkills: string[] = [];

  for (const word of words) {
    // normalize word via SKILL_SYNONYMS
    const normalized = SKILL_SYNONYMS[word] || word;
    if (SKILLS.includes(normalized) && !foundSkills.includes(normalized)) {
      foundSkills.push(normalized);
    }
  }

  return foundSkills;
}
