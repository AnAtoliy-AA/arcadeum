import { describe, it, expect, beforeEach } from 'vitest';
import { addDismissed, getDismissed, isDismissed } from './dismissedStorage';

const KEY = 'arc:announcements:dismissed';

describe('dismissedStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns [] when storage empty', () => {
    expect(getDismissed()).toEqual([]);
  });

  it('round-trips an entry', () => {
    addDismissed({ id: 'a', updatedAt: '2026-05-09T00:00:00Z' });
    expect(getDismissed()).toEqual([
      { id: 'a', updatedAt: '2026-05-09T00:00:00Z' },
    ]);
  });

  it('isDismissed matches on id + updatedAt', () => {
    addDismissed({ id: 'a', updatedAt: '2026-05-09T00:00:00Z' });
    expect(isDismissed({ id: 'a', updatedAt: '2026-05-09T00:00:00Z' })).toBe(
      true,
    );
    expect(isDismissed({ id: 'a', updatedAt: '2026-05-10T00:00:00Z' })).toBe(
      false,
    );
    expect(isDismissed({ id: 'b', updatedAt: '2026-05-09T00:00:00Z' })).toBe(
      false,
    );
  });

  it('replaces existing entry by id (keeps newest updatedAt)', () => {
    addDismissed({ id: 'a', updatedAt: '2026-05-09T00:00:00Z' });
    addDismissed({ id: 'a', updatedAt: '2026-05-10T00:00:00Z' });
    const all = getDismissed();
    expect(all).toHaveLength(1);
    expect(all[0]?.updatedAt).toBe('2026-05-10T00:00:00Z');
  });

  it('caps at 50 entries (FIFO eviction)', () => {
    for (let i = 0; i < 60; i++) {
      addDismissed({ id: `id-${i}`, updatedAt: `t${i}` });
    }
    const all = getDismissed();
    expect(all).toHaveLength(50);
    // Newest first
    expect(all[0]?.id).toBe('id-59');
    // Oldest 10 evicted
    expect(all.find((e) => e.id === 'id-0')).toBeUndefined();
    expect(all.find((e) => e.id === 'id-9')).toBeUndefined();
  });

  it('treats malformed JSON as empty array', () => {
    window.localStorage.setItem(KEY, 'not-json{{{');
    expect(getDismissed()).toEqual([]);
  });

  it('filters out malformed entries inside a JSON array', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify([
        { id: 'good', updatedAt: 'ok' },
        { id: 123 }, // bad
        null, // bad
        'string', // bad
        { id: 'good2', updatedAt: 'ok2' },
      ]),
    );
    const all = getDismissed();
    expect(all).toHaveLength(2);
    expect(all[0]?.id).toBe('good');
    expect(all[1]?.id).toBe('good2');
  });
});
