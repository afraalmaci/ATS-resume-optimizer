import { extractSkills } from '../skill-extractor';

describe('extractSkills', () => {
  describe('punctuation next to skills (bug 1)', () => {
    it('finds skills separated by commas', () => {
      const skills = extractSkills('React, TypeScript');
      expect(skills).toEqual(expect.arrayContaining(['react', 'typescript']));
    });

    it('finds skills followed by semicolons and periods', () => {
      const skills = extractSkills('Skills: docker; redis.');
      expect(skills).toEqual(expect.arrayContaining(['docker', 'redis']));
    });
  });

  // These phrases already matched word by word before the fix, so they are
  // regression checks only. Bug 2 is reproduced in
  // skill-extractor.multi-word.spec.ts.
  describe('multi-word synonyms in the real synonym list', () => {
    it('matches "mongo db" and "aws cloud"', () => {
      const skills = extractSkills('Experience with Mongo DB and AWS Cloud');
      expect(skills).toEqual(expect.arrayContaining(['mongodb', 'aws']));
    });

    it('matches a multi-word synonym split across a line break', () => {
      const skills = extractSkills('Worked with Mongo\nDB daily');
      expect(skills).toContain('mongodb');
    });
  });

  describe('dotted spellings (bug 4)', () => {
    it('recognizes "Next.js"', () => {
      expect(extractSkills('Next.js')).toContain('nextjs');
    });

    it('recognizes "Node.js," with trailing punctuation', () => {
      const skills = extractSkills('Built with Node.js, Express');
      expect(skills).toEqual(expect.arrayContaining(['node', 'express']));
    });
  });

  describe('non-ASCII text', () => {
    it('does not find a skill inside a word with non-ASCII letters', () => {
      expect(extractSkills('üçci')).not.toContain('ci');
    });

    it('finds skills next to Dutch text with diacritics', () => {
      expect(
        extractSkills('Ervaring met React en CI/CD, geïnteresseerd in Docker'),
      ).toEqual(['react', 'ci', 'cd', 'docker']);
    });
  });

  describe('expanded skill list', () => {
    it('finds Java, Spring Boot, Python and Django', () => {
      expect(
        extractSkills('Java and Spring Boot, plus Python (Django)'),
      ).toEqual(['java', 'spring-boot', 'python', 'django']);
    });

    it('finds skills with symbols in their names', () => {
      expect(extractSkills('C#, .NET Core and C++')).toEqual([
        'csharp',
        'dotnet',
        'cpp',
      ]);
    });

    it('maps aliases such as k8s and golang', () => {
      expect(extractSkills('Kubernetes (k8s) and Golang')).toEqual([
        'kubernetes',
        'go',
      ]);
    });
  });

  describe('overlapping phrases', () => {
    it('counts "React Native" only as react-native', () => {
      expect(extractSkills('React Native developer')).toEqual(['react-native']);
    });

    it('still finds React when it also appears on its own', () => {
      expect(extractSkills('React Native and React')).toEqual([
        'react-native',
        'react',
      ]);
    });

    it('counts "GitLab CI/CD" only as gitlab-ci', () => {
      expect(extractSkills('Pipelines in GitLab CI/CD')).toEqual(['gitlab-ci']);
    });
  });

  describe('common words that are also skill names', () => {
    it('does not read the word "rest" as REST', () => {
      expect(extractSkills('the rest of the team')).not.toContain('rest');
    });

    it('finds REST from "REST API" and "RESTful"', () => {
      expect(extractSkills('REST API')).toEqual(['rest']);
      expect(extractSkills('RESTful services')).toEqual(['rest']);
    });

    it('does not read the verb "express" as Express', () => {
      expect(extractSkills('a team where you can express your ideas')).toEqual(
        [],
      );
    });

    it('finds Express when it is written as a name', () => {
      expect(extractSkills('Node.js, Express and MongoDB')).toEqual([
        'node',
        'express',
        'mongodb',
      ]);
      expect(extractSkills('ExpressJS')).toEqual(['express']);
      expect(extractSkills('express.js')).toEqual(['express']);
    });

    it('does not read the word "go" as Go', () => {
      expect(extractSkills('Ready to go to market')).not.toContain('go');
    });
  });

  describe('Turkish and Dutch skill terms', () => {
    it('finds Turkish terms for testing, CI, CD and agile', () => {
      expect(
        extractSkills(
          'Birim test yazma alışkanlığı, sürekli entegrasyon ve sürekli dağıtım, çevik yöntemler',
        ),
      ).toEqual(['testing', 'ci', 'cd', 'agile']);
    });

    it('finds Dutch terms for testing, CI and CD', () => {
      expect(
        extractSkills(
          'Testautomatisering, unittesten, continue integratie en continue levering',
        ),
      ).toEqual(['testing', 'ci', 'cd']);
    });

    it('finds Turkish terms written in capitals, including the dotted İ', () => {
      expect(extractSkills('SÜREKLİ ENTEGRASYON VE BİRİM TESTLERİ')).toEqual([
        'ci',
        'testing',
      ]);
    });

    it('finds terms whose accented letters come from a PDF as two characters', () => {
      // "ü" as "u" + combining diaeresis, as some PDFs produce it.
      expect(extractSkills('su\u0308rekli entegrasyon')).toEqual(['ci']);
    });

    it('does not read general words like "test" or "entegrasyon" alone as skills', () => {
      expect(
        extractSkills('Bir test yapılacak. Sistem entegrasyonu ve dağıtım.'),
      ).toEqual([]);
    });
  });

  describe('no false positives', () => {
    it('does not read the "js" in "node.js" as javascript', () => {
      expect(extractSkills('Node.js')).not.toContain('javascript');
    });

    it('does not match skills inside other words', () => {
      expect(extractSkills('I have an interest in music')).not.toContain(
        'rest',
      );
    });

    it('returns each skill once', () => {
      expect(extractSkills('react React reactjs')).toEqual(['react']);
    });

    it('keeps the order skills appear in the text', () => {
      expect(extractSkills('docker then react then aws')).toEqual([
        'docker',
        'react',
        'aws',
      ]);
    });
  });
});
