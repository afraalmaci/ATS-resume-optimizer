import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GeminiClient } from './ai/gemini.client';
import { LLM_CLIENT } from './ai/llm-client';
import { SkillExtractionService } from './ai/skill-extraction.service';

@Module({
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    SkillExtractionService,
    { provide: LLM_CLIENT, useClass: GeminiClient },
  ],
})
export class AnalysisModule {}
