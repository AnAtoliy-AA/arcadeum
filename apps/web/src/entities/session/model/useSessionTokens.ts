'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  refreshSession,
  type LoginResponse,
  type UserRole,
} from '../api/authApi';

export type SessionProviderId = 'oauth' | 'local' | null;

export type SessionTokensSnapshot = {
  provider: SessionProviderId;
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
  role: UserRole | null;
};

export type SetSessionTokensInput = {
  provider?: SessionProviderId;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  accessTokenExpiresAt?: string | Date | null;
  refreshTokenExpiresAt?: string | Date | null;
  userId?: string | null;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
  role?: UserRole | null;
};

export type SessionTokensValue = {
  snapshot: SessionTokensSnapshot;
  hydrated: boolean;
  setTokens: (input: SetSessionTokensInput) => Promise<SessionTokensSnapshot>;
  clearTokens: () => Promise<void>;
  reload: () => Promise<SessionTokensSnapshot>;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
};

const STORAGE_KEY = 'web_session_tokens_v1';
const STORAGE_EVENT = 'session_tokens_changed';

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

function toIso(value?: string | Date | null): string | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function readFromStorage(): SessionTokensSnapshot {
  if (typeof window === 'undefined') {
    return { ...defaultSnapshot };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultSnapshot };
    }
    const parsed = JSON.parse(raw) as Partial<SessionTokensSnapshot>;
    return {
      ...defaultSnapshot,
      ...parsed,
    } satisfies SessionTokensSnapshot;
  } catch {
    return { ...defaultSnapshot };
  }
}

function writeToStorage(snapshot: SessionTokensSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    // Dispatch custom event to notify all components
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: snapshot }));
  } catch {
    // ignore persistence errors
  }
}

function clearStorage() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    // Dispatch custom event to notify all components
    window.dispatchEvent(
      new CustomEvent(STORAGE_EVENT, { detail: defaultSnapshot }),
    );
  } catch {
    // ignore
  }
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

export function useSessionTokens(): SessionTokensValue {
  const [snapshot, setSnapshot] = useState<SessionTokensSnapshot>({
    ...defaultSnapshot,
  });
  const [hydrated, setHydrated] = useState(false);
  const refreshInFlight = useRef<Promise<SessionTokensSnapshot> | null>(null);

  useEffect(() => {
    const stored = readFromStorage();
    setSnapshot(stored);
    setHydrated(true);

    // Listen for storage changes from other components or tabs
    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<SessionTokensSnapshot>;
      if (customEvent.detail) {
        setSnapshot(customEvent.detail);
      }
    };

    window.addEventListener(STORAGE_EVENT, handleStorageChange);

    // Also listen for storage events from other tabs
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const stored = readFromStorage();
        setSnapshot(stored);
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const reload = useCallback(async () => {
    const stored = readFromStorage();
    setSnapshot(stored);
    setHydrated(true);
    return stored;
  }, []);

  const clearTokens = useCallback(async () => {
    setSnapshot({ ...defaultSnapshot });
    setHydrated(true);
    clearStorage();
  }, []);

  const setTokens = useCallback(
    async (input: SetSessionTokensInput) => {
      const current = snapshot;
      const next = buildSnapshot(current, input);
      setSnapshot(next);
      setHydrated(true);
      writeToStorage(next);
      return next;
    },
    [snapshot],
  );

  const refreshTokens = useCallback(async () => {
    const current = snapshot;
    const refreshToken = current.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    const operation = (async () => {
      try {
        const response = await refreshSession(refreshToken);
        const merged = enrichWithResponse(current, response, current.provider);
        setSnapshot(merged);
        writeToStorage(merged);
        setHydrated(true);
        return merged;
      } catch (error) {
        await clearTokens();
        throw error;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = operation;
    return operation;
  }, [snapshot, clearTokens]);

  useEffect(() => {
    const token = snapshot.refreshToken;
    const expiresAt = snapshot.accessTokenExpiresAt;
    if (!token || !expiresAt) {
      return;
    }

    const expiresAtMs = Date.parse(expiresAt);
    if (!Number.isFinite(expiresAtMs)) {
      return;
    }

    const now = Date.now();
    const lead = 60 * 1000; // refresh one minute before expiry
    const delay = expiresAtMs - now - lead;

    if (delay <= 0) {
      refreshTokens().catch(() => {
        // errors already handled in refreshTokens (clears snapshot on failure)
      });
      return;
    }

    const timeout = window.setTimeout(() => {
      refreshTokens().catch(() => {
        // handled inside refreshTokens
      });
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [snapshot.accessTokenExpiresAt, snapshot.refreshToken, refreshTokens]);

  return useMemo(
    () => ({
      snapshot,
      hydrated,
      setTokens,
      clearTokens,
      reload,
      refreshTokens,
    }),
    [snapshot, hydrated, setTokens, clearTokens, reload, refreshTokens],
  );
}
