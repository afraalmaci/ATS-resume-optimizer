import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { GeminiClient } from '../gemini.client';

// The real SDK is replaced, so these tests never call Google and need no key.
jest.mock('@google/genai', () => ({ GoogleGenAI: jest.fn() }));

const generateContent = jest.fn();
const MockGoogleGenAI = GoogleGenAI as unknown as jest.Mock;

const config = (values: Record<string, string>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

const request = {
  system: 'system prompt',
  user: 'user text',
  jsonSchema: { type: 'object' },
};

beforeEach(() => {
  generateContent.mockReset();
  MockGoogleGenAI.mockReset();
  MockGoogleGenAI.mockImplementation(() => ({ models: { generateContent } }));
});

describe('GeminiClient', () => {
  it('is not configured without an API key, and never creates a client', () => {
    const client = new GeminiClient(config({}));
    expect(client.isConfigured).toBe(false);
    expect(MockGoogleGenAI).not.toHaveBeenCalled();
  });

  it('refuses to call the API without an API key', async () => {
    const client = new GeminiClient(config({}));
    await expect(client.generateJson(request)).rejects.toThrow(
      /not configured/,
    );
  });

  it('sends a JSON-schema request with no retries and a timeout', async () => {
    generateContent.mockResolvedValue({ text: '{"ok":true}' });
    const client = new GeminiClient(
      config({ GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'some-model' }),
    );

    await expect(client.generateJson(request)).resolves.toEqual({ ok: true });

    expect(MockGoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(generateContent).toHaveBeenCalledWith({
      model: 'some-model',
      contents: 'user text',
      config: expect.objectContaining({
        systemInstruction: 'system prompt',
        responseMimeType: 'application/json',
        responseJsonSchema: { type: 'object' },
        httpOptions: { timeout: 15_000, retryOptions: { attempts: 1 } },
      }) as unknown,
    });
  });

  it('reads the model and timeout from config, with safe defaults', async () => {
    generateContent.mockResolvedValue({ text: '{}' });
    await new GeminiClient(
      config({ GEMINI_API_KEY: 'k', LLM_TIMEOUT_MS: '8000' }),
    ).generateJson(request);

    const call = generateContent.mock.calls[0] as [
      { model: string; config: { httpOptions: { timeout: number } } },
    ];
    expect(call[0].model).toBe('gemini-flash-latest');
    expect(call[0].config.httpOptions.timeout).toBe(8000);
  });

  it('rejects an empty or non-JSON response', async () => {
    const client = new GeminiClient(config({ GEMINI_API_KEY: 'k' }));
    generateContent.mockResolvedValueOnce({ text: undefined });
    await expect(client.generateJson(request)).rejects.toThrow();
    generateContent.mockResolvedValueOnce({ text: 'not json' });
    await expect(client.generateJson(request)).rejects.toThrow();
  });
});
