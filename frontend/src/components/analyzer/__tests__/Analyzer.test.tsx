import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Analyzer from '../Analyzer';
import { analyzeResume } from '@/lib/api';
import type { AnalysisResponse } from '@/types/analysis';

vi.mock('@/lib/api', () => ({ analyzeResume: vi.fn() }));
const mockAnalyze = vi.mocked(analyzeResume);

const RESULT: AnalysisResponse = {
  score: 57,
  resumeSkills: ['react', 'nextjs', 'jest'],
  jobSkills: ['react', 'typescript', 'docker'],
  missingSkills: ['docker'],
  matches: [
    { skill: 'react', matchType: 'exact', score: 1 },
    { skill: 'typescript', matchType: 'partial', score: 0.7 },
    { skill: 'docker', matchType: 'missing', score: 0 },
  ],
  source: 'ai',
  skills: {
    react: { label: 'React', category: 'frontend' },
    nextjs: { label: 'Next.js', category: 'frontend' },
    jest: { label: 'Jest', category: 'testing' },
    typescript: { label: 'TypeScript', category: 'language' },
    docker: { label: 'Docker', category: 'devops' },
  },
};

const runButton = () => screen.getByRole('button', { name: /run analysis/i });

async function loadSamples() {
  fireEvent.click(screen.getByRole('button', { name: /sample resume/i }));
  fireEvent.click(screen.getByRole('button', { name: /sample job/i }));
  await screen.findByText('sample-resume.pdf');
}

beforeEach(() => {
  mockAnalyze.mockReset();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Analyzer', () => {
  it('shows everything on one page, with no step navigation', () => {
    render(<Analyzer />);
    expect(screen.getByText(/resume/i, { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(runButton()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('says that texts may be processed by Google Gemini', () => {
    render(<Analyzer />);
    expect(screen.getByText(/gemini/i, { selector: 'p' })).toHaveTextContent(
      /processed by google/i,
    );
  });

  it('keeps Run disabled until a resume and a job description are given', async () => {
    render(<Analyzer />);
    expect(runButton()).toBeDisabled();
    await loadSamples();
    expect(runButton()).toBeEnabled();
  });

  it('fills in the sample job description', () => {
    render(<Analyzer />);
    fireEvent.click(screen.getByRole('button', { name: /sample job/i }));
    expect(
      (screen.getByLabelText(/job description/i) as HTMLTextAreaElement).value,
    ).toMatch(/frontend developer/i);
  });

  it('shows the score, grouped skills with their names, and the source', async () => {
    mockAnalyze.mockResolvedValue(RESULT);
    render(<Analyzer />);
    await loadSamples();
    fireEvent.click(runButton());

    expect(await screen.findByText('57')).toBeInTheDocument();
    const matched = screen.getByRole('region', { name: /matched/i });
    const partial = screen.getByRole('region', { name: /partial/i });
    const missing = screen.getByRole('region', { name: /missing/i });
    expect(matched).toHaveTextContent('React');
    expect(partial).toHaveTextContent('TypeScript');
    expect(missing).toHaveTextContent('Docker');
    expect(screen.getByText(/^read by/i)).toHaveTextContent(/gemini/i);
  });

  it('says when the rule engine was used instead of the AI', async () => {
    mockAnalyze.mockResolvedValue({ ...RESULT, source: 'rules' });
    render(<Analyzer />);
    await loadSamples();
    fireEvent.click(runButton());

    expect(await screen.findByText(/^read by/i)).toHaveTextContent(
      /rule engine/i,
    );
  });

  it('shows the error message from the server', async () => {
    mockAnalyze.mockRejectedValue(new Error('Resume must be a PDF file'));
    render(<Analyzer />);
    await loadSamples();
    fireEvent.click(runButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Resume must be a PDF file',
    );
    await waitFor(() => expect(screen.getByText('ERROR')).toBeInTheDocument());
  });
});
