import { LlmClient, LlmJsonRequest } from '../llm-client';

/**
 * Test double for LlmClient. Never calls a real API, so tests use no API key
 * and no quota.
 */
export class FakeLlmClient implements LlmClient {
  readonly requests: LlmJsonRequest[] = [];

  constructor(
    readonly isConfigured: boolean,
    private readonly respond: (req: LlmJsonRequest) => unknown = () => {
      throw new Error('FakeLlmClient: no response configured');
    },
  ) {}

  generateJson(req: LlmJsonRequest): Promise<unknown> {
    this.requests.push(req);
    try {
      return Promise.resolve(this.respond(req));
    } catch (err) {
      return Promise.reject(err as Error);
    }
  }
}

/** A client with no API key configured: the rule engine is always used. */
export const disabledLlmClient = () => new FakeLlmClient(false);
