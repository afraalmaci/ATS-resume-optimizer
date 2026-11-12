// The real multi-word synonyms ("mongo db", "aws cloud") start with a word
// that already matches on its own, which hides bug 2. This test swaps in a
// synonym whose single words match nothing, so only phrase matching passes.
jest.mock('../skill-normalizer', () => ({
  SKILL_SYNONYMS: { 'google cloud platform': 'gcp' },
}));

import { extractSkills } from '../skill-extractor';

describe('extractSkills with multi-word synonyms (bug 2)', () => {
  it('matches a synonym made of several words', () => {
    expect(extractSkills('Deployed on Google Cloud Platform.')).toEqual([
      'gcp',
    ]);
  });
});
