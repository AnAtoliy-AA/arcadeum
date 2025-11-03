import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SecureStoreShim } from '@/lib/secureStore';
import { refreshSession } from '@/pages/AuthScreen/api/authApi';
import { connectSockets, disconnectSockets } from '@/hooks/useSocket';

type SessionProviderId = 'oauth' | 'local';

export interface SessionTokensSnapshot {
  provider: SessionProviderId | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  updatedAt: string | null;
  userId: string | null;
  email: string | null;
  username: string | null;
  displayName: string | null;
}

export interface SetSessionTokensInput {
  provider?: SessionProviderId | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  accessTokenExpiresAt?: string | Date | null;
  refreshTokenExpiresAt?: string | Date | null;
  userId?: string | null;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
}

export interface SessionTokensContextValue {
  tokens: SessionTokensSnapshot;
  hydrated: boolean;
  setTokens: (input: SetSessionTokensInput) => Promise<SessionTokensSnapshot>;
  clearTokens: () => Promise<void>;
  reload: () => Promise<SessionTokensSnapshot>;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
}

const STORAGE_KEY = 'session_tokens_v1';

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
};

function toIso(value?: string | Date | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function sanitizeSnapshot(value: Partial<SessionTokensSnapshot> | null | undefined): SessionTokensSnapshot {
  if (!value) return { ...defaultSnapshot };
  return {
    provider: (value.provider ?? null) as SessionProviderId | null,
    accessToken: value.accessToken ?? null,
    refreshToken: value.refreshToken ?? null,
    tokenType: value.tokenType ?? null,
    accessTokenExpiresAt: value.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: value.refreshTokenExpiresAt ?? null,
    updatedAt: value.updatedAt ?? null,
    userId: value.userId ?? null,
    email: value.email ?? null,
    username: value.username ?? null,
    displayName: value.displayName ?? null,
  };
}

async function readFromStorage(): Promise<SessionTokensSnapshot> {
  try {
    const raw = await SecureStoreShim.getItemAsync(STORAGE_KEY);
    if (!raw) return { ...defaultSnapshot };
    const parsed = JSON.parse(raw) as Partial<SessionTokensSnapshot>;
    return sanitizeSnapshot(parsed);
  } catch {
    return { ...defaultSnapshot };
  }
}

function buildNextSnapshot(current: SessionTokensSnapshot, input: SetSessionTokensInput): SessionTokensSnapshot {
  const next: SessionTokensSnapshot = {
    provider: (input.provider ?? current.provider ?? null) as SessionProviderId | null,
    accessToken: input.accessToken ?? current.accessToken ?? null,
    refreshToken: input.refreshToken ?? current.refreshToken ?? null,
    tokenType: input.tokenType ?? current.tokenType ?? null,
    accessTokenExpiresAt: toIso(input.accessTokenExpiresAt) ?? current.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: toIso(input.refreshTokenExpiresAt) ?? current.refreshTokenExpiresAt ?? null,
    updatedAt: new Date().toISOString(),
    userId: input.userId ?? current.userId ?? null,
    email: input.email ?? current.email ?? null,
    username: input.username ?? current.username ?? null,
    displayName: input.displayName ?? current.displayName ?? null,
  };
  return next;
}

const SessionTokensContext = createContext<SessionTokensContextValue | undefined>(undefined);

export function SessionTokensProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokensState] = useState<SessionTokensSnapshot>({ ...defaultSnapshot });
  const [hydrated, setHydrated] = useState(false);
  const refreshInFlight = useRef<Promise<SessionTokensSnapshot> | null>(null);

  const reload = useCallback(async () => {
    const next = await readFromStorage();
    setTokensState(next);
    setHydrated(true);
    return next;
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const setTokens = useCallback(
    async (input: SetSessionTokensInput) => {
      const next = buildNextSnapshot(tokens, input);
      setTokensState(next);
      setHydrated(true);
      try {
        const serialized = JSON.stringify(next);
        await SecureStoreShim.setItemAsync(STORAGE_KEY, serialized);
      } catch {
        // ignore persistence failures for now
      }
      return next;
    },
    [tokens],
  );

  const clearTokens = useCallback(async () => {
    setTokensState({ ...defaultSnapshot });
    setHydrated(true);
    disconnectSockets();
    try {
      await SecureStoreShim.deleteItemAsync(STORAGE_KEY);
    } catch {
      // ignore persistence failures for now
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    const refreshTokenValue = tokens.refreshToken;
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    const operation = (async () => {
      try {
        const response = await refreshSession(refreshTokenValue);
        const next = await setTokens({
          provider: tokens.provider,
          accessToken: response.accessToken,
          accessTokenExpiresAt: response.accessTokenExpiresAt ?? null,
          refreshToken: response.refreshToken ?? null,
          refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
          tokenType: tokens.tokenType ?? 'Bearer',
          userId: response.user?.id ?? tokens.userId ?? null,
          email: response.user?.email ?? tokens.email ?? null,
          username: response.user?.username ?? tokens.username ?? null,
          displayName: response.user?.displayName ?? tokens.displayName ?? null,
        });
        return next;
      } catch (error) {
        await clearTokens();
        throw error;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = operation;
    return operation;
  }, [tokens, setTokens, clearTokens]);

  useEffect(() => {
    if (!tokens.refreshToken) {
      return;
    }

    const expiresAtIso = tokens.accessTokenExpiresAt;
    if (!expiresAtIso) {
      return;
    }

    const expiresAtMs = Date.parse(expiresAtIso);
    if (Number.isNaN(expiresAtMs)) {
      return;
    }

    const now = Date.now();
    const leadMs = 60 * 1000; // refresh 1 minute before expiry
    const delay = expiresAtMs - now - leadMs;

    if (delay <= 0) {
      refreshTokens().catch(() => {
        // errors handled inside refreshTokens (clears tokens)
      });
      return;
    }

    const timeout = setTimeout(() => {
      refreshTokens().catch(() => {
        // errors handled inside refreshTokens
      });
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [tokens.accessToken, tokens.accessTokenExpiresAt, tokens.refreshToken, refreshTokens]);

  const value = useMemo<SessionTokensContextValue>(
    () => ({ tokens, hydrated, setTokens, clearTokens, reload, refreshTokens }),
    [tokens, hydrated, setTokens, clearTokens, reload, refreshTokens],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (tokens.accessToken) {
      connectSockets(tokens.accessToken);
    } else {
      disconnectSockets();
    }
  }, [hydrated, tokens.accessToken]);

  return <SessionTokensContext.Provider value={value}>{children}</SessionTokensContext.Provider>;
}

export function useSessionTokens(): SessionTokensContextValue {
  const ctx = useContext(SessionTokensContext);
  if (!ctx) {
    throw new Error('useSessionTokens must be used within a SessionTokensProvider');
  }
  return ctx;
}
