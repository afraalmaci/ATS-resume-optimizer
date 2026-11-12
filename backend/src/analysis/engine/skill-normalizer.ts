import { SKILL_TAXONOMY } from './skills';

/** Alias -> skill id, built from the aliases in SKILL_TAXONOMY. */
export const SKILL_SYNONYMS: Record<string, string> = Object.fromEntries(
  SKILL_TAXONOMY.flatMap((skill) =>
    (skill.aliases ?? []).map((alias) => [alias, skill.id]),
  ),
);

export function normalizeSkill(skill: string): string {
  const cleaned = skill.toLowerCase().trim();

  if (SKILL_SYNONYMS[cleaned]) {
    return SKILL_SYNONYMS[cleaned];
  }

  return cleaned;
}
