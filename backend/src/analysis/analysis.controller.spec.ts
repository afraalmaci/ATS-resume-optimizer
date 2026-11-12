import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { AnalysisModule } from './analysis.module';
import { LLM_CLIENT } from './ai/llm-client';
import { disabledLlmClient } from './ai/__tests__/fake-llm-client';
import { AnalysisResponse } from './dto/analysis-response.dto';
import { makePdf } from '../../test/fixtures/make-pdf';

const JOB = 'We are hiring a developer with React, Node.js and Docker.';

describe('POST /analysis', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      // No .env and a disabled AI client: tests never use a real API key.
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true }), AnalysisModule],
    })
      .overrideProvider(LLM_CLIENT)
      .useValue(disabledLlmClient())
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = () => request(app.getHttpServer()).post('/analysis');

  it('returns the analysis for a valid request', async () => {
    const res = await post()
      .attach('resume', makePdf('Skills: React, Node.js, AWS'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      })
      .field('jobDescription', JOB)
      .expect(201);

    const { matches, ...rest } = res.body as AnalysisResponse;
    expect(rest).toEqual({
      score: 67,
      resumeSkills: ['react', 'node', 'aws'],
      jobSkills: ['react', 'node', 'docker'],
      missingSkills: ['docker'],
      source: 'rules',
    });
    expect(matches).toHaveLength(3);
  });

  it('returns 400 with a message when no file is sent', async () => {
    const res = await post().field('jobDescription', JOB).expect(400);
    expect((res.body as { message: string }).message).toMatch(/resume/i);
  });

  it('returns 413 for a file over 5 MB', async () => {
    await post()
      .attach('resume', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'big.pdf',
        contentType: 'application/pdf',
      })
      .field('jobDescription', JOB)
      .expect(413);
  });
});
