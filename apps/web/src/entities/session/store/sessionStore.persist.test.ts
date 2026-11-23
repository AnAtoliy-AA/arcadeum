import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'web_session_tokens_v1';

interface Persisted {
  state: { snapshot: { userId: string | null; username: string | null } };
}

// A persisted session as written by a signed-in page: the access token is
// never stored, only the profile fields that identify the user.
function seedSignedIn() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: {
        snapshot: {
          userId: 'u1',
          username: 'alice',
          email: 'a@b.c',
          accessToken: null,
          refreshToken: null,
          xp: 0,
          level: 1,
        },
        mode: 'authenticated',
        anonId: 'anon-1',
      },
      version: 0,
    }),
  );
}

function readPersisted(): Persisted {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Persisted;
}

async function loadFreshStore() {
  vi.resetModules();
  const mod = await import('./sessionStore');
  await Promise.resolve();
  await Promise.resolve();
  return mod.useSessionStore;
}

describe('sessionStore persistence while the token is not restored yet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the signed-in identity after an unrelated store write', async () => {
    seedSignedIn();
    const store = await loadFreshStore();

    // Any write before the cookie restore finishes (hydrated flag, anonId
    // sync, level fix-up...) re-persists the store.
    store.getState().setHydrated(true);
    store.setState({ anonId: 'anon-2' });

    // A reload at this moment must still see who was signed in, otherwise
    // the next page load thinks there was no prior session and never
    // restores it (user becomes anon).
    expect(readPersisted().state.snapshot.userId).toBe('u1');
  });

  it('still drops the identity once the user really signs out', async () => {
    seedSignedIn();
    const store = await loadFreshStore();
    await store.getState().clearTokens();

    expect(readPersisted().state?.snapshot?.userId ?? null).toBeNull();
  });

  it('does not persist a stale profile when nobody is signed in', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          snapshot: {
            userId: null,
            username: null,
            displayName: 'Leftover Name',
            accessToken: null,
            refreshToken: null,
            xp: 0,
            level: 1,
          },
          mode: 'anon',
          anonId: 'anon-1',
        },
        version: 0,
      }),
    );
    const store = await loadFreshStore();
    store.getState().setHydrated(true);

    const persisted = readPersisted().state.snapshot as {
      displayName?: string | null;
    };
    expect(persisted.displayName ?? null).toBeNull();
  });
});
