# Session Role Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `SessionRoleSync` client component that calls `/auth/me` on app mount + window focus (throttled) and merges fresh profile fields (especially `role`) into the persisted session snapshot, so role changes propagate without re-login.

**Architecture:** One always-mounted `'use client'` component rendered inside `BrowserRegistry`. Uses the project's existing custom `useSessionStore` (Zustand `persist`) directly — no selectors (we don't want re-renders). Calls `apiClient.get<AuthUserProfile>` so the 401 branch can detect via `instanceof ApiError`. Updates a `lastSuccessfulSyncAtRef` only on success so transient failures don't lock out retries.

**Tech Stack:** Next.js 16 (App Router, React 19), Zustand `persist` middleware, Tamagui (not used here — component renders `null`), Vitest + Testing Library for tests.

**Spec:** [docs/superpowers/specs/2026-05-09-session-role-sync-design.md](../specs/2026-05-09-session-role-sync-design.md)

---

## File Inventory

### New

- `apps/web/src/entities/session/model/SessionRoleSync.tsx` — `'use client'`, renders `null`, owns the sync logic
- `apps/web/src/entities/session/model/SessionRoleSync.test.tsx` — Vitest behavioral tests

### Modified

- `apps/web/src/app/BrowserRegistry.tsx` — render `<SessionRoleSync />` at the app root

---

## Phase 1 — Failing tests for SessionRoleSync

### Task 1.1: Failing test file

**Files:**

- Create: `apps/web/src/entities/session/model/SessionRoleSync.test.tsx`

This file mocks `apiClient.get` and the Zustand store directly. Each test
controls the store via a typed mock with `getState`/`subscribe`. Time
is faked with `vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'Date'] })`
so `Date.now()` advances with `vi.setSystemTime(...)`.

- [ ] **Step 1: Write the spec**

