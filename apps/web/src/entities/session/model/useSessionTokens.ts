'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSessionStore } from '../store/sessionStore';
import type {
  SessionProviderId,
  SessionTokensSnapshot,
  SetSessionTokensInput,
} from './types';

export type { SessionTokensSnapshot, SetSessionTokensInput, SessionProviderId };

export type SessionTokensValue = {
  snapshot: SessionTokensSnapshot;
  hydrated: boolean;
  setTokens: (input: SetSessionTokensInput) => Promise<SessionTokensSnapshot>;
  clearTokens: () => Promise<void>;
  reload: () => Promise<SessionTokensSnapshot>;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
};

export function useSessionTokens(): SessionTokensValue {
  const snapshot = useSessionStore((state) => state.snapshot);
  const hydrated = useSessionStore((state) => state.hydrated);
  const setTokens = useSessionStore((state) => state.setTokens);
  const clearTokens = useSessionStore((state) => state.clearTokens);
  const storeRefreshTokens = useSessionStore((state) => state.refreshTokens);

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
    const expiresAt = snapshot.accessTokenExpiresAt;
    if (!expiresAt) {
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

    const { scheduleRefresh } = useSessionStore.getState();
    scheduleRefresh(delay);
  }, [snapshot.accessTokenExpiresAt, storeRefreshTokens]);

  const userId = useMemo(() => {
    if (snapshot.userId) return snapshot.userId;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('arcadeum_anon_id');
  }, [snapshot.userId]);

  const finalSnapshot = useMemo(
    () => ({
      ...snapshot,
      userId,
    }),
    [snapshot, userId],
  );

  return useMemo(
    () => ({
      snapshot: finalSnapshot,
      hydrated,
      setTokens,
      clearTokens,
      reload,
      refreshTokens: storeRefreshTokens,
    }),
    [
      finalSnapshot,
      hydrated,
      setTokens,
      clearTokens,
      reload,
      storeRefreshTokens,
    ],
  );
}
