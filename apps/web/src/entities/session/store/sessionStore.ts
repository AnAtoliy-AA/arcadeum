import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse } from '../api/authApi';
import { refreshSessionFromCookie } from '../api/authApi';
import { ApiError } from '@/shared/lib/api-client';
import { acquireRefreshLock } from '../lib/refreshLock';
import { levelFromXp } from '@/shared/lib/xp-level';
import type {
  SessionProviderId,
  SessionTokensSnapshot,
  SetSessionTokensInput,
  LocalAuthMode,
} from '../model/types';

const STORAGE_KEY = 'web_session_tokens_v1';
// Written (with a timestamp) only when an authenticated session is really
// ended, so other tabs can tell a logout from an unrelated removal of the
// persisted snapshot.
export const LOGOUT_MARKER_KEY = 'web_session_logout_v1';

const defaultSnapshot: SessionTokensSnapshot = {
  provider: null,
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  updatedAt: null,
  userId: null,
  email: null,
  username: null,
  displayName: null,
  role: null,
  xp: 0,
  level: 1,
  prestige: 0,
  equippedAvatarId: null,
  equippedBadgeId: null,
  equippedNameColorId: null,
  equippedFrameId: null,
  equippedAuraId: null,
  equippedBannerId: null,
  equippedGameSkinId: null,
};

interface SessionState {
  snapshot: SessionTokensSnapshot;
  hydrated: boolean;
  refreshInFlight: boolean;
  refreshTimeoutId: ReturnType<typeof setTimeout> | null;
  anonId: string | null;

  mode: LocalAuthMode;
  setMode: (mode: LocalAuthMode) => void;
  setTokens: (input: SetSessionTokensInput) => Promise<SessionTokensSnapshot>;
  clearTokens: () => Promise<void>;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
  scheduleRefresh: (delay: number) => void;
  setHydrated: (hydrated: boolean) => void;
}

