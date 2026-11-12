import { AiDailyBudget } from '../ai-daily-budget';

const day = (iso: string) => () => new Date(iso).getTime();

describe('AiDailyBudget', () => {
  it('allows calls up to the daily limit', () => {
    const budget = new AiDailyBudget(2, day('2026-11-12T10:00:00Z'));
    expect(budget.tryConsume()).toBe(true);
    expect(budget.tryConsume()).toBe(true);
    expect(budget.tryConsume()).toBe(false);
  });

  it('starts again on the next day (UTC)', () => {
    let now = day('2026-11-12T23:59:00Z');
    const budget = new AiDailyBudget(1, () => now());
    expect(budget.tryConsume()).toBe(true);
    expect(budget.tryConsume()).toBe(false);

    now = day('2026-11-13T00:01:00Z');
    expect(budget.tryConsume()).toBe(true);
  });

  it('allows nothing with a limit of 0', () => {
    expect(new AiDailyBudget(0).tryConsume()).toBe(false);
  });
});
