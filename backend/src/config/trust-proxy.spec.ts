import { parseTrustProxy } from './trust-proxy';

describe('parseTrustProxy', () => {
  it('is off when unset or empty', () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy('')).toBe(false);
  });

  it('accepts a number of proxy hops', () => {
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy(' 2 ')).toBe(2);
  });

  it('refuses "true", which would let clients fake their IP', () => {
    expect(parseTrustProxy('true')).toBe(false);
  });

  it('refuses anything else that is not a positive whole number', () => {
    for (const value of ['0', '-1', '1.5', 'yes', 'loopback']) {
      expect(parseTrustProxy(value)).toBe(false);
    }
  });
});
