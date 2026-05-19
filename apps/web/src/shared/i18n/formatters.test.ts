import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelative,
} from './formatters';

const D = new Date('2026-05-19T14:30:00Z');

describe('formatNumber', () => {
  it('groups digits per locale', () => {
    expect(formatNumber(12345, 'en')).toBe('12,345');
    expect(formatNumber(12345, 'fr')).toMatch(/12.345/);
    expect(formatNumber(12345, 'ru')).toMatch(/12.345/);
  });
});

describe('formatCurrency', () => {
  it('formats USD per locale', () => {
    expect(formatCurrency(9.99, 'en', 'USD')).toBe('$9.99');
    expect(formatCurrency(9.99, 'fr', 'USD')).toMatch(/9,99/);
  });
});

describe('formatDate', () => {
  it('formats per locale with default medium style', () => {
    const en = formatDate(D, 'en');
    const fr = formatDate(D, 'fr');
    expect(en).toMatch(/2026/);
    expect(fr).toMatch(/2026/);
    expect(en).not.toEqual(fr);
  });

  it('returns fallback for invalid input', () => {
    expect(formatDate('not-a-date', 'en', undefined, '-')).toBe('-');
    expect(formatDate(null, 'en', undefined, '-')).toBe('-');
    expect(formatDate(undefined, 'en', undefined, '-')).toBe('-');
  });
});

describe('formatTime', () => {
  it('formats time per locale', () => {
    expect(formatTime(D, 'en')).toMatch(/\d/);
  });
});

describe('formatDateTime', () => {
  it('returns combined date+time', () => {
    expect(formatDateTime(D, 'en')).toMatch(/2026/);
  });
});

describe('formatRelative', () => {
  it('formats past as ago', () => {
    const now = new Date('2026-05-19T14:30:00Z');
    const past = new Date('2026-05-18T14:30:00Z');
    expect(formatRelative(past, 'en', now)).toMatch(/yesterday|1 day ago/i);
  });

  it('formats future as forward', () => {
    const now = new Date('2026-05-19T14:30:00Z');
    const future = new Date('2026-05-20T14:30:00Z');
    expect(formatRelative(future, 'en', now)).toMatch(/tomorrow|in 1 day/i);
  });
});
