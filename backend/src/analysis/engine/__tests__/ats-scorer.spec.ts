import { calculateATSScore } from '../ats-scorer';

describe('calculateATSScore', () => {
  it('returns 0, not NaN, when there are no job skills (bug 3)', () => {
    const result = calculateATSScore([], ['react']);
    expect(Number.isFinite(result.score)).toBe(true);
    expect(result.score).toBe(0);
    expect(result.missingSkills).toEqual([]);
    expect(result.matches).toEqual([]);
  });

  it('scores 100 when every job skill matches exactly', () => {
    const result = calculateATSScore(['react', 'node'], ['react', 'node']);
    expect(result.score).toBe(100);
    expect(result.missingSkills).toEqual([]);
  });

  it('gives no bonus for extra resume skills when nothing matches', () => {
    const result = calculateATSScore(
      ['docker', 'aws'],
      ['react', 'node', 'css'],
    );
    expect(result.score).toBe(0);
    expect(result.missingSkills).toEqual(['docker', 'aws']);
  });

  it('gives partial credit when a resume skill implies the job skill', () => {
    const result = calculateATSScore(['react'], ['nextjs']);
    expect(result.score).toBe(70);
    expect(result.matches).toEqual([
      { skill: 'react', matchType: 'partial', score: 0.7 },
    ]);
  });

  it('does not treat a shared substring as a partial match', () => {
    const result = calculateATSScore(['java'], ['javascript']);
    expect(result.score).toBe(0);
    expect(result.missingSkills).toEqual(['java']);
  });

  it('only gives partial credit in the implied direction', () => {
    // Next.js experience implies React, but React alone does not imply Next.js.
    const result = calculateATSScore(['nextjs'], ['react']);
    expect(result.score).toBe(0);
  });
});
