import { validate } from 'class-validator';
import { IsSafeUrl } from './is-safe-url.validator';

class Bag {
  @IsSafeUrl()
  href?: string;
}

async function errorCount(href: string | undefined) {
  const bag = new Bag();
  bag.href = href;
  return (await validate(bag)).length;
}

describe('IsSafeUrl', () => {
  it('accepts https URL', async () =>
    expect(await errorCount('https://x.com')).toBe(0));
  it('accepts http URL', async () =>
    expect(await errorCount('http://x.com')).toBe(0));
  it('accepts root-relative path', async () =>
    expect(await errorCount('/games/123')).toBe(0));
  it('accepts undefined', async () =>
    expect(await errorCount(undefined)).toBe(0));
  it('rejects javascript:', async () =>
    expect(await errorCount('javascript:alert(1)')).toBeGreaterThan(0));
  it('rejects data:', async () =>
    expect(await errorCount('data:text/html,<script>')).toBeGreaterThan(0));
  it('rejects relative path without leading slash', async () =>
    expect(await errorCount('games/123')).toBeGreaterThan(0));
  it('rejects empty string', async () =>
    expect(await errorCount('')).toBeGreaterThan(0));
});
