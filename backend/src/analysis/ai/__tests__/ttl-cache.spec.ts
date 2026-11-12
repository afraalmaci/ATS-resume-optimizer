import { TtlCache } from '../ttl-cache';

describe('TtlCache', () => {
  it('returns a stored value', () => {
    const cache = new TtlCache<number>(10, 1000);
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('forgets values after the time to live', () => {
    let now = 0;
    const cache = new TtlCache<number>(10, 1000, () => now);
    cache.set('a', 1);
    now = 999;
    expect(cache.get('a')).toBe(1);
    now = 1000;
    expect(cache.get('a')).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('drops the least recently used entry when full', () => {
    const cache = new TtlCache<number>(2, 1000);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a'); // "a" is now more recently used than "b"
    cache.set('c', 3);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
    expect(cache.size).toBe(2);
  });
});