```tsx
// apps/web/src/entities/session/model/SessionRoleSync.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ---- Mock apiClient ----
vi.mock('@/shared/lib/api-client', async () => {
  const actual = await vi.importActual<
    typeof import('@/shared/lib/api-client')
  >('@/shared/lib/api-client');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
    },
  };
});

// ---- Mock the store ----
type Listener = (state: StoreState, prev: StoreState) => void;
interface StoreState {
  hydrated: boolean;
  snapshot: { accessToken: string | null };
  setTokens: ReturnType<typeof vi.fn>;
  refreshTokens: ReturnType<typeof vi.fn>;
}

const storeRef: { state: StoreState; listeners: Listener[] } = {
  state: {
    hydrated: false,
    snapshot: { accessToken: null },
    setTokens: vi.fn(),
    refreshTokens: vi.fn(),
  },
  listeners: [],
};

const setStoreState = (next: Partial<StoreState>) => {
  const prev = storeRef.state;
  storeRef.state = { ...prev, ...next };
  storeRef.listeners.forEach((l) => l(storeRef.state, prev));
};

vi.mock('../store/sessionStore', () => ({
  useSessionStore: Object.assign(
    // selector usage — not used by SessionRoleSync, but provide a stub
    (selector: (s: StoreState) => unknown) => selector(storeRef.state),
    {
      getState: () => storeRef.state,
      subscribe: (listener: Listener) => {
        storeRef.listeners.push(listener);
        return () => {
          const idx = storeRef.listeners.indexOf(listener);
          if (idx >= 0) storeRef.listeners.splice(idx, 1);
        };
      },
    },
  ),
}));

import { apiClient, ApiError } from '@/shared/lib/api-client';
import { SessionRoleSync } from './SessionRoleSync';

const apiGetMock = apiClient.get as unknown as ReturnType<typeof vi.fn>;

const PROFILE = {
  id: 'u1',
  email: 'a@x',
  username: 'alice',
  displayName: 'Alice',
  role: 'admin' as const,
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'Date'] });
  vi.setSystemTime(new Date('2026-05-09T00:00:00Z'));
  apiGetMock.mockReset();
  storeRef.state = {
    hydrated: true,
    snapshot: { accessToken: 'tok' },
    setTokens: vi.fn().mockResolvedValue(undefined),
    refreshTokens: vi.fn().mockResolvedValue(undefined),
  };
  storeRef.listeners = [];
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const flushPromises = () => act(async () => {});

describe('SessionRoleSync', () => {
  it('fetches /auth/me on mount when hydrated and accessToken present', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    await flushPromises();

    expect(apiGetMock).toHaveBeenCalledTimes(1);
    expect(apiGetMock).toHaveBeenCalledWith('/auth/me', { token: 'tok' });
  });

  it('does not fetch when not hydrated', async () => {
    storeRef.state.hydrated = false;
    render(<SessionRoleSync />);
    await flushPromises();
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('does not fetch when accessToken is null', async () => {
    storeRef.state.snapshot = { accessToken: null };
    render(<SessionRoleSync />);
    await flushPromises();
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it('fires sync after hydration flips from false to true', async () => {
    storeRef.state.hydrated = false;
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    await flushPromises();
    expect(apiGetMock).not.toHaveBeenCalled();

    setStoreState({ hydrated: true });
    await flushPromises();

    expect(apiGetMock).toHaveBeenCalledTimes(1);
  });

  it('passes only profile fields to setTokens', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    await flushPromises();

    expect(storeRef.state.setTokens).toHaveBeenCalledTimes(1);
    const arg = storeRef.state.setTokens.mock.calls[0][0];
    expect(arg).toEqual({
      userId: 'u1',
      email: 'a@x',
      username: 'alice',
      displayName: 'Alice',
      role: 'admin',
    });
    // Never pass token-related fields.
    expect(arg).not.toHaveProperty('accessToken');
    expect(arg).not.toHaveProperty('refreshToken');
    expect(arg).not.toHaveProperty('accessTokenExpiresAt');
  });

  it('logout-during-sync: drops the result if accessToken cleared mid-fetch', async () => {
    let resolveFetch: (v: typeof PROFILE) => void = () => {};
    apiGetMock.mockReturnValueOnce(
      new Promise<typeof PROFILE>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<SessionRoleSync />);
    await flushPromises();

    // User logs out mid-flight.
    setStoreState({ snapshot: { accessToken: null } });

    resolveFetch(PROFILE);
    await flushPromises();

    expect(storeRef.state.setTokens).not.toHaveBeenCalled();
  });

  it('throttle: focus event right after mount does not refetch', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(1);
  });

  it('throttle: focus event after 30s elapses fires another fetch', async () => {
    apiGetMock.mockResolvedValueOnce(PROFILE);
    render(<SessionRoleSync />);
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 31_000);
    apiGetMock.mockResolvedValueOnce(PROFILE);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();

    expect(apiGetMock).toHaveBeenCalledTimes(2);
  });

  it('inFlight: focus event during pending sync does not start a second fetch', async () => {
    let resolveFetch: (v: typeof PROFILE) => void = () => {};
    apiGetMock.mockReturnValueOnce(
      new Promise<typeof PROFILE>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<SessionRoleSync />);
    // Don't flush; sync is still pending.

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(apiGetMock).toHaveBeenCalledTimes(1);

    resolveFetch(PROFILE);
    await flushPromises();
  });

  it('on 401, calls refreshTokens and does not call setTokens; throttle slot not consumed', async () => {
    apiGetMock.mockRejectedValueOnce(new ApiError('Unauthorized', 401, null));
    render(<SessionRoleSync />);
    await flushPromises();

    expect(storeRef.state.refreshTokens).toHaveBeenCalledTimes(1);
    expect(storeRef.state.setTokens).not.toHaveBeenCalled();

    // Throttle slot was not consumed: a focus event right away can retry.
    apiGetMock.mockResolvedValueOnce(PROFILE);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(2);
  });

  it('on 5xx, swallows error silently; throttle slot not consumed', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    apiGetMock.mockRejectedValueOnce(new ApiError('Server error', 500, null));
    render(<SessionRoleSync />);
    await flushPromises();

    expect(storeRef.state.setTokens).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    apiGetMock.mockResolvedValueOnce(PROFILE);
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flushPromises();
    expect(apiGetMock).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });

  it('cleans up focus listener and store subscription on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    apiGetMock.mockResolvedValueOnce(PROFILE);

    const { unmount } = render(<SessionRoleSync />);
    await flushPromises();

    expect(storeRef.listeners.length).toBe(1);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(storeRef.listeners.length).toBe(0);

    removeSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pnpm --filter web exec vitest run src/entities/session/model/SessionRoleSync.test.tsx
```

