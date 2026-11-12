// Must match the limits in frontend/src/schemas/formSchema.ts.
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_JOB_DESCRIPTION_CHARS = 10_000;

// Per client IP. Protects the server and the AI quota from one noisy client.
export const RATE_LIMITS = [
  { name: 'minute', ttl: 60_000, limit: 5 },
  { name: 'hour', ttl: 60 * 60_000, limit: 30 },
];
export const RATE_LIMIT_MESSAGE =
  'Too many analyses from your address. Please wait a minute and try again.';
