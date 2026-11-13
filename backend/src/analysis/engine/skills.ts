export type SkillCategory =
  | 'language'
  | 'frontend'
  | 'mobile'
  | 'backend'
  | 'database'
  | 'cloud'
  | 'devops'
  | 'testing'
  | 'practice';

export interface SkillDefinition {
  /** Stable id returned by the API. Also matched in text unless aliasesOnly. */
  id: string;
  label: string;
  category: SkillCategory;
  /** Other spellings, lowercase. Multi-word and dotted forms are fine. */
  aliases?: string[];
  /**
   * The id is a common word ("rest", "go"), so only the aliases are matched
   * in text, never the bare id.
   */
  aliasesOnly?: boolean;
  /**
   * Spellings matched only with exactly this capitalization, for names that
   * are also common words: "Express" is the framework, "express" the verb.
   */
  exactCaseForms?: string[];
  /**
   * Skills this one implies. A resume with this skill gets partial credit for
   * a job asking for an implied one (Next.js implies React), not the reverse.
   */
  implies?: string[];
}

export const SKILL_TAXONOMY: readonly SkillDefinition[] = [
  // Languages
  {
    id: 'javascript',
    label: 'JavaScript',
    category: 'language',
    aliases: ['js'],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    category: 'language',
    aliases: ['ts'],
    implies: ['javascript'],
  },
  { id: 'python', label: 'Python', category: 'language', aliases: ['python3'] },
  { id: 'java', label: 'Java', category: 'language' },
  { id: 'kotlin', label: 'Kotlin', category: 'language' },
  { id: 'swift', label: 'Swift', category: 'language' },
  {
    id: 'go',
    label: 'Go',
    category: 'language',
    aliases: ['golang'],
    aliasesOnly: true,
  },
  {
    id: 'csharp',
    label: 'C#',
    category: 'language',
    aliases: ['c#', 'c sharp'],
  },
  { id: 'cpp', label: 'C++', category: 'language', aliases: ['c++'] },
  { id: 'php', label: 'PHP', category: 'language' },
  { id: 'ruby', label: 'Ruby', category: 'language' },
  { id: 'rust', label: 'Rust', category: 'language' },
  { id: 'sql', label: 'SQL', category: 'language' },

  // Frontend
  { id: 'html', label: 'HTML', category: 'frontend', aliases: ['html5'] },
  { id: 'css', label: 'CSS', category: 'frontend', aliases: ['css3'] },
  {
    id: 'sass',
    label: 'Sass',
    category: 'frontend',
    aliases: ['scss'],
    implies: ['css'],
  },
  {
    id: 'react',
    label: 'React',
    category: 'frontend',
    aliases: ['react.js', 'reactjs'],
    implies: ['javascript'],
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    category: 'frontend',
    aliases: ['next.js', 'next js'],
    implies: ['react'],
  },
  {
    id: 'vue',
    label: 'Vue',
    category: 'frontend',
    aliases: ['vue.js', 'vuejs'],
    implies: ['javascript'],
  },
  {
    id: 'angular',
    label: 'Angular',
    category: 'frontend',
    aliases: ['angularjs', 'angular.js'],
    implies: ['typescript'],
  },
  {
    id: 'svelte',
    label: 'Svelte',
    category: 'frontend',
    implies: ['javascript'],
  },
  {
    id: 'tailwind',
    label: 'Tailwind CSS',
    category: 'frontend',
    aliases: ['tailwind css', 'tailwindcss'],
    implies: ['css'],
  },
  { id: 'redux', label: 'Redux', category: 'frontend', implies: ['react'] },

  // Mobile
  {
    id: 'react-native',
    label: 'React Native',
    category: 'mobile',
    aliases: ['react native'],
    implies: ['react'],
  },
  { id: 'flutter', label: 'Flutter', category: 'mobile' },
  { id: 'android', label: 'Android', category: 'mobile' },
  { id: 'ios', label: 'iOS', category: 'mobile' },

  // Backend
  {
    id: 'node',
    label: 'Node.js',
    category: 'backend',
    aliases: ['node.js', 'nodejs'],
    implies: ['javascript'],
  },
  {
    id: 'express',
    label: 'Express',
    category: 'backend',
    aliases: ['express.js', 'expressjs'],
    aliasesOnly: true,
    exactCaseForms: ['Express'],
    implies: ['node'],
  },
  {
    id: 'nestjs',
    label: 'NestJS',
    category: 'backend',
    aliases: ['nest.js'],
    implies: ['node', 'typescript'],
  },
  {
    id: 'spring-boot',
    label: 'Spring Boot',
    category: 'backend',
    aliases: ['spring boot', 'springboot'],
    implies: ['java'],
  },
  { id: 'django', label: 'Django', category: 'backend', implies: ['python'] },
  { id: 'flask', label: 'Flask', category: 'backend', implies: ['python'] },
  { id: 'fastapi', label: 'FastAPI', category: 'backend', implies: ['python'] },
  {
    id: 'dotnet',
    label: '.NET',
    category: 'backend',
    aliases: ['.net', '.net core', 'asp.net', 'asp.net core'],
    implies: ['csharp'],
  },
  {
    id: 'rails',
    label: 'Ruby on Rails',
    category: 'backend',
    aliases: ['ruby on rails'],
    implies: ['ruby'],
  },
  { id: 'laravel', label: 'Laravel', category: 'backend', implies: ['php'] },
  { id: 'graphql', label: 'GraphQL', category: 'backend' },
  {
    id: 'rest',
    label: 'REST',
    category: 'backend',
    aliases: [
      'rest api',
      'rest apis',
      'restful',
      'restful api',
      'restful apis',
    ],
    aliasesOnly: true,
  },
  {
    id: 'microservices',
    label: 'Microservices',
    category: 'backend',
    aliases: ['microservice', 'micro-services', 'micro services'],
  },
  { id: 'kafka', label: 'Kafka', category: 'backend' },

  // Databases
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    category: 'database',
    aliases: ['postgres'],
    implies: ['sql'],
  },
  { id: 'mysql', label: 'MySQL', category: 'database', implies: ['sql'] },
  {
    id: 'mongodb',
    label: 'MongoDB',
    category: 'database',
    aliases: ['mongo', 'mongo db'],
  },
  { id: 'redis', label: 'Redis', category: 'database' },
  {
    id: 'sql-server',
    label: 'SQL Server',
    category: 'database',
    aliases: ['sql server', 'mssql', 'ms sql'],
    implies: ['sql'],
  },
  {
    id: 'elasticsearch',
    label: 'Elasticsearch',
    category: 'database',
    aliases: ['elastic search'],
  },
  { id: 'prisma', label: 'Prisma', category: 'database' },

  // Cloud
  {
    id: 'aws',
    label: 'AWS',
    category: 'cloud',
    aliases: ['amazon web services', 'aws cloud'],
  },
  {
    id: 'azure',
    label: 'Azure',
    category: 'cloud',
    aliases: ['microsoft azure'],
  },
  {
    id: 'gcp',
    label: 'Google Cloud',
    category: 'cloud',
    aliases: ['google cloud', 'google cloud platform'],
  },
  { id: 'firebase', label: 'Firebase', category: 'cloud' },

  // DevOps
  { id: 'docker', label: 'Docker', category: 'devops' },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    category: 'devops',
    aliases: ['k8s'],
  },
  { id: 'terraform', label: 'Terraform', category: 'devops' },
  {
    id: 'ci',
    label: 'CI',
    category: 'devops',
    aliases: [
      'continuous integration',
      'sürekli entegrasyon', // Turkish
      'continue integratie', // Dutch
    ],
  },
  {
    id: 'cd',
    label: 'CD',
    category: 'devops',
    aliases: [
      'continuous delivery',
      'continuous deployment',
      'sürekli dağıtım', // Turkish
      'sürekli teslimat',
      'continue levering', // Dutch
      'continue deployment',
    ],
  },
  {
    id: 'github-actions',
    label: 'GitHub Actions',
    category: 'devops',
    aliases: ['github actions'],
    implies: ['ci'],
  },
  {
    id: 'gitlab-ci',
    label: 'GitLab CI',
    category: 'devops',
    aliases: ['gitlab ci', 'gitlab ci/cd'],
    implies: ['ci', 'cd'],
  },
  { id: 'jenkins', label: 'Jenkins', category: 'devops', implies: ['ci'] },
  { id: 'linux', label: 'Linux', category: 'devops' },
  { id: 'nginx', label: 'Nginx', category: 'devops' },
  { id: 'git', label: 'Git', category: 'devops' },

  // Testing
  {
    id: 'testing',
    label: 'Testing',
    category: 'testing',
    // Not plain "test": too common ("a test", "test environment").
    aliases: [
      'unit test',
      'unit tests',
      'unittests', // Dutch, also written as one word
      'unittesten',
      'automated tests',
      'test automation',
      'birim test', // Turkish, with common suffixed forms
      'birim testi',
      'birim testleri',
      'test otomasyonu',
      'testautomatisering', // Dutch
      'geautomatiseerde tests',
    ],
  },
  { id: 'jest', label: 'Jest', category: 'testing', implies: ['testing'] },
  {
    id: 'cypress',
    label: 'Cypress',
    category: 'testing',
    implies: ['testing'],
  },
  {
    id: 'playwright',
    label: 'Playwright',
    category: 'testing',
    implies: ['testing'],
  },
  { id: 'vitest', label: 'Vitest', category: 'testing', implies: ['testing'] },
  {
    id: 'pytest',
    label: 'pytest',
    category: 'testing',
    implies: ['python', 'testing'],
  },
  {
    id: 'junit',
    label: 'JUnit',
    category: 'testing',
    implies: ['java', 'testing'],
  },

  // Practices
  {
    id: 'agile',
    label: 'Agile',
    category: 'practice',
    aliases: ['çevik'], // Turkish
  },
  { id: 'scrum', label: 'Scrum', category: 'practice', implies: ['agile'] },
];

/** All skill ids. */
export const SKILLS: string[] = SKILL_TAXONOMY.map((s) => s.id);

/** Ids that may be matched in text directly (excludes aliasesOnly ones). */
export const SKILL_ID_TERMS: string[] = SKILL_TAXONOMY.filter(
  (s) => !s.aliasesOnly,
).map((s) => s.id);

/** [form, id] pairs that must match with exact capitalization. */
export const SKILL_EXACT_CASE_TERMS: [string, string][] =
  SKILL_TAXONOMY.flatMap((s) =>
    (s.exactCaseForms ?? []).map((form): [string, string] => [form, s.id]),
  );

export const SKILL_BY_ID: ReadonlyMap<string, SkillDefinition> = new Map(
  SKILL_TAXONOMY.map((s) => [s.id, s]),
);
