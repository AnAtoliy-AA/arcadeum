import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SessionProviderId,
  SessionTokensSnapshot,
  SetSessionTokensInput,
} from '../model/useSessionTokens';
import type { LoginResponse } from '../api/authApi';
import { refreshSession } from '../api/authApi';

// Reusing types or importing them.
// Ideally these types should be in a shared 'types' file or 'model' file, but they are exported from 'useSessionTokens' currently.
// We might need to move them to avoid circular imports if we keep useSessionTokens for compatibility.
// For now, let's assume we can import them.

// Duplicate default snapshot for now to avoid circular import if useSessionTokens depends on store
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

  setTokens: (input: SetSessionTokensInput) => Promise<SessionTokensSnapshot>;
  clearTokens: () => Promise<void>;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
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

      setHydrated: (hydrated) => set({ hydrated }),

      setTokens: async (input) => {
        const { snapshot } = get();
        const next = buildSnapshot(snapshot, input);
        set({ snapshot: next });
        return next;
      },

      clearTokens: async () => {
        set({ snapshot: defaultSnapshot });
      },

      refreshTokens: async () => {
        const { snapshot, refreshInFlight } = get();
        if (refreshInFlight) {
          // If in flight, we might want to wait for it or just throw/return current.
          // Simplification: return current.
          return snapshot;
        }

        const refreshToken = snapshot.refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        set({ refreshInFlight: true });

        try {
          const response = await refreshSession(refreshToken);
          const merged = enrichWithResponse(
            snapshot,
            response,
            snapshot.provider,
          );
          set({ snapshot: merged, refreshInFlight: false });
          return merged;
        } catch (error) {
          get().clearTokens();
          set({ refreshInFlight: false });
          throw error;
        }
      },
    }),
    {
      name: 'web_session_tokens_v1', // Using SAME key to migrate seamlessly!
      storage: createJSONStorage(() => localStorage),
      // We only persist the snapshot
      partialize: (state) => ({ snapshot: state.snapshot }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
