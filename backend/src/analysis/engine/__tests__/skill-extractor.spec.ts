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
