export const SKILL_SYNONYMS: Record<string, string> = {
  'react.js': 'react',
  reactjs: 'react',

  'next.js': 'nextjs',

  'node.js': 'node',
  nodejs: 'node',

  js: 'javascript',
  javascript: 'javascript',

  ts: 'typescript',
  typescript: 'typescript',

  mongo: 'mongodb',
  'mongo db': 'mongodb',

  'aws cloud': 'aws',
};

export function normalizeSkill(skill: string): string {
  const cleaned = skill.toLowerCase().trim();

  if (SKILL_SYNONYMS[cleaned]) {
    return SKILL_SYNONYMS[cleaned];
  }

  return cleaned;
}