// Helper to build snapshot (copied logic for purity in store)
function toIso(value?: string | Date | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function buildSnapshot(
  current: SessionTokensSnapshot,
  input: SetSessionTokensInput,
): SessionTokensSnapshot {
  return {
    provider: input.provider ?? current.provider ?? null,
    accessToken: input.accessToken ?? current.accessToken ?? null,
    refreshToken: input.refreshToken ?? current.refreshToken ?? null,
    tokenType: input.tokenType ?? current.tokenType ?? null,
    accessTokenExpiresAt:
      toIso(input.accessTokenExpiresAt) ?? current.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt:
      toIso(input.refreshTokenExpiresAt) ??
      current.refreshTokenExpiresAt ??
      null,
    updatedAt: new Date().toISOString(),
    userId: input.userId ?? current.userId ?? null,
    email: input.email ?? current.email ?? null,
    username: input.username ?? current.username ?? null,
    displayName: input.displayName ?? current.displayName ?? null,
    role: input.role ?? current.role ?? null,
    xp: input.xp ?? current.xp ?? 0,
    level: levelFromXp(input.xp ?? current.xp ?? 0),
    prestige: input.prestige ?? current.prestige ?? 0,
    equippedAvatarId:
      input.equippedAvatarId === undefined
        ? (current.equippedAvatarId ?? null)
        : input.equippedAvatarId,
    equippedBadgeId:
      input.equippedBadgeId === undefined
        ? (current.equippedBadgeId ?? null)
        : input.equippedBadgeId,
    equippedNameColorId:
      input.equippedNameColorId === undefined
        ? (current.equippedNameColorId ?? null)
        : input.equippedNameColorId,
    equippedFrameId:
      input.equippedFrameId === undefined
        ? (current.equippedFrameId ?? null)
        : input.equippedFrameId,
    equippedAuraId:
      input.equippedAuraId === undefined
        ? (current.equippedAuraId ?? null)
        : input.equippedAuraId,
    equippedBannerId:
      input.equippedBannerId === undefined
        ? (current.equippedBannerId ?? null)
        : input.equippedBannerId,
    equippedGameSkinId:
      input.equippedGameSkinId === undefined
        ? (current.equippedGameSkinId ?? null)
        : input.equippedGameSkinId,
  };
}

function enrichWithResponse(
  snapshot: SessionTokensSnapshot,
  response: LoginResponse,
  provider: SessionProviderId,
): SessionTokensSnapshot {
  return buildSnapshot(snapshot, {
    provider,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt ?? null,
    refreshToken: response.refreshToken ?? null,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
    tokenType: 'Bearer',
    userId: response.user?.id ?? snapshot.userId ?? null,
    email: response.user?.email ?? snapshot.email ?? null,
    username: response.user?.username ?? snapshot.username ?? null,
    displayName:
      response.user?.displayName ??
      response.user?.username ??
      snapshot.displayName ??
      null,
    role: response.user?.role ?? snapshot.role ?? null,
    xp: response.user?.xp ?? snapshot.xp ?? 0,
    level: levelFromXp(response.user?.xp ?? snapshot.xp ?? 0),
    prestige: response.user?.prestige ?? snapshot.prestige ?? 0,
    equippedAvatarId:
      response.user?.equippedAvatarId ?? snapshot.equippedAvatarId ?? null,
    equippedBadgeId:
      response.user?.equippedBadgeId ?? snapshot.equippedBadgeId ?? null,
    equippedNameColorId:
      response.user?.equippedNameColorId ??
      snapshot.equippedNameColorId ??
      null,
    equippedFrameId:
      response.user?.equippedFrameId ?? snapshot.equippedFrameId ?? null,
    equippedAuraId:
      response.user?.equippedAuraId ?? snapshot.equippedAuraId ?? null,
    equippedBannerId:
      response.user?.equippedBannerId ?? snapshot.equippedBannerId ?? null,
    equippedGameSkinId:
      response.user?.equippedGameSkinId ?? snapshot.equippedGameSkinId ?? null,
  });
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      snapshot: defaultSnapshot,
      hydrated: false,
      refreshInFlight: false,
      refreshTimeoutId: null,
      anonId: null,
      mode: 'login',

      setMode: (mode: LocalAuthMode) => set({ mode }),
      setHydrated: (hydrated: boolean) => {
        if (get().hydrated === hydrated) return;
        set({ hydrated });
      },

      setTokens: async (input: SetSessionTokensInput) => {
        const state = get() as SessionState;
        const next = buildSnapshot(state.snapshot, input);
        set({ snapshot: next });

        return next;
      },

      clearTokens: async () => {
        const { snapshot, refreshTimeoutId } = get();
        const wasAuthenticated = !!(snapshot.accessToken || snapshot.userId);
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
        set({ snapshot: defaultSnapshot, refreshTimeoutId: null });

        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(STORAGE_KEY);
            if (wasAuthenticated) {
              localStorage.setItem(LOGOUT_MARKER_KEY, String(Date.now()));
            }
          } catch {
            // Storage unavailable: nothing to broadcast.
          }
        }
      },

      refreshTokens: async () => {
        const state = get() as SessionState;
        if (state.refreshInFlight) {
          return state.snapshot;
        }

        // Nothing to refresh for a visitor who never signed in. Bail out
        // before taking the cross-tab lock so we never burn it for nothing.
        if (!state.snapshot.accessToken && !state.snapshot.userId) {
          return state.snapshot;
        }

        // Another tab refreshed within the lock window: skip so we don't
        // race a rotated cookie (one tab would get 401 and drop the session).
        if (!acquireRefreshLock()) {
          return state.snapshot;
        }

        if (state.refreshTimeoutId) clearTimeout(state.refreshTimeoutId);
        set({ refreshInFlight: true, refreshTimeoutId: null });

        try {
          // The refresh token lives only in the httpOnly cookie. Never send a
          // body token: a stale in-memory copy replays a rotated token and
          // makes the backend revoke the whole token family.
          const response = await refreshSessionFromCookie();
          const current = get().snapshot;
          const merged = enrichWithResponse(
            current,
            response,
            current.provider ?? 'local',
          );
          set({ snapshot: merged, refreshInFlight: false });
          return merged;
        } catch (error) {
          set({ refreshInFlight: false });
          // Only a definite 401 means the session is gone. 429, 5xx and
          // network failures are transient and must not log the user out.
          if (error instanceof ApiError && error.status === 401) {
            await (get() as SessionState).clearTokens();
          }
          throw error;
        }
      },

      scheduleRefresh: (delay: number) => {
        const state = get();
        if (state.refreshTimeoutId) clearTimeout(state.refreshTimeoutId);
        const timeoutId = setTimeout(() => {
          get()
            .refreshTokens()
            .catch(() => {});
        }, delay);
        set({ refreshTimeoutId: timeoutId });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const s = state as SessionState;
        // After a reload the access token is never in memory until the
        // refresh cookie restore finishes, but the identity (userId) is. That
        // "restore pending" state must survive being re-persisted (any store
        // write before the restore lands triggers a persist), otherwise a
        // second fast reload finds no prior session, skips the restore and
        // the user turns anon. A real logout resets the snapshot to defaults
        // (userId null), so stale profile data still never outlives it.
        const hasIdentity = !!s.snapshot.accessToken || !!s.snapshot.userId;
        return {
          snapshot: {
            ...s.snapshot,
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            ...(hasIdentity
              ? {}
              : {
                  userId: null,
                  email: null,
                  username: null,
                  displayName: null,
                  role: null,
                  equippedAvatarId: null,
                  equippedBadgeId: null,
                  equippedNameColorId: null,
                  equippedFrameId: null,
                  equippedAuraId: null,
                  equippedBannerId: null,
                  equippedGameSkinId: null,
                }),
          },
          mode: s.mode,
          anonId: s.anonId,
        };
      },
      onRehydrateStorage: () => {
        if (typeof window === 'undefined') return () => {};

        return (_state, error) => {
          if (error) return;

          // localStorage hydration is synchronous, so this callback can fire
          // while create() is still running, before `useSessionStore` is
          // assigned (TDZ ReferenceError, silently swallowed by persist).
          // Defer the fix-ups until the module has finished evaluating.
          queueMicrotask(() => {
            const hydrated = useSessionStore.getState().snapshot;
            const derivedLevel = levelFromXp(hydrated.xp ?? 0);
            if (hydrated.level !== derivedLevel) {
              useSessionStore.setState({
                snapshot: { ...hydrated, level: derivedLevel },
              });
            }

            const ANON_KEY = 'arcadeum_anon_id';
            const stored = localStorage.getItem(ANON_KEY);
            const current = useSessionStore.getState();
            if (stored && stored !== current.anonId) {
              useSessionStore.setState({ anonId: stored });
            }
          });
        };
      },
    },
  ),
);

// Only an explicit logout marker from another tab signs this tab out. A bare
// removal of the persisted snapshot is not enough. Registered at module level
// (not inside onRehydrateStorage) so it is installed exactly once, regardless
// of when persist hydration runs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== LOGOUT_MARKER_KEY || !e.newValue) return;
    const live = useSessionStore.getState();
    if (!live.snapshot.userId && !live.snapshot.accessToken) return;
    if (live.refreshTimeoutId) clearTimeout(live.refreshTimeoutId);
    // Local reset only: do not re-broadcast the marker.
    useSessionStore.setState({
      snapshot: defaultSnapshot,
      refreshTimeoutId: null,
    });
  });
}
