import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'web_session_tokens_v1';
const ANON_KEY = 'arcadeum_anon_id';

type SessionModule = typeof import('./sessionStore');

async function loadFreshStore(): Promise<SessionModule['useSessionStore']> {
  vi.resetModules();
  const mod = await import('./sessionStore');
  // The rehydrate fix-ups are deferred to a microtask so they can touch the
  // store after it has been assigned; let them run.
  await Promise.resolve();
  await Promise.resolve();
  return mod.useSessionStore;
}

function seedPersisted(snapshot: Record<string, unknown>, anonId?: string) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: {
        snapshot,
        mode: 'authenticated',
        anonId: anonId ?? 'persisted-anon',
      },
      version: 0,
    }),
  );
}

describe('sessionStore onRehydrateStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads a persisted session without throwing a TDZ ReferenceError', async () => {
    seedPersisted({ userId: 'u1', accessToken: 'tok', xp: 5060, level: 1 });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(loadFreshStore()).resolves.toBeDefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('re-derives level from xp after hydration', async () => {
    seedPersisted({ userId: 'u1', accessToken: 'tok', xp: 5060, level: 1 });

    const store = await loadFreshStore();

    expect(store.getState().snapshot.xp).toBe(5060);
    expect(store.getState().snapshot.level).toBe(4);
  });

  it('syncs anonId from the dedicated localStorage key after hydration', async () => {
    seedPersisted({ userId: null, accessToken: null, xp: 0, level: 1 }, 'old');
    localStorage.setItem(ANON_KEY, 'fresh-anon');

    const store = await loadFreshStore();

    expect(store.getState().anonId).toBe('fresh-anon');
  });

  it('leaves anonId alone when no dedicated key is stored', async () => {
    seedPersisted({ userId: null, accessToken: null, xp: 0, level: 1 }, 'kept');

    const store = await loadFreshStore();

    expect(store.getState().anonId).toBe('kept');
  });
});
