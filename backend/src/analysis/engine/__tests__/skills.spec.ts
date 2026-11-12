import { SKILL_TAXONOMY } from '../skills';

describe('SKILL_TAXONOMY', () => {
  const ids = SKILL_TAXONOMY.map((s) => s.id);

  it('has unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the skills named in the roadmap', () => {
    expect(ids).toEqual(
      expect.arrayContaining(['java', 'spring-boot', 'python', 'react-native']),
    );
  });

  it('keeps every id from the original 27-skill list', () => {
    expect(ids).toEqual(
      expect.arrayContaining([
        'react',
        'nextjs',
        'javascript',
        'typescript',
        'node',
        'nestjs',
        'express',
        'docker',
        'kubernetes',
        'aws',
        'azure',
        'gcp',
        'mongodb',
        'postgresql',
        'mysql',
        'redis',
        'graphql',
        'rest',
        'git',
        'ci',
        'cd',
        'testing',
        'jest',
        'cypress',
        'tailwind',
        'html',
        'css',
      ]),
    );
  });

  it('has about 70 skills', () => {
    expect(SKILL_TAXONOMY.length).toBeGreaterThanOrEqual(65);
    expect(SKILL_TAXONOMY.length).toBeLessThanOrEqual(80);
  });

  it('uses lowercase aliases that belong to exactly one skill', () => {
    const owner = new Map<string, string>();
    for (const skill of SKILL_TAXONOMY) {
      for (const alias of skill.aliases ?? []) {
        expect(alias).toBe(alias.toLowerCase().trim());
        expect(ids).not.toContain(alias);
        expect(owner.get(alias) ?? skill.id).toBe(skill.id);
        owner.set(alias, skill.id);
      }
    }
  });

  it('only implies skills that exist', () => {
    for (const skill of SKILL_TAXONOMY) {
      for (const implied of skill.implies ?? []) {
        expect(ids).toContain(implied);
        expect(implied).not.toBe(skill.id);
      }
    }
  });

  it('gives skills matched only by alias at least one alias', () => {
    for (const skill of SKILL_TAXONOMY.filter((s) => s.aliasesOnly)) {
      expect(skill.aliases?.length).toBeGreaterThan(0);
    }
  });
});
