import { extractSkills } from '../skill-extractor';
import { calculateATSScore } from '../ats-scorer';
import {
  TEXT_FIXTURES,
  readFixture,
} from '../../../../test/fixtures/texts/expected';

const sorted = (skills: string[]) => [...skills].sort();

describe('skill extraction on realistic texts', () => {
  it.each(TEXT_FIXTURES)('$file', ({ file, expected, localSkills = [] }) => {
    // The rule engine finds every expected skill except those the text only
    // names in Turkish or Dutch (the AI model's job, measured in test/eval).
    const expectedByRules = expected.filter((s) => !localSkills.includes(s));
    expect(sorted(extractSkills(readFixture(file)))).toEqual(
      sorted(expectedByRules),
    );
  });
});

describe('scoring a realistic resume against a realistic job ad', () => {
  it('scores the full-stack resume against the full-stack ad', () => {
    const job = extractSkills(readFixture('job-fullstack-en.txt'));
    const resume = extractSkills(readFixture('resume-fullstack-en.txt'));
    const result = calculateATSScore(job, resume);

    // Exact: react, typescript, node, docker, aws, rest (6 of 19).
    // Nothing on the resume implies the other 13.
    expect(result.missingSkills).toHaveLength(13);
    expect(result.score).toBe(32);
  });
});
