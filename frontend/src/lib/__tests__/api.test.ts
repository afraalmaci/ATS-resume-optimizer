import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyzeResume } from '../api';

const file = new File(['%PDF-1.4'], 'resume.pdf', { type: 'application/pdf' });

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('analyzeResume', () => {
  it('posts the resume and job description and returns the result', async () => {
    const result = {
      score: 50,
      resumeSkills: ['react'],
      jobSkills: ['react', 'docker'],
      missingSkills: ['docker'],
      matches: [],
    };
    const fetchMock = mockFetch(201, result);

    await expect(analyzeResume(file, 'React and Docker')).resolves.toEqual(result);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/analysis$/);
    const body = init.body as FormData;
    expect(body.get('resume')).toBeInstanceOf(File);
    expect(body.get('jobDescription')).toBe('React and Docker');
  });

  it('throws the message the server sent on an error', async () => {
    mockFetch(400, { statusCode: 400, message: 'Resume must be a PDF file' });
    await expect(analyzeResume(file, 'React')).rejects.toThrow(
      'Resume must be a PDF file',
    );
  });

  it('throws a generic message when the server sends none', async () => {
    mockFetch(500, {});
    await expect(analyzeResume(file, 'React')).rejects.toThrow(
      'Analysis failed (500)',
    );
  });
});
