/**
 * Compares skill extraction by the rule engine, by Gemini alone, and by both
 * combined (what the app uses) on the text fixtures, against the skills a
 * person would name (test/fixtures/texts/expected.ts).
 *
 *   npm run eval:extraction
 *
 * Makes one real Gemini call per job ad (5 in total, free tier). Needs
 * GEMINI_API_KEY in .env. Prints only skill ids and numbers: never the texts
 * or the key.
 */
import { ConfigService } from '@nestjs/config';
import { GeminiClient } from '../../src/analysis/ai/gemini.client';
import { SkillExtractionService } from '../../src/analysis/ai/skill-extraction.service';
import { extractSkills } from '../../src/analysis/engine/skill-extractor';
import {
  TEXT_FIXTURES,
  TextFixture,
  readFixture,
} from '../fixtures/texts/expected';

interface Score {
  precision: number;
  recall: number;
  missed: string[];
  extra: string[];
}

function score(found: string[], expected: string[]): Score {
  const hits = found.filter((s) => expected.includes(s));
  return {
    precision: found.length ? hits.length / found.length : 1,
    recall: expected.length ? hits.length / expected.length : 1,
    missed: expected.filter((s) => !found.includes(s)),
    extra: found.filter((s) => !expected.includes(s)),
  };
}

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pct = (n: number) => `${Math.round(n * 100)}%`.padStart(5);
const pair = (s: Score | null) =>
  s ? `${pct(s.precision)} ${pct(s.recall)}` : ' fail  fail';
const list = (ids: string[]) => (ids.length ? ids.join(', ') : '-');

interface Row {
  name: string;
  rules: Score;
  ai: Score | null;
  both: Score;
  ms: number;
}

async function main() {
  const config = new ConfigService();
  if (!config.get<string>('GEMINI_API_KEY')) {
    console.error(
      'GEMINI_API_KEY is not set in backend/.env; nothing to compare.',
    );
    process.exit(1);
  }

  // A fresh service: no cache from earlier runs, and a small call budget.
  const service = new SkillExtractionService(new GeminiClient(config), {
    dailyLimit: 10,
    cacheSize: 0,
    cacheTtlMs: 0,
  });

  const resume = TEXT_FIXTURES.find((f) => f.kind === 'resume') as TextFixture;
  const resumeText = readFixture(resume.file);
  const resumeByRules = extractSkills(resumeText);
  const jobs = TEXT_FIXTURES.filter((f) => f.kind === 'job');
  console.log(
    `Model: ${config.get<string>('GEMINI_MODEL') || 'gemini-flash-lite-latest (default)'}`,
  );
  console.log(
    `Gemini calls: ${jobs.length} (one per job ad, resume sent along)\n`,
  );

  const rows: Row[] = [];
  const resumeRows: { ai: Score; both: Score }[] = [];

  for (const job of jobs) {
    const jobText = readFixture(job.file);
    const jobByRules = extractSkills(jobText);

    const started = Date.now();
    const ai = await service.extractWithAiOnly(resumeText, jobText);
    const ms = Date.now() - started;

    rows.push({
      name: job.file,
      rules: score(jobByRules, job.expected),
      ai: ai ? score(ai.jobSkills, job.expected) : null,
      both: score(
        ai ? union(ai.jobSkills, jobByRules) : jobByRules,
        job.expected,
      ),
      ms,
    });
    if (ai) {
      resumeRows.push({
        ai: score(ai.resumeSkills, resume.expected),
        both: score(union(ai.resumeSkills, resumeByRules), resume.expected),
      });
    }
  }

  console.log(
    `${''.padEnd(28)} ${'Rules'.padEnd(11)} ${'AI only'.padEnd(11)} ${'Combined'.padEnd(11)}`,
  );
  console.log(
    `${'Text'.padEnd(28)} ${'P'.padStart(5)} ${'R'.padStart(5)} ${'P'.padStart(5)} ${'R'.padStart(5)} ${'P'.padStart(5)} ${'R'.padStart(5)}  AI ms`,
  );
  for (const r of rows) {
    console.log(
      `${r.name.padEnd(28)} ${pair(r.rules)} ${pair(r.ai)} ${pair(r.both)} ${String(r.ms).padStart(6)}`,
    );
  }

  const resumeRules = score(resumeByRules, resume.expected);
  const resumeAvg = (key: 'ai' | 'both'): Score | null =>
    resumeRows.length
      ? {
          precision: avg(resumeRows.map((r) => r[key].precision)),
          recall: avg(resumeRows.map((r) => r[key].recall)),
          missed: [],
          extra: [],
        }
      : null;
  console.log(
    `${resume.file.padEnd(28)} ${pair(resumeRules)} ${pair(resumeAvg('ai'))} ${pair(resumeAvg('both'))}  (AI: average of ${resumeRows.length} runs)`,
  );

  const totals = (key: 'rules' | 'ai' | 'both') => {
    const scored = rows.map((r) => r[key]).filter((s): s is Score => !!s);
    return scored.length
      ? `${pct(avg(scored.map((s) => s.precision)))} ${pct(avg(scored.map((s) => s.recall)))}`
      : ' fail  fail';
  };
  console.log(
    `${'Job ads, average'.padEnd(28)} ${totals('rules')} ${totals('ai')} ${totals('both')}`,
  );

  console.log('\nDifferences from the expected skills (combined):');
  for (const r of rows) {
    if (!r.ai) {
      console.log(
        `  ${r.name}: AI call failed, rule engine only (see warning above)`,
      );
    } else if (r.both.missed.length || r.both.extra.length) {
      console.log(
        `  ${r.name}: missed [${list(r.both.missed)}]  extra [${list(r.both.extra)}]`,
      );
    }
  }
  console.log(
    '\nP = precision (found skills that are right), R = recall (right skills that were found).',
  );
}

main().catch((err: unknown) => {
  // Only the error type: messages could echo request content.
  console.error(
    `Eval failed: ${err instanceof Error ? err.name : 'unknown error'}`,
  );
  process.exit(1);
});
