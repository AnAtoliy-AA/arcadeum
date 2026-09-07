# Auth Flow Cleanup Plan

## Bug Analysis

### Bug 1: Stale username after signout

**Root cause**: Two issues combine to show the old user's name after logout:

1. **`partialize` keeps profile fields in localStorage** (`sessionStore.ts:232-244`): `displayName`, `username`, `userId` etc. are persisted even when tokens are stripped. If `clearTokens()` hasn't completed (or fails), stale profile data rehydrates on next page load.

2. **`SessionRoleSync.restoreFromCookie()` re-establishes session** (`SessionRoleSync.tsx:114-122`): On page load/focus, if `userId` exists in localStorage but `accessToken` is null, it calls `restoreFromCookie()`. If the httpOnly refresh cookie wasn't cleared (because `logoutSession()` failed silently — `.catch(() => {})` swallows the error), the full session is restored including `displayName`.

3. **Components read `snapshot.displayName` without `isAuthenticated` guard**: `ShopMannequinRail.tsx`, `GamePickerModal.tsx`, `GameCreateView.tsx`, `useChatSocket.ts` read displayName directly without checking auth status.

### Bug 2: Extra anonymous player in lobby (accepted limitation)

When an anonymous user authenticates while in a room, the old anon participant entry persists because `handleDisconnect` doesn't call `leaveRoom`. The real userId is added as a second participant. **Not fixing auto-removal** since anon players are legitimate guests — only the host should remove them. The duplicate is a side effect of the identity transition.

### Bug 3: Identity-less socket warnings

Backend logs show repeated `Identity-less socket attempted to act as anon_...` warnings. This happens when a socket connects without `anonId` in the handshake query (the query param gets lost during reconnection). The socket has no identity on `client.data` so `validateUserId` blocks all actions.

---

## Fix Plan

### Fix 1: Backend — Fix `idle_changed` with undefined userId

**File**: `apps/be/src/games/games.gateway.ts` (line 190)

```diff
- const data = { userId, idle: true };
+ const data = { userId: activeUserId, idle: true };
```

### Fix 2: Frontend — Clear `persistEmail` in all logout paths

**Files**:
- `apps/web/src/widgets/header/ui/ProfileMenu.tsx` (line 93-96)
- `apps/web/src/widgets/header/ui/MobileMenu.tsx` (line 93-97)
- `apps/web/src/app/[locale]/(app)/settings/SettingsContent.tsx` (line 206)

Add `sessionStorage.removeItem('web_auth_email')` after `clearTokens()` in all logout handlers. Import from `@/entities/session/model/encryptSensitive` if the key constant is exported, otherwise use the literal key.

### Fix 3: Frontend — Strip profile fields when not authenticated in `partialize`

**File**: `apps/web/src/entities/session/store/sessionStore.ts` (lines 232-244)

Update `partialize` to null out profile fields when there's no accessToken:

```typescript
partialize: (state) => {
  const s = state as SessionState;
  const hasToken = !!s.snapshot.accessToken;
  return {
    snapshot: {
      ...s.snapshot,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      ...(hasToken ? {} : {
        userId: null,
        email: null,
        username: null,
        displayName: null,
        role: null,
      }),
    },
    mode: s.mode,
  };
},
```

This prevents stale profile data from persisting in localStorage across sessions.

### Fix 4: Frontend — Guard displayName reads with isAuthenticated

**Files**:
- `apps/web/src/features/shop/ui/ShopMannequinRail.tsx` (line 96-98)
- `apps/web/src/features/games/ui/GamePickerModal.tsx` (line 158)
- `apps/web/src/features/games/ui/create/redesign/GameCreateView.tsx` (line 181)
- `apps/web/src/features/chat/hooks/useChatSocket.ts` (line 89)

Add `!!snapshot.accessToken &&` guard before using `displayName`/`username`, falling back to `'Anonymous'`.

### Fix 5: Frontend — Fix `useLocalAuth` stale email retention

**File**: `apps/web/src/entities/session/model/useLocalAuth.ts` (line 335)

```diff
- email: snapshot.email ?? current.email,
+ email: snapshot.email,
```

When the store clears on logout, `snapshot.email` is null — the old email should not persist via the `??` fallback.

### Fix 6: Backend — Fix identity-less socket anonId query param loss

**File**: `apps/web/src/shared/lib/socket.ts` (`connectSocketsAnonymous`, lines 287-319)

The `anonId` query param is set on `gamesSock.io.opts.query` but may be lost during Socket.IO reconnection. Ensure the query param is also set in the `auth` object as a fallback, or re-apply it on `reconnect` events.

Alternative: In `games.gateway.ts` `handleConnection`, if `anonId` is missing from query but the socket is reconnecting (check `client.recovered`), accept the connection without identity and let the first `joinRoom` payload establish it.

---

## Verification

1. **Sign in → Sign out**: Confirm displayName clears from header and localStorage; no stale name on page refresh
2. **Sign out → Refresh page**: Confirm no session restoration from cookie (if logout succeeded)
3. **Run `pnpm lint` and `pnpm typecheck`** in apps/web and apps/be
