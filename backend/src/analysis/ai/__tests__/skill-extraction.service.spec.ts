import {
  DEFAULT_AI_EXTRACTION_OPTIONS,
  SkillExtractionService,
} from '../skill-extraction.service';
import { FakeLlmClient } from './fake-llm-client';

const RESUME =
  'Jane Doe, jane@example.com, +31 6 1234 5678. Skills: React, Node.js';
const JOB = 'We need React, Docker and birim test experience.';

describe('SkillExtractionService', () => {
  it('uses the rule engine when no AI client is configured', async () => {
    const llm = new FakeLlmClient(false);
    const result = await new SkillExtractionService(llm).extract(RESUME, JOB);

    expect(result).toEqual({
      resumeSkills: ['react', 'node'],
      jobSkills: ['react', 'docker'],
      source: 'rules',
    });
    expect(llm.requests).toHaveLength(0);
  });

  it('uses the AI result when it is valid', async () => {
    const llm = new FakeLlmClient(true, () => ({
      resumeSkills: ['react', 'node'],
      jobSkills: ['react', 'docker', 'testing'],
    }));
    const result = await new SkillExtractionService(llm).extract(RESUME, JOB);

    expect(result).toEqual({
      resumeSkills: ['react', 'node'],
      jobSkills: ['react', 'docker', 'testing'],
      source: 'ai',
    });
  });

  it('adds skills the rule engine found and the AI missed', async () => {
    // The AI missed Node.js (resume) and Docker (job); the rules find both.
    const llm = new FakeLlmClient(true, () => ({
      resumeSkills: ['react'],
      jobSkills: ['react', 'testing'],
    }));
    const result = await new SkillExtractionService(llm).extract(RESUME, JOB);

    expect(result).toEqual({
      resumeSkills: ['react', 'node'],
      jobSkills: ['react', 'testing', 'docker'],
      source: 'ai',
    });
  });

  it('can return the AI result alone, for measuring it', async () => {
    const llm = new FakeLlmClient(true, () => ({
      resumeSkills: ['react'],
      jobSkills: ['react', 'testing'],
    }));
    await expect(
      new SkillExtractionService(llm).extractWithAiOnly(RESUME, JOB),
    ).resolves.toEqual({
      resumeSkills: ['react'],
      jobSkills: ['react', 'testing'],
    });
  });

  it('sends both texts in one request, without contact details', async () => {
    const llm = new FakeLlmClient(true, () => ({
      resumeSkills: [],
      jobSkills: [],
    }));
    await new SkillExtractionService(llm).extract(RESUME, JOB);

    expect(llm.requests).toHaveLength(1);
    const { user } = llm.requests[0];
    expect(user).toContain('Skills: React, Node.js');
    expect(user).toContain('birim test');
    expect(user).not.toContain('jane@example.com');
    expect(user).not.toContain('1234 5678');
  });

  it('removes duplicate skills from the AI result', async () => {
    const llm = new FakeLlmClient(true, () => ({
      resumeSkills: ['react', 'react'],
      jobSkills: ['docker'],
    }));
    const result = await new SkillExtractionService(llm).extract(RESUME, JOB);
    // React once; Node.js comes from the rule engine.
    expect(result.resumeSkills).toEqual(['react', 'node']);
  });

  describe('falls back to the rule engine', () => {
    const fallback = {
      resumeSkills: ['react', 'node'],
      jobSkills: ['react', 'docker'],
      source: 'rules',
    };

    it('when the AI call fails (quota, network, timeout)', async () => {
      const llm = new FakeLlmClient(true, () => {
        throw new Error('429 quota exceeded');
      });
      await expect(
        new SkillExtractionService(llm).extract(RESUME, JOB),
      ).resolves.toEqual(fallback);
    });

    it('when the AI returns a skill that is not in the skill list', async () => {
      const llm = new FakeLlmClient(true, () => ({
        resumeSkills: ['react', 'cobol'],
        jobSkills: ['docker'],
      }));
      await expect(
        new SkillExtractionService(llm).extract(RESUME, JOB),
      ).resolves.toEqual(fallback);
    });

    it('when the AI returns the wrong shape', async () => {
      const llm = new FakeLlmClient(true, () => ({ skills: ['react'] }));
      await expect(
        new SkillExtractionService(llm).extract(RESUME, JOB),
      ).resolves.toEqual(fallback);
    });

    it('when the resume is too long to send', async () => {
      const llm = new FakeLlmClient(true, () => ({
        resumeSkills: ['react'],
        jobSkills: ['react'],
      }));
      const longResume = `${RESUME} ${'x'.repeat(30_001)}`;
      const result = await new SkillExtractionService(llm).extract(
        longResume,
        JOB,
      );
      expect(result.source).toBe('rules');
      expect(llm.requests).toHaveLength(0);
    });
  });

  describe('protecting the free quota', () => {
    const aiResult = () => ({ resumeSkills: ['react'], jobSkills: ['react'] });

    it('reuses the AI result for the same texts instead of calling again', async () => {
      const llm = new FakeLlmClient(true, aiResult);
      const service = new SkillExtractionService(llm);

      const first = await service.extract(RESUME, JOB);
      const second = await service.extract(RESUME, JOB);

      expect(second).toEqual(first);
      expect(second.source).toBe('ai');
      expect(llm.requests).toHaveLength(1);
    });

    it('calls the AI again for different texts', async () => {
      const llm = new FakeLlmClient(true, aiResult);
      const service = new SkillExtractionService(llm);

      await service.extract(RESUME, JOB);
      await service.extract(RESUME, `${JOB} Also Kubernetes.`);

      expect(llm.requests).toHaveLength(2);
    });

    it('does not cache a failed AI call', async () => {
      let fail = true;
      const llm = new FakeLlmClient(true, () => {
        if (fail) throw new Error('timeout');
        return aiResult();
      });
      const service = new SkillExtractionService(llm);

      expect((await service.extract(RESUME, JOB)).source).toBe('rules');
      fail = false;
      expect((await service.extract(RESUME, JOB)).source).toBe('ai');
    });

    it('uses the rule engine once the daily AI limit is reached', async () => {
      const llm = new FakeLlmClient(true, aiResult);
      const service = new SkillExtractionService(llm, {
        ...DEFAULT_AI_EXTRACTION_OPTIONS,
        dailyLimit: 1,
      });

      expect((await service.extract(RESUME, JOB)).source).toBe('ai');
      // Cached: does not count against the limit.
      expect((await service.extract(RESUME, JOB)).source).toBe('ai');
      // New texts, limit used up: rules, without calling the AI.
      expect((await service.extract(RESUME, `${JOB} Go.`)).source).toBe(
        'rules',
      );
      expect(llm.requests).toHaveLength(1);
    });
  });
});
