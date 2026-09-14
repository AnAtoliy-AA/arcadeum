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
  const anonId = useSessionStore((state) => state.anonId);

  const reload = useCallback(async () => {
    return snapshot;
  }, [snapshot]);

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
    const lead = 60 * 1000;
    const delay = expiresAtMs - now - lead;

    if (delay <= 0) {
      storeRefreshTokens().catch(() => {});
      return;
    }

    const { scheduleRefresh } = useSessionStore.getState();
    scheduleRefresh(delay);
  }, [snapshot.accessTokenExpiresAt, storeRefreshTokens]);

  const userId = useMemo(() => {
    if (snapshot.userId && snapshot.accessToken) return snapshot.userId;
    return anonId;
  }, [snapshot.userId, snapshot.accessToken, anonId]);

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
