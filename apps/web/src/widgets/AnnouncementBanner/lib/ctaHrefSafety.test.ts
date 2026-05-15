import { describe, it, expect } from 'vitest';
import { isSafeCtaHref } from './ctaHrefSafety';

describe('isSafeCtaHref', () => {
  it('accepts https URL', () =>
    expect(isSafeCtaHref('https://example.com')).toBe(true));
  it('accepts http URL', () =>
    expect(isSafeCtaHref('http://example.com')).toBe(true));
  it('accepts root-relative path', () =>
    expect(isSafeCtaHref('/games/123')).toBe(true));
  it('rejects undefined', () => expect(isSafeCtaHref(undefined)).toBe(false));
  it('rejects null', () => expect(isSafeCtaHref(null)).toBe(false));
  it('rejects empty string', () => expect(isSafeCtaHref('')).toBe(false));
  it('rejects javascript:', () =>
    expect(isSafeCtaHref('javascript:alert(1)')).toBe(false));
  it('rejects JavaScript: case-insensitive', () =>
    expect(isSafeCtaHref('JavaScript:alert(1)')).toBe(false));
  it('rejects data:', () =>
    expect(isSafeCtaHref('data:text/html,<script>')).toBe(false));
  it('rejects relative without leading slash', () =>
    expect(isSafeCtaHref('games/123')).toBe(false));
});
