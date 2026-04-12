import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse } from '../api/authApi';
import { refreshSession } from '../api/authApi';
import type {
  SessionProviderId,
  SessionTokensSnapshot,
  SetSessionTokensInput,
  LocalAuthMode,
} from '../model/types';
import { cookies } from '@/shared/lib/cookies';

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
};

interface SessionState {
  snapshot: SessionTokensSnapshot;
  hydrated: boolean;
  refreshInFlight: boolean;
  refreshTimeoutId: ReturnType<typeof setTimeout> | null;

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
  });
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      snapshot: defaultSnapshot,
      hydrated: false,
      refreshInFlight: false,
      refreshTimeoutId: null,
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

        // Sync with cookies for SSR
        if (next.accessToken) {
          cookies.set('web_access_token', next.accessToken);
        }
        if (next.refreshToken) {
          cookies.set('web_refresh_token', next.refreshToken);
        }

        return next;
      },

      clearTokens: async () => {
        const { refreshTimeoutId } = get();
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
        set({ snapshot: defaultSnapshot, refreshTimeoutId: null });

        // Clear cookies
        cookies.remove('web_access_token');
        cookies.remove('web_refresh_token');

        if (typeof window !== 'undefined') {
          localStorage.removeItem('web_session_tokens_v1');
        }
      },

      refreshTokens: async () => {
        const state = get() as SessionState;
        if (state.refreshInFlight) {
          return state.snapshot;
        }

        const refreshToken = state.snapshot.refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        if (state.refreshTimeoutId) clearTimeout(state.refreshTimeoutId);
        set({ refreshInFlight: true, refreshTimeoutId: null });

        try {
          const response = await refreshSession(refreshToken);
          const merged = enrichWithResponse(
            state.snapshot,
            response,
            state.snapshot.provider!,
          );
          set({ snapshot: merged, refreshInFlight: false });
          return merged;
        } catch (error) {
          (get() as SessionState).clearTokens();
          set({ refreshInFlight: false });
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
      name: 'web_session_tokens_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        snapshot: (state as SessionState).snapshot,
        mode: (state as SessionState).mode,
      }),
    },
  ),
);
