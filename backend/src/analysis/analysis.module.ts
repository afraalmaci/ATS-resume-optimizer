import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMIT_MESSAGE, RATE_LIMITS } from './analysis.constants';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GeminiClient } from './ai/gemini.client';
import { LLM_CLIENT } from './ai/llm-client';
import {
  AI_EXTRACTION_OPTIONS,
  AiExtractionOptions,
  DEFAULT_AI_EXTRACTION_OPTIONS,
  SkillExtractionService,
} from './ai/skill-extraction.service';

@Module({
  imports: [
    // In-memory counters per client IP; they expire with each window.
    ThrottlerModule.forRoot({
      throttlers: RATE_LIMITS,
      errorMessage: RATE_LIMIT_MESSAGE,
    }),
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    SkillExtractionService,
    { provide: LLM_CLIENT, useClass: GeminiClient },
    {
      provide: AI_EXTRACTION_OPTIONS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AiExtractionOptions => ({
        ...DEFAULT_AI_EXTRACTION_OPTIONS,
        dailyLimit: readLimit(
          config.get<string>('AI_DAILY_LIMIT'),
          DEFAULT_AI_EXTRACTION_OPTIONS.dailyLimit,
        ),
      }),
    },
  ],
})
export class AnalysisModule {}

// A whole number >= 0, or the default when unset or invalid.
function readLimit(value: string | undefined, fallback: number): number {
  const trimmed = value?.trim() ?? '';
  return /^\d+$/.test(trimmed) ? Number(trimmed) : fallback;
}
