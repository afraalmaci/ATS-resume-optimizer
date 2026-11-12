import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LlmClient, LlmJsonRequest } from './llm-client';

// An alias that follows Google's current Flash model, so a retired model
// version does not break the app. Override with GEMINI_MODEL.
const DEFAULT_MODEL = 'gemini-flash-latest';
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Google Gemini client. Meant for the free tier: no retries (a failed or
 * rate-limited call falls back to the rule engine instead of spending more
 * quota) and a timeout below typical hosting request limits.
 */
@Injectable()
export class GeminiClient implements LlmClient {
  private readonly ai?: GoogleGenAI;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    // The key is only read from server-side config and never logged.
    const apiKey = config.get<string>('GEMINI_API_KEY');
    this.model = config.get<string>('GEMINI_MODEL') || DEFAULT_MODEL;
    this.timeoutMs =
      Number(config.get<string>('LLM_TIMEOUT_MS')) || DEFAULT_TIMEOUT_MS;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  get isConfigured(): boolean {
    return this.ai !== undefined;
  }

  async generateJson(req: LlmJsonRequest): Promise<unknown> {
    if (!this.ai) {
      throw new Error('Gemini is not configured');
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: req.user,
      config: {
        systemInstruction: req.system,
        responseMimeType: 'application/json',
        responseJsonSchema: req.jsonSchema,
        httpOptions: {
          timeout: this.timeoutMs,
          retryOptions: { attempts: 1 },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty response');
    }
    return JSON.parse(text) as unknown;
  }
}
