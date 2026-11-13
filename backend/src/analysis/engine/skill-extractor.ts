// engine/skill-extractor.ts
import { SKILLS, SKILL_EXACT_CASE_TERMS, SKILL_ID_TERMS } from './skills';
import { normalizeWhitespace, toMatchCase } from './text-utils';
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
    'gu',
  );
}

interface Hit {
  skill: string;
  start: number;
  end: number;
}

export function extractSkills(text: string): string[] {
  const original = normalizeWhitespace(text);
  const cleaned = toMatchCase(original);
  const hits: Hit[] = [];

  const addHits = (haystack: string, term: string, skill: string) => {
    if (!SKILLS.includes(skill)) return;
    for (const match of haystack.matchAll(termPattern(term))) {
      hits.push({ skill, start: match.index, end: match.index + term.length });
    }
  };

  for (const term of [...SKILL_ID_TERMS, ...Object.keys(SKILL_SYNONYMS)]) {
    addHits(cleaned, term, SKILL_SYNONYMS[term] ?? term);
  }
  // Names that are also common words only count with their exact capitalization.
  for (const [form, skill] of SKILL_EXACT_CASE_TERMS) {
    addHits(original, form, skill);
  }

  // Longest phrase wins where matches overlap, so "react native" counts as
  // react-native only, not also as react.
  hits.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const taken: Hit[] = [];
  const firstIndex = new Map<string, number>();

  for (const hit of hits) {
    if (taken.some((t) => hit.start < t.end && t.start < hit.end)) continue;
    taken.push(hit);

    const seen = firstIndex.get(hit.skill);
    if (seen === undefined || hit.start < seen) {
      firstIndex.set(hit.skill, hit.start);
    }
  }

  // Keep the order in which skills appear in the text.
  return [...firstIndex.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([skill]) => skill);
}