Expected: FAIL — `Cannot find module './SessionRoleSync'`.

---

## Phase 2 — Implement SessionRoleSync

### Task 2.1: Component

**Files:**

- Create: `apps/web/src/entities/session/model/SessionRoleSync.tsx`

- [ ] **Step 1: Write the component**

```tsx
// apps/web/src/entities/session/model/SessionRoleSync.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import type { AuthUserProfile } from '../api/authApi';

const FOCUS_THROTTLE_MS = 30_000;

/**
 * Mounted exactly once at the app root. Keeps the persisted session
 * snapshot's `role` (and other profile fields) in sync with the BE by
 * calling /auth/me on mount (after hydration) and on window focus,
 * throttled. Mutates only profile fields; token fields are preserved
 * by the store's `?? current` merge.
 */
export function SessionRoleSync(): null {
  // 0 = "never synced yet"; first sync always passes the throttle.
  const lastSuccessfulSyncAtRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);

  useEffect(() => {
    const sync = async (): Promise<void> => {
      if (inFlightRef.current) return;

      const stateBefore = useSessionStore.getState();
      if (!stateBefore.hydrated || !stateBefore.snapshot.accessToken) return;

      const now = Date.now();
      if (now - lastSuccessfulSyncAtRef.current < FOCUS_THROTTLE_MS) return;

      inFlightRef.current = true;
      try {
        const profile = await apiClient.get<AuthUserProfile>('/auth/me', {
          token: stateBefore.snapshot.accessToken,
        });

        // Logout-during-sync guard.
        const statePost = useSessionStore.getState();
        if (!statePost.snapshot.accessToken) return;

        // Profile fields ONLY — buildSnapshot preserves token fields via
        // `input.X ?? current.X`, so a refresh that landed during this
        // fetch survives.
        await statePost.setTokens({
          userId: profile.id,
          email: profile.email,
          username: profile.username,
          displayName: profile.displayName ?? profile.username ?? profile.email,
          role: profile.role,
        });

        lastSuccessfulSyncAtRef.current = Date.now();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Delegate to the store's refresh path. Throttle slot NOT
          // consumed so the next focus can sync after refresh succeeds.
          await useSessionStore
            .getState()
            .refreshTokens()
            .catch(() => undefined);
          return;
        }
        // 5xx / network — keep stale snapshot. Throttle slot NOT
        // consumed; next focus may retry.
        console.warn('[SessionRoleSync] /auth/me failed:', err);
      } finally {
        inFlightRef.current = false;
      }
    };

    void sync();

    const unsubscribe = useSessionStore.subscribe((state, prev) => {
      if (state.hydrated && !prev.hydrated) void sync();
    });

    const onFocus = (): void => {
      void sync();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, []);

  return null;
}
```

- [ ] **Step 2: Run tests, expect PASS**

```bash
pnpm --filter web exec vitest run src/entities/session/model/SessionRoleSync.test.tsx
```

Expected: 11 tests pass.

If a test fails on `subscribe` shape (Zustand's actual subscribe accepts
`(state, prev)`), check the mock harness's listener signature matches.
Common Zustand gotcha: `subscribe` with a vanilla `create()` store does
fire `(state, prevState)` callbacks; the mock above mirrors that.

- [ ] **Step 3: Verify TS compiles**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit Phase 1+2**

