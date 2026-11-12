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
});
