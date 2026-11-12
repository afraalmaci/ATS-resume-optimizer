/**
 * Caps how many AI calls the whole server makes per UTC day, so the free
 * quota is never exhausted, however many different addresses send requests.
 * In memory: resets on restart, which only makes it more generous.
 */
export class AiDailyBudget {
  private day = '';
  private used = 0;

  constructor(
    private readonly limit: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Counts one call and returns true, or returns false when none are left. */
  tryConsume(): boolean {
    const today = new Date(this.now()).toISOString().slice(0, 10);
    if (today !== this.day) {
      this.day = today;
      this.used = 0;
    }
    if (this.used >= this.limit) {
      return false;
    }
    this.used++;
    return true;
  }
}