```bash
git add apps/web/src/entities/session/model/SessionRoleSync.tsx apps/web/src/entities/session/model/SessionRoleSync.test.tsx
git commit -m "feat(session): add SessionRoleSync component (ARC-606)

Mount-time + window-focus rehydration of /auth/me into the persisted
session snapshot. Profile-fields-only setTokens; preserves token
fields via the store's ?? current merge. 401 -> refreshTokens path.
5xx/network -> silent log. Throttle slot consumed only on success.
inFlightRef prevents concurrent syncs. Subscribes to hydrated:true
flip so initial sync runs once persist completes.

11 unit tests cover all branches.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — Mount in BrowserRegistry

### Task 3.1: Mount the component

**Files:**

- Modify: `apps/web/src/app/BrowserRegistry.tsx`

- [ ] **Step 1: Read the current return statement**

```bash
grep -n "return" apps/web/src/app/BrowserRegistry.tsx | tail -5
```

Confirm the file currently returns `<>{children}</>` (or similar wrapper).

- [ ] **Step 2: Add the import + render**

Edit the file to:

1. Add `import { SessionRoleSync } from '@/entities/session/model/SessionRoleSync';`
2. Render `<SessionRoleSync />` immediately before `{children}` in the
   returned tree

Example diff:

```tsx
// near top, with other imports
import { SessionRoleSync } from '@/entities/session/model/SessionRoleSync';

// in the return
return (
  <>
    <SessionRoleSync />
    {children}
  </>
);
```

If the existing return wraps children in something other than a
fragment (e.g. a Tamagui provider), keep that structure intact and
just add `<SessionRoleSync />` as a sibling to `{children}`.

- [ ] **Step 3: Verify build**

```bash
pnpm --filter web build
```

Expected: clean. `/admin` route should still appear in the manifest.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/BrowserRegistry.tsx
git commit -m "feat(app): mount SessionRoleSync at app root (ARC-606)

Single global instance ensures /auth/me sync runs exactly once per
mount/focus event, not per-component-using-useSessionTokens.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4 — Final verification

### Task 4.1: Smoke + suite

- [ ] **Step 1: Web unit tests**

```bash
pnpm --filter web test
```

Expected: prior 347 tests + 11 new SessionRoleSync tests = 358 total
(approximate; recount may differ slightly).

- [ ] **Step 2: Lint + file-length + translations + build**

```bash
pnpm lint
pnpm check-file-length
pnpm check-translations
pnpm build
```

Expected: all clean.

- [ ] **Step 3: Manual smoke**

With the dev server running:

1. Log in as a non-admin user
2. In a separate session (incognito or another browser), log in as an
   existing admin
3. Promote the non-admin to `admin` via `/admin/users` from the admin
   session
4. Switch back to the non-admin tab and **switch tabs away then back**
   (triggers `window.focus`)
5. Open the avatar dropdown — Admin link should now be visible
6. Reload `/admin` — should render the admin shell

Optional verification of the throttle:

- Open DevTools → Network → filter "auth/me"
- Switch tabs in/out rapidly within 30s — only the first focus should
  trigger a request

- [ ] **Step 4: Final commit (if cleanup needed)**

If any cleanup or comment polish is required, commit it. Otherwise the
branch is ready to push.

---

## Done When

- `SessionRoleSync` mounted at app root, fetches `/auth/me` on mount +
  focus (throttled to once per 30s)
- Profile fields (id, email, username, displayName, role) merged into
  the persisted snapshot via `setTokens`
- Token fields preserved by the store's existing `?? current` merge
- 401 delegates to `refreshTokens`; 5xx/network silently retains snapshot
- 11 unit tests pass (mount, hydration flip, throttle, inFlight, logout
  race, 401, 5xx, cleanup, profile-only setTokens, fetch arguments)
- `pnpm lint`, `pnpm check-file-length`, `pnpm check-translations`,
  `pnpm build`, `pnpm test` all green
- Manual smoke: non-admin promoted via `/admin/users` sees Admin link in
  profile dropdown after a tab focus, without re-login

## Notes for the Implementer

- **Don't add features not in this plan.** No periodic polling, no
  toast notifications, no socket event listening.
- **Don't modify `fetchProfile`.** The component calls `apiClient.get`
  directly to get a real `ApiError` for the 401 branch. Touching
  `fetchProfile` would ripple into login/refresh error handling.
- **Don't pass token fields to `setTokens`.** That would clobber a
  parallel `refreshTokens()` result. Profile fields only.
- **The 30s throttle is intentional.** Don't make it configurable in v1.
- **Frequent commits.** Phase 1+2 land together (they're one TDD cycle);
  Phase 3 is its own commit.
