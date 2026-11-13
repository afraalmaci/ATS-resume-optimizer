import { createHash } from 'node:crypto';
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { z } from 'zod';
import { extractSkills } from '../engine/skill-extractor';
import { SKILLS } from '../engine/skills';
import { AiDailyBudget } from './ai-daily-budget';
import { LLM_CLIENT, LlmClient } from './llm-client';
import { redactContactDetails } from './redact';
import {
  SKILL_EXTRACTION_JSON_SCHEMA,
  SKILL_EXTRACTION_PROMPT_VERSION,
  SKILL_EXTRACTION_SYSTEM_PROMPT,
  buildSkillExtractionInput,
} from './skill-extraction.prompt';
import { TtlCache } from './ttl-cache';

/** Where the skills came from. */
export type SkillSource = 'ai' | 'rules';

export interface ExtractedSkills {
  resumeSkills: string[];
  jobSkills: string[];
  source: SkillSource;
}

export interface AiExtractionOptions {
  /** Max AI calls per UTC day for the whole server. */
  dailyLimit: number;
  /** How many AI results to remember. */
  cacheSize: number;
  /** How long an AI result is remembered. */
  cacheTtlMs: number;
}

export const DEFAULT_AI_EXTRACTION_OPTIONS: AiExtractionOptions = {
  dailyLimit: 200,
  cacheSize: 200,
  cacheTtlMs: 24 * 60 * 60 * 1000,
};

export const AI_EXTRACTION_OPTIONS = Symbol('AI_EXTRACTION_OPTIONS');

// Longer resumes go to the rule engine instead of using up the free quota.
const MAX_AI_RESUME_CHARS = 30_000;

const skillIds = z.array(z.enum(SKILLS as [string, ...string[]]));
const aiResponseSchema = z.object({
  resumeSkills: skillIds,
  jobSkills: skillIds,
});

export type AiSkills = Omit<ExtractedSkills, 'source'>;

/**
 * Extracts skills with the AI model plus the rule engine when the AI is
 * configured, and with the rule engine alone otherwise, when the daily AI
 * limit is used up, or whenever the AI call fails or returns invalid output.
 *
 * Why both: in our eval the AI found skills written in Turkish or Dutch that
 * the rules miss, but now and then skipped a plainly named one ("SQL",
 * "GitHub Actions") that the rules never miss.
 */
@Injectable()
export class SkillExtractionService {
  private readonly logger = new Logger(SkillExtractionService.name);
  // Keyed by a SHA-256 hash of the texts: only skill ids are kept, no text.
  private readonly cache: TtlCache<AiSkills>;
  private readonly budget: AiDailyBudget;

  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
    @Optional()
    @Inject(AI_EXTRACTION_OPTIONS)
    options: AiExtractionOptions = DEFAULT_AI_EXTRACTION_OPTIONS,
  ) {
    this.cache = new TtlCache(options.cacheSize, options.cacheTtlMs);
    this.budget = new AiDailyBudget(options.dailyLimit);
  }

  async extract(resumeText: string, jobText: string): Promise<ExtractedSkills> {
    const rules = {
      resumeSkills: extractSkills(resumeText),
      jobSkills: extractSkills(jobText),
    };
    const ai = await this.extractWithAiOnly(resumeText, jobText);
    if (!ai) {
      return { ...rules, source: 'rules' };
    }
    return {
      resumeSkills: union(ai.resumeSkills, rules.resumeSkills),
      jobSkills: union(ai.jobSkills, rules.jobSkills),
      source: 'ai',
    };
  }

  /**
   * The AI result alone (used by extract, and by the eval to measure the
   * model), or null when the rule engine should be used instead.
   */
  async extractWithAiOnly(
    resumeText: string,
    jobText: string,
  ): Promise<AiSkills | null> {
    if (!this.llm.isConfigured) return null;
    if (resumeText.length > MAX_AI_RESUME_CHARS) {
      this.logger.warn('Resume too long for AI extraction; using rules');
      return null;
    }

    const resume = redactContactDetails(resumeText);
    const key = cacheKey(resume, jobText);
    const cached = this.cache.get(key);
    if (cached) return copy(cached);

    if (!this.budget.tryConsume()) {
      this.logger.warn('Daily AI limit reached; using rules');
      return null;
    }

    try {
      const result = await this.callAi(resume, jobText);
      this.cache.set(key, result);
      return copy(result);
    } catch (err) {
      // Log only the kind of failure: never the texts or the API key.
      this.logger.warn(
        `AI extraction failed (${describeError(err)}); using rules`,
      );
      return null;
    }
  }

  private async callAi(resume: string, jobText: string): Promise<AiSkills> {
    const raw = await this.llm.generateJson({
      system: SKILL_EXTRACTION_SYSTEM_PROMPT,
      user: buildSkillExtractionInput(resume, jobText),
      jsonSchema: SKILL_EXTRACTION_JSON_SCHEMA,
    });

    const parsed = aiResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new InvalidAiResponseError();
    }

    return {
      resumeSkills: [...new Set(parsed.data.resumeSkills)],
      jobSkills: [...new Set(parsed.data.jobSkills)],
    };
  }
}

// AI order first, then what only the rules found.
function union(first: string[], second: string[]): string[] {
  return [...new Set([...first, ...second])];
}

function cacheKey(resume: string, jobText: string): string {
  return createHash('sha256')
    .update(SKILL_EXTRACTION_PROMPT_VERSION)
    .update('\0')
    .update(resume)
    .update('\0')
    .update(jobText)
    .digest('hex');
}

// Callers get their own arrays, so they cannot change the cached ones.
function copy(skills: AiSkills): AiSkills {
  return {
    resumeSkills: [...skills.resumeSkills],
    jobSkills: [...skills.jobSkills],
  };
}

class InvalidAiResponseError extends Error {
  name = 'InvalidAiResponseError';
  constructor() {
    super(
      `AI response did not match the schema (prompt ${SKILL_EXTRACTION_PROMPT_VERSION})`,
    );
  }
}

// Only the error type and HTTP status: messages can echo request or response
// content, which must not end up in logs.
function describeError(err: unknown): string {
  if (!(err instanceof Error)) return 'unknown error';
  const status = (err as { status?: unknown }).status;
  return typeof status === 'number' ? `${err.name} ${status}` : err.name;
}
