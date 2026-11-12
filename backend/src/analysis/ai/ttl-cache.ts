/**
 * Small in-memory cache: entries expire after a time to live, and the least
 * recently used one is dropped when the cache is full.
 */
export class TtlCache<T> {
  // A Map keeps insertion order, so the first key is the least recently used.
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly maxEntries: number,
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  get size(): number {
    return this.entries.size;
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    this.entries.delete(key);
    if (this.now() >= entry.expiresAt) return undefined;

    this.entries.set(key, entry); // mark as most recently used
    return entry.value;
  }

  set(key: string, value: T): void {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });

    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value as string;
      this.entries.delete(oldest);
    }
  }
}
