import { Inject, Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { extractSkills } from '../engine/skill-extractor';
import { SKILLS } from '../engine/skills';
import { LLM_CLIENT, LlmClient } from './llm-client';
import { redactContactDetails } from './redact';
import {
  SKILL_EXTRACTION_JSON_SCHEMA,
  SKILL_EXTRACTION_PROMPT_VERSION,
  SKILL_EXTRACTION_SYSTEM_PROMPT,
  buildSkillExtractionInput,
} from './skill-extraction.prompt';

/** Where the skills came from. */
export type SkillSource = 'ai' | 'rules';

export interface ExtractedSkills {
  resumeSkills: string[];
  jobSkills: string[];
  source: SkillSource;
}

// Longer resumes go to the rule engine instead of using up the free quota.
const MAX_AI_RESUME_CHARS = 30_000;

const skillIds = z.array(z.enum(SKILLS as [string, ...string[]]));
const aiResponseSchema = z.object({
  resumeSkills: skillIds,
  jobSkills: skillIds,
});

/**
 * Extracts skills with the AI model when it is configured, and with the rule
 * engine otherwise or whenever the AI call fails or returns invalid output.
 */
@Injectable()
export class SkillExtractionService {
  private readonly logger = new Logger(SkillExtractionService.name);

  constructor(@Inject(LLM_CLIENT) private readonly llm: LlmClient) {}

  async extract(resumeText: string, jobText: string): Promise<ExtractedSkills> {
    if (this.llm.isConfigured) {
      if (resumeText.length > MAX_AI_RESUME_CHARS) {
        this.logger.warn('Resume too long for AI extraction; using rules');
      } else {
        try {
          return await this.extractWithAi(resumeText, jobText);
        } catch (err) {
          // Log only the kind of failure: never the texts or the API key.
          this.logger.warn(
            `AI extraction failed (${describeError(err)}); using rules`,
          );
        }
      }
    }

    return {
      resumeSkills: extractSkills(resumeText),
      jobSkills: extractSkills(jobText),
      source: 'rules',
    };
  }

  private async extractWithAi(
    resumeText: string,
    jobText: string,
  ): Promise<ExtractedSkills> {
    const raw = await this.llm.generateJson({
      system: SKILL_EXTRACTION_SYSTEM_PROMPT,
      user: buildSkillExtractionInput(
        redactContactDetails(resumeText),
        jobText,
      ),
      jsonSchema: SKILL_EXTRACTION_JSON_SCHEMA,
    });

    const parsed = aiResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new InvalidAiResponseError();
    }

    return {
      resumeSkills: [...new Set(parsed.data.resumeSkills)],
      jobSkills: [...new Set(parsed.data.jobSkills)],
      source: 'ai',
    };
  }
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
