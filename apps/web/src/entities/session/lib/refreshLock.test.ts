import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LOCK_KEY = 'web_session_refresh_lock';
const TAB_KEY = 'web_session_tab_id';

// Each import simulates a fresh page load (module state is reset) while
// localStorage and sessionStorage survive, exactly like a browser reload.
async function loadPage() {
  vi.resetModules();
  return import('./refreshLock');
}

describe('acquireRefreshLock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('grants the first refresh', async () => {
    const { acquireRefreshLock } = await loadPage();
    expect(acquireRefreshLock()).toBe(true);
  });

  it('lets the same tab refresh again right after a reload', async () => {
    const first = await loadPage();
    expect(first.acquireRefreshLock()).toBe(true);

    vi.advanceTimersByTime(2_000);
    const afterReload = await loadPage();
    expect(afterReload.acquireRefreshLock()).toBe(true);
  });

  it('blocks a different tab inside the lock window', async () => {
    const tabA = await loadPage();
    expect(tabA.acquireRefreshLock()).toBe(true);

    // A second tab has its own sessionStorage, so it gets its own tab id.
    sessionStorage.removeItem(TAB_KEY);
    vi.advanceTimersByTime(2_000);
    const tabB = await loadPage();
    expect(tabB.acquireRefreshLock()).toBe(false);
  });

  it('lets a different tab refresh once the window has passed', async () => {
    const tabA = await loadPage();
    expect(tabA.acquireRefreshLock()).toBe(true);

    sessionStorage.removeItem(TAB_KEY);
    vi.advanceTimersByTime(10_001);
    const tabB = await loadPage();
    expect(tabB.acquireRefreshLock()).toBe(true);
  });

  it('still honours a legacy numeric lock written by an older client', async () => {
    localStorage.setItem(LOCK_KEY, String(Date.now()));
    vi.advanceTimersByTime(2_000);
    const { acquireRefreshLock } = await loadPage();
    expect(acquireRefreshLock()).toBe(false);
  });

  it('allows the refresh when storage is unavailable', async () => {
    const { acquireRefreshLock } = await loadPage();
    const spy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('denied');
      });
    expect(acquireRefreshLock()).toBe(true);
    spy.mockRestore();
  });
});
