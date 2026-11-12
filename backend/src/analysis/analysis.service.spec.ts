import {
  BadRequestException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { makePdf, makeUpload } from '../../test/fixtures/make-pdf';
import { SkillExtractionService } from './ai/skill-extraction.service';
import {
  FakeLlmClient,
  disabledLlmClient,
} from './ai/__tests__/fake-llm-client';

const JOB = 'We are hiring a developer with React, Node.js and Docker.';

describe('AnalysisService', () => {
  const service = new AnalysisService(
    new SkillExtractionService(disabledLlmClient()),
  );
  const resume = () => makeUpload(makePdf('Skills: React, Node.js, AWS'));

  it('analyzes a PDF resume against a job description', async () => {
    const result = await service.analyze(resume(), JOB);

    expect(result.resumeSkills).toEqual(['react', 'node', 'aws']);
    expect(result.jobSkills).toEqual(['react', 'node', 'docker']);
    expect(result.missingSkills).toEqual(['docker']);
    expect(result.score).toBe(67);
    expect(result.matches).toHaveLength(3);
    expect(result.source).toBe('rules');
  });

  it('scores the skills the AI found when the AI is configured', async () => {
    const llm = new FakeLlmClient(true, () => ({
      resumeSkills: ['react', 'testing'],
      jobSkills: ['react', 'testing'],
    }));
    const aiService = new AnalysisService(new SkillExtractionService(llm));

    const result = await aiService.analyze(resume(), JOB);

    expect(result.source).toBe('ai');
    expect(result.score).toBe(100);
  });

  describe('resume file', () => {
    it('rejects a missing file', async () => {
      await expect(service.analyze(undefined, JOB)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a file that is not sent as a PDF', async () => {
      const file = makeUpload(makePdf('React'), 'image/png');
      await expect(service.analyze(file, JOB)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a file labelled PDF whose content is not a PDF', async () => {
      const file = makeUpload(Buffer.from('just some text'));
      await expect(service.analyze(file, JOB)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a file larger than 5 MB', async () => {
      const file = makeUpload(makePdf('React'));
      file.size = 5 * 1024 * 1024 + 1;
      await expect(service.analyze(file, JOB)).rejects.toThrow(
        PayloadTooLargeException,
      );
    });

    it('rejects a damaged PDF', async () => {
      const file = makeUpload(Buffer.from('%PDF-1.4\nbroken'));
      await expect(service.analyze(file, JOB)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a PDF with no readable text', async () => {
      const file = makeUpload(makePdf(''));
      await expect(service.analyze(file, JOB)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('job description', () => {
    it.each([undefined, '', '   '])('rejects %p', async (jd) => {
      await expect(service.analyze(resume(), jd)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects more than 10,000 characters', async () => {
      await expect(
        service.analyze(resume(), 'a'.repeat(10_001)),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
