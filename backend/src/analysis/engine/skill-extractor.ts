// engine/skill-extractor.ts
import { SKILLS } from './skills';
import { cleanText } from './text-utils';
import { SKILL_SYNONYMS } from './skill-normalizer';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Matches a term as a whole word or phrase. A dot only counts as part of a
// word when a letter or digit follows it, so "node.js," matches "node.js",
// "react." at the end of a sentence matches "react", and the "js" inside
// "node.js" does not match on its own. Letters include non-ASCII ones, so
// "ci" is not found inside a word like "üçci".
function termPattern(term: string): RegExp {
  return new RegExp(
    `(?<![\\p{L}\\p{N}])(?<![\\p{L}\\p{N}]\\.)${escapeRegExp(term)}(?![\\p{L}\\p{N}])(?!\\.[\\p{L}\\p{N}])`,
    'u',
  );
}

export function extractSkills(text: string): string[] {
  const cleaned = cleanText(text); // lowercase + trim + normalize whitespace
  const terms = [...SKILLS, ...Object.keys(SKILL_SYNONYMS)];
  const firstIndex = new Map<string, number>();

  for (const term of terms) {
    const normalized = SKILL_SYNONYMS[term] ?? term;
    if (!SKILLS.includes(normalized)) continue;

    const match = termPattern(term).exec(cleaned);
    if (!match) continue;

    const seen = firstIndex.get(normalized);
    if (seen === undefined || match.index < seen) {
      firstIndex.set(normalized, match.index);
    }
  }

  // Keep the order in which skills appear in the text.
  return [...firstIndex.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([skill]) => skill);
}
