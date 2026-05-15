# Session Role Sync — Design

**Date:** 2026-05-09
**Branch:** ARC-606
**Builds on:** ARC-602 (admin shell), ARC-604 (admin user list + 2 role-snapshot fixes)
**Status:** Approved (pending spec review)

## Context

ARC-604 fixed two paths where `snapshot.role` was being dropped when populating
the client session store (local-credential login via `useLocalAuth.checkSession`,
and OAuth login via `useOAuth.applySessionResponse`). With those fixes, a fresh
login correctly persists `role` into the Zustand-backed snapshot.

What's still missing: when an admin promotes another user via `/admin/users`,
that user's session snapshot stays stale until they log out and back in. The
client never re-checks `/auth/me` after the initial login flow, so role-aware
UI (the admin sidebar link, the role badge, future admin-only widgets) won't
appear for the freshly-promoted user.

This spec adds a mount-time + focus-time profile rehydration so role changes
propagate to the affected user's UI within seconds of returning to the tab,
without requiring re-login.

## Scope

### In scope (v1)

1. New `SessionRoleSync` client component mounted at the app root that:
   - Fires `fetchProfile()` once on mount when `hydrated && accessToken`
   - Re-fires on `window.focus` events, throttled to at most once per 30s
   - Merges the latest `role`, `displayName`, `username`, `email`, `userId`
     into the snapshot via `setTokens` (mirroring the login flow's merge)
   - Triggers `refreshTokens()` on 401 instead of clobbering snapshot
   - Silently logs and ignores 5xx / network errors
   - Unmounts cleanly (removes focus listener)
2. Mount the component inside `BrowserRegistry` (existing `'use client'` root).
3. Vitest coverage for the listed behaviors.

### Safety properties

- **No logout on transient errors.** A 5xx from `/auth/me` should not log the
  user out. The existing `useSessionTokens` already manages access-token
  refresh on schedule; this hook never deletes tokens.
- **No double-fetching.** A single mount produces one fetch; rapid focus events
  are throttled.
- **No N-component fan-out.** The sync component is mounted exactly once at
  the root, not embedded in any per-page hook.

### Out of scope

- Periodic polling (every N minutes). Covered: not needed; mount + focus
  catches the realistic scenarios at low cost.
- Cross-tab broadcast of role changes (Zustand `persist` already syncs
  `localStorage` between tabs via the storage event; we rely on that).
- Rehydrating other server-of-truth state (cosmetic badges, referrals).
  Their existing query hooks handle their own freshness.
- Admin "force log out a user" feature.
- Configurable throttle interval.

## Architecture

```
apps/web/src/entities/session/model/
├── SessionRoleSync.tsx                NEW — 'use client'; renders null
└── SessionRoleSync.test.tsx           NEW — Vitest

apps/web/src/app/BrowserRegistry.tsx   MODIFY — mount <SessionRoleSync />
```

**Why a separate component, not a hook called from `useSessionTokens`:**
`useSessionTokens` is consumed by many components (header, profile menu,
chat, settings, etc.). Adding sync there fires the fetch N times per render
across the tree. A dedicated component mounted exactly once at the root
fires it exactly once.

**Why inside `BrowserRegistry`:** it's already a client boundary, already
imports `useSessionStore`, and is a structural child of all providers. Adding
the sync there avoids a new top-level provider.

## Component

`apps/web/src/entities/session/model/SessionRoleSync.tsx`:

```tsx
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
    const sync = async () => {
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

        // Logout-during-sync guard: re-read the store right before
        // mutating. If the user logged out while the fetch was in
        // flight, accessToken is now null and we drop the result.
        const statePost = useSessionStore.getState();
        if (!statePost.snapshot.accessToken) return;

        // Pass ONLY profile fields. The store's buildSnapshot merge
        // preserves current token fields via `input.X ?? current.X`,
        // so a refresh that landed during this fetch survives.
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
          // Access token rejected by BE; delegate to the store's
          // refresh path. Throttle slot NOT consumed so a follow-up
          // sync can run on next focus once tokens refresh.
          await useSessionStore
            .getState()
            .refreshTokens()
            .catch(() => undefined);
          return;
        }
        // 5xx / network — keep stale snapshot, log for dev visibility.
        // Throttle slot NOT consumed; next focus may retry.
        console.warn('[SessionRoleSync] /auth/me failed:', err);
      } finally {
        inFlightRef.current = false;
      }
    };

    // Initial sync. May early-return if `hydrated` is still false in
    // this commit phase (BrowserRegistry's setHydrated effect runs
    // alongside ours). The subscribe below picks up the eventual
    // hydrated:true flip and triggers the first real sync.
    void sync();
    const unsubscribe = useSessionStore.subscribe((state, prev) => {
      if (state.hydrated && !prev.hydrated) void sync();
    });

    const onFocus = () => {
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

Key choices:

- **`apiClient.get` directly** (not `fetchProfile`): `fetchProfile` throws
  plain `Error` from `authApi.ts`'s local `readJson` helper, so
  `err instanceof ApiError` would never match. `apiClient.get` throws
  `ApiError` with `.status` on non-2xx, enabling the 401 branch. We don't
  modify `fetchProfile` — that would ripple into login/refresh error UX.
- **Profile fields only** in `setTokens`: the store's `buildSnapshot`
  ([sessionStore.ts:49-71](../../apps/web/src/entities/session/store/sessionStore.ts))
  preserves token fields via `input.X ?? current.X`. Passing token fields
  explicitly would clobber a parallel `refreshTokens()` result.
- **`useSessionStore.getState()` (not selectors)** inside the effect: the
  component shouldn't re-render when the snapshot changes; we'd re-mount
  the effect and double-fetch. One mount, one effect, one focus listener.
- **Logout race guard**: re-read the store right before `setTokens` and
  bail if `accessToken` was cleared during the fetch.
- **Throttle slot reserved only on success** (`lastSuccessfulSyncAtRef`):
  a 5xx/network failure or a 401 (delegated to refresh) doesn't consume
  the 30s window, so the next focus event can retry immediately.
- **`inFlightRef`**: prevents two concurrent syncs (e.g., mount + an
  immediate focus event right after hydration).
- **`useSessionStore.subscribe`**: persist middleware sets `hydrated:
true` after rehydrating localStorage. Subscribing means the initial
  sync runs as soon as hydration completes, even if the synchronous
  read in the same commit phase saw `hydrated: false`.

## Mount point

`apps/web/src/app/BrowserRegistry.tsx`:

Add the import and render the component as a sibling of `{children}`. The
file is already `'use client'`. Diff is two lines plus an import.

```tsx
import { SessionRoleSync } from '@/entities/session/model/SessionRoleSync';
// ...
return (
  <>
    {/* existing children/effects */}
    <SessionRoleSync />
    {children}
  </>
);
```

## Tests

`apps/web/src/entities/session/model/SessionRoleSync.test.tsx`:

The Vitest spec mocks `apiClient.get` and `useSessionStore.getState()` /
`useSessionStore.subscribe` to control state without setting up the real
Zustand store.

**Setup notes:**

- Use `vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'Date'] })`
  so `Date.now()` advances with `vi.setSystemTime()` — necessary because
  the throttle uses `Date.now()`, not a timer.
- `vi.spyOn(console, 'warn').mockImplementation(() => {})` to avoid
  noise.
- The store mock provides a stub `subscribe(listener)` that calls
  `listener(state, prev)` synchronously when invoked from the test.

**Behavioral tests:**

- **mounts and fetches when `hydrated && accessToken`** — `apiClient.get`
  called once with `/auth/me` and the access token
- **does not fetch when `!hydrated`** — early return
- **does not fetch when `!accessToken`** — early return
- **post-hydration sync**: mount with `hydrated: false`; trigger
  subscribe callback with `hydrated: true`; assert `apiClient.get` then
  fires once
- **profile-fields-only `setTokens`**: assert the call's argument
  contains only `userId`, `email`, `username`, `displayName`, `role` —
  no token fields
- **logout-during-sync race**: between `apiClient.get` resolving and
  `setTokens` running, simulate `accessToken` becoming null; assert
  `setTokens` is NOT called
- **idempotent within throttle window**: dispatch focus event
  immediately after the initial sync; `apiClient.get` called only once
- **fires again after throttle elapses**: advance system time past 30s
  via `vi.setSystemTime(Date.now() + 31_000)`; dispatch focus;
  `apiClient.get` called twice total
- **inFlight guard**: dispatch focus while a previous sync is still
  awaiting; only one fetch in flight
- **on 401, delegates to `refreshTokens` and does not call `setTokens`**;
  also asserts the throttle slot is NOT consumed (next focus retries)
- **on 5xx, swallows error silently** — `setTokens` not called,
  `console.warn` called once, throttle slot NOT consumed
- **cleans up focus listener and store subscription on unmount** —
  `removeEventListener` called and `unsubscribe` called

Use `vi.spyOn(window, 'addEventListener')` / `'removeEventListener'`
to drive the focus mechanic.

## File Inventory

### New

- `apps/web/src/entities/session/model/SessionRoleSync.tsx`
- `apps/web/src/entities/session/model/SessionRoleSync.test.tsx`

### Modified

- `apps/web/src/app/BrowserRegistry.tsx` — render `<SessionRoleSync />`

## Risks & Mitigations

- **Multi-tab fan-out**: Each open tab fires its own `/auth/me`. Acceptable
  — admin pages are low-traffic, admins are few. If load becomes an issue,
  v1 of the focus throttle could be raised.
- **30s throttle is arbitrary**: documented constant
  `FOCUS_THROTTLE_MS = 30_000`. Easy to revise. Not a config knob in v1
  to keep surface area small.
- **`useSessionStore.getState()` race with Zustand `persist` hydration**:
  the effect checks `hydrated` first and bails if not. Persist sets
  `hydrated: true` after rehydrating, so subsequent focus events see the
  updated state. The risk is a "first focus before hydration" no-op,
  which is acceptable — the next focus catches up.
- **Login-flow race**: if the user is mid-login (OAuth redirect callback)
  when the component mounts, `accessToken` is null and the effect bails.
  Once login completes and `setTokens` runs, the next focus event fires
  the sync. No conflict with the login path.
- **Logout race**: if logout fires while a sync is in flight, the response
  might race with `clearTokens`. The sync's `setTokens` would re-populate
  from the now-cleared snapshot. Mitigation: skip if `accessToken` is
  null at the moment of `setTokens`. Add a guard.

## Deferred to Future Specs

- Periodic poll (every N minutes)
- Configurable throttle interval
- Server-pushed role-change notifications via socket (admin promotes user
  → user receives a socket event → snapshot updates immediately)
- Toast/banner notifying the user their role changed
