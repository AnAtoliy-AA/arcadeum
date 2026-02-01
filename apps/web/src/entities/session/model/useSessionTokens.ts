'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { type UserRole } from '../api/authApi';

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

export function useSessionTokens(): SessionTokensValue {
  const {
    snapshot,
    hydrated,
    setTokens,
    clearTokens,
    refreshTokens: storeRefreshTokens,
  } = useSessionStore();

  const reload = useCallback(async () => {
    // Rehydration is automatic in Zustand, but we can force a re-read if needed or just return current.
    // For compatibility, we'll return current snapshot.
    // UseStore automatically listens to storage changes across tabs too!
    return snapshot;
  }, [snapshot]);

  // Auto-refresh logic (from store or keep here?)
  // Keeping it here allows the hook to drive the refresh cycle based on component lifecycle,
  // while the store handles the actual async operation and state update.
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
      storeRefreshTokens().catch(() => {
        // errors already handled
      });
      return;
    }

    const timeout = window.setTimeout(() => {
      storeRefreshTokens().catch(() => {
        // handled
      });
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    snapshot.accessTokenExpiresAt,
    snapshot.refreshToken,
    storeRefreshTokens,
  ]);

  return useMemo(
    () => ({
      snapshot,
      hydrated,
      setTokens,
      clearTokens,
      reload,
      refreshTokens: storeRefreshTokens,
    }),
    [snapshot, hydrated, setTokens, clearTokens, reload, storeRefreshTokens],
  );
}
