import { readFileSync } from 'fs';
import { join } from 'path';

// Realistic but fictional job ads and a resume, written for tests (not copied
// from real companies), with the skills a person would say each text names.
// Used by the unit tests and by the extraction eval (test/eval).

export interface TextFixture {
  file: string;
  kind: 'job' | 'resume';
  expected: string[];
  /**
   * Expected skills that the text only names in Turkish or Dutch, which the
   * rule engine does not know (the AI model should find them).
   */
  localSkills?: string[];
}

export const TEXT_FIXTURES: TextFixture[] = [
  {
    file: 'job-fullstack-en.txt',
    kind: 'job',
    expected: [
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
    ],
  },
  {
    file: 'job-java-nl.txt',
    kind: 'job',
    localSkills: ['testing'],
    expected: [
      'testing', // "unittests"
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
    ],
  },
  {
    file: 'job-frontend-tr.txt',
    kind: 'job',
    localSkills: ['testing'],
    expected: [
      'testing', // "birim test yazma deneyimi"
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
    ],
  },
  {
    file: 'job-backend-tr-local.txt',
    kind: 'job',
    localSkills: ['testing', 'ci', 'cd', 'agile'],
    expected: [
      'java',
      'spring-boot',
      'postgresql',
      'aws',
      'sql',
      'junit',
      'testing', // "birim test"
      'ci', // "sürekli entegrasyon"
      'cd', // "sürekli dağıtım"
      'git',
      'agile', // "çevik"
      'docker',
      'kubernetes',
    ],
  },
  {
    file: 'job-qa-nl-local.txt',
    kind: 'job',
    localSkills: ['testing', 'ci'],
    expected: [
      'testing', // "testautomatisering", "unittesten"
      'cypress',
      'playwright',
      'ci', // "continue integratie"
      'javascript',
      'typescript',
      'rest',
      'agile',
      'git',
      'docker',
      'github-actions',
    ],
  },
  {
    file: 'resume-fullstack-en.txt',
    kind: 'resume',
    expected: [
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
    ],
  },
];

export function readFixture(file: string): string {
  return readFileSync(join(__dirname, file), 'utf8');
}

export function fixture(file: string): TextFixture {
  const found = TEXT_FIXTURES.find((f) => f.file === file);
  if (!found) throw new Error(`Unknown fixture ${file}`);
  return found;
}
