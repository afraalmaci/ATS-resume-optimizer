import { readFileSync } from 'fs';
import { join } from 'path';
import { extractSkills } from '../skill-extractor';
import { calculateATSScore } from '../ats-scorer';

// Realistic job ads and a resume (written for these tests, not copied from
// real companies), with the skills a person would say each text asks for.
const read = (name: string) =>
  readFileSync(
    join(__dirname, '../../../../test/fixtures/texts', name),
    'utf8',
  );

const sorted = (skills: string[]) => [...skills].sort();

describe('skill extraction on realistic texts', () => {
  it('English full-stack job ad', () => {
    expect(sorted(extractSkills(read('job-fullstack-en.txt')))).toEqual(
      sorted([
        'react',
        'typescript',
        'node',
        'nestjs',
        'postgresql',
        'redis',
        'docker',
        'aws',
        'rest',
        'sql',
        'ci',
        'cd',
        'github-actions',
        'testing',
        'jest',
        'playwright',
        'graphql',
        'kubernetes',
        'terraform',
      ]),
    );
  });

  it('Dutch Java job ad', () => {
    expect(sorted(extractSkills(read('job-java-nl.txt')))).toEqual(
      sorted([
        'java',
        'spring-boot',
        'microservices',
        'kafka',
        'junit',
        'scrum',
        'sql',
        'postgresql',
        'sql-server',
        'docker',
        'kubernetes',
      ]),
    );
  });

  it('Turkish frontend job ad', () => {
    expect(sorted(extractSkills(read('job-frontend-tr.txt')))).toEqual(
      sorted([
        'react',
        'nextjs',
        'javascript',
        'typescript',
        'html',
        'css',
        'tailwind',
        'redux',
        'git',
        'agile',
        'scrum',
        'rest',
        'jest',
      ]),
    );
  });

  it('English full-stack resume', () => {
    expect(sorted(extractSkills(read('resume-fullstack-en.txt')))).toEqual(
      sorted([
        'javascript',
        'typescript',
        'react',
        'node',
        'express',
        'mongodb',
        'docker',
        'rest',
        'aws',
        'vue',
      ]),
    );
  });
});

describe('scoring a realistic resume against a realistic job ad', () => {
  it('scores the full-stack resume against the full-stack ad', () => {
    const job = extractSkills(read('job-fullstack-en.txt'));
    const resume = extractSkills(read('resume-fullstack-en.txt'));
    const result = calculateATSScore(job, resume);

    // Exact: react, typescript, node, docker, aws, rest (6 of 19).
    // Nothing on the resume implies the other 13.
    expect(result.missingSkills).toHaveLength(13);
    expect(result.score).toBe(32);
  });
});
