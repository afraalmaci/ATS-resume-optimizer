export interface LlmJsonRequest {
  /** Instructions for the model. */
  system: string;
  /** The data to work on. */
  user: string;
  /** JSON Schema the response must follow. */
  jsonSchema: Record<string, unknown>;
}

/**
 * A language model that returns JSON. Vendor-specific clients implement this,
 * so the provider can be swapped and tests can use a fake.
 */
export interface LlmClient {
  /** False when no API key is set; callers then use the rule engine. */
  readonly isConfigured: boolean;
  /** Returns the parsed JSON response. Throws on any failure. */
  generateJson(req: LlmJsonRequest): Promise<unknown>;
}

export const LLM_CLIENT = Symbol('LLM_CLIENT');
