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
import { fetchProfile } from '../api/authApi';
import { ApiError } from '@/shared/lib/api-client';

const FOCUS_THROTTLE_MS = 30_000;

/**
 * Mounted exactly once at the app root. Keeps the persisted session
 * snapshot's `role` (and other profile fields) in sync with the BE by
 * calling /auth/me on mount and on window focus (throttled).
 */
export function SessionRoleSync(): null {
  const lastSyncedAtRef = useRef<number>(0);

  useEffect(() => {
    const sync = async () => {
      const { hydrated, snapshot, setTokens, refreshTokens } =
        useSessionStore.getState();
      if (!hydrated || !snapshot.accessToken) return;

      const now = Date.now();
      if (now - lastSyncedAtRef.current < FOCUS_THROTTLE_MS) return;
      lastSyncedAtRef.current = now;

      try {
        const profile = await fetchProfile(snapshot.accessToken);
        await setTokens({
          provider: snapshot.provider,
          accessToken: snapshot.accessToken,
          accessTokenExpiresAt: snapshot.accessTokenExpiresAt,
          refreshToken: snapshot.refreshToken,
          refreshTokenExpiresAt: snapshot.refreshTokenExpiresAt,
          tokenType: snapshot.tokenType,
          userId: profile.id,
          email: profile.email,
          username: profile.username,
          displayName: profile.displayName ?? profile.username ?? profile.email,
          role: profile.role,
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Access token expired/invalid; the store has its own refresh path.
          await refreshTokens().catch(() => undefined);
          return;
        }
        // 5xx, network error, etc. — keep stale snapshot, log for dev visibility.
        console.warn('[SessionRoleSync] /auth/me failed:', err);
      }
    };

    // Initial sync (covers app mount + the post-hydration path).
    void sync();

    const onFocus = () => {
      void sync();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return null;
}
```

Key choices:

- **`useSessionStore.getState()` inside the effect** instead of selectors:
  the component shouldn't re-render when the snapshot updates (we'd
  re-mount the effect and double-fetch). One mount, one effect, one focus
  listener.
- **`lastSyncedAtRef`** is a ref so it survives re-renders without
  triggering them.
- **`refreshTokens()` on 401**: the store already throws on refresh failure
  and clears tokens, which logs the user out — that's the right behavior
  for an invalid session. We don't manually clobber.

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

The Vitest spec mocks `fetchProfile` and `useSessionStore.getState()` to
control state without setting up the real Zustand store.

- **mounts and fetches when `hydrated && accessToken`** — verifies
  `fetchProfile` is called once with the access token
- **does not fetch when `!hydrated`** — early return
- **does not fetch when `!accessToken`** — early return
- **writes profile fields (id, email, username, displayName, role) via
  `setTokens`** — verifies the merged shape
- **idempotent within throttle window**: trigger focus event right after
  mount sync, assert `fetchProfile` called only once
- **fires again after throttle elapses**: advance fake timers past 30s,
  dispatch focus, assert second call
- **on 401, calls `refreshTokens()` and does not call `setTokens`** —
  verify error path
- **on 5xx, swallows error silently and keeps prior snapshot** — verify
  `setTokens` not called, `console.warn` called once
- **cleans up focus listener on unmount** — `removeEventListener` called

Use `vi.useFakeTimers()` and `vi.spyOn(window, 'addEventListener' /
'removeEventListener')` to drive the focus mechanic. Mock `console.warn`
via `vi.spyOn` to avoid noise.

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
