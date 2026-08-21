'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import { refreshSessionFromCookie } from '../api/authApi';
import { acquireRefreshLock } from '../lib/refreshLock';
import type { AuthUserProfile } from '../api/authApi';

const FOCUS_THROTTLE_MS = 30_000;
const INITIAL_SYNC_DEFER_MS = 2000;

// Backoff schedule for the cookie-restore path (no in-memory access token
// after a page refresh). Each failed attempt backs off harder so a flapping
// BE or a throttled /auth/refresh can never turn into a self-sustaining
// 429 → IP-block loop from a single client.
const RESTORE_BACKOFF_MS = [5_000, 15_000, 60_000, 300_000];
const RESTORE_401_RETRY_DELAY_MS = 800;
const RESTORE_401_GIVE_UP_MS = 5 * 60_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mounted exactly once at the app root. Keeps the persisted session
 * snapshot's `role` (and other profile fields) in sync with the BE by
 * calling /auth/me on mount (after hydration) and on window focus,
 * throttled. Mutates only profile fields; token fields are preserved
 * by the store's `?? current` merge.
 */
export function SessionRoleSync(): null {
  // 0 = "never synced yet"; first sync always passes the throttle.
  const lastSuccessfulSyncAtRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);

  // Cookie-restore state (no in-memory access token after a refresh).
  const lastRestoreAttemptAtRef = useRef<number>(0);
  const restoreFailuresRef = useRef<number>(0);
  const restoreGiveUpUntilRef = useRef<number>(0);
  const restoreRetriedAfter401Ref = useRef<boolean>(false);

  useEffect(() => {
    const restoreBackoffMs = (): number =>
      RESTORE_BACKOFF_MS[
        Math.min(restoreFailuresRef.current, RESTORE_BACKOFF_MS.length - 1)
      ];

    const restoreFromCookie = async (bypassLock = false): Promise<boolean> => {
      const now = Date.now();
      if (now < restoreGiveUpUntilRef.current) return false;
      if (now - lastRestoreAttemptAtRef.current < restoreBackoffMs())
        return false;
      // Another tab refreshed within the lock window — skip. We don't want
      // to race a rotated cookie (the loser would get 401 and drop the
      // session). On the post-401 retry we bypass the lock on purpose so we
      // can pick up the freshly rotated cookie from the winning tab.
      if (!bypassLock && !acquireRefreshLock()) return false;
      lastRestoreAttemptAtRef.current = now;

      try {
        const refreshed = await refreshSessionFromCookie();
        if (!refreshed.accessToken) return false;
        await useSessionStore.getState().setTokens({
          provider: 'local',
          accessToken: refreshed.accessToken,
          accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
          refreshToken: refreshed.refreshToken,
          refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
          tokenType: 'Bearer',
          userId: refreshed.user?.id ?? null,
          email: refreshed.user?.email ?? null,
          username: refreshed.user?.username ?? null,
          displayName:
            refreshed.user?.displayName ??
            refreshed.user?.username ??
            refreshed.user?.email ??
            null,
          role: refreshed.user?.role ?? null,
        });
        restoreFailuresRef.current = 0;
        restoreRetriedAfter401Ref.current = false;
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          if (!restoreRetriedAfter401Ref.current) {
            // A concurrent tab likely rotated the shared cookie mid-flight.
            // Retry once after a short delay so we send the new cookie.
            restoreRetriedAfter401Ref.current = true;
            await sleep(RESTORE_401_RETRY_DELAY_MS);
            lastRestoreAttemptAtRef.current = 0;
            return restoreFromCookie(true);
          }
          // Second 401 — the session is genuinely gone. Give up quietly and
          // stop hammering the endpoint until the next attempt window.
          restoreGiveUpUntilRef.current = Date.now() + RESTORE_401_GIVE_UP_MS;
          restoreFailuresRef.current = 0;
          restoreRetriedAfter401Ref.current = false;
          return false;
        }
        // 429 / 5xx / network — transient. Back off and retry later.
        restoreRetriedAfter401Ref.current = false;
        restoreFailuresRef.current += 1;
        return false;
      }
    };

    const sync = async (): Promise<void> => {
      if (inFlightRef.current) return;

      const stateBefore = useSessionStore.getState();
      if (!stateBefore.hydrated) return;

      if (!stateBefore.snapshot.accessToken) {
        const hadPriorSession =
          stateBefore.snapshot.userId || stateBefore.snapshot.refreshToken;
        if (!hadPriorSession) return;

        // Restore from the httpOnly refresh cookie. Failure is handled with
        // backoff — a transient error must never silently log the user out.
        const restored = await restoreFromCookie();
        if (!restored) return;
        // Fall through: populate profile/cosmetics right away instead of
        // waiting for the next focus event.
      }

      const now = Date.now();
      if (now - lastSuccessfulSyncAtRef.current < FOCUS_THROTTLE_MS) return;

      inFlightRef.current = true;
      try {
        const profile = await apiClient.get<AuthUserProfile>('/auth/me', {
          token: useSessionStore.getState().snapshot.accessToken ?? undefined,
        });

        // Logout-during-sync guard.
        const statePost = useSessionStore.getState();
        if (!statePost.snapshot.accessToken) return;

        // Profile fields ONLY — buildSnapshot preserves token fields via
        // `input.X ?? current.X`, so a refresh that landed during this
        // fetch survives. /auth/me is the authoritative profile source, so we
        // also propagate equipped cosmetics (avatar/badge/frame/aura/etc.) —
        // otherwise the header avatar stays stale after equipping elsewhere
        // (it shows initials while the live game resolves the real avatar).
        await statePost.setTokens({
          userId: profile.id,
          email: profile.email,
          username: profile.username,
          displayName: profile.displayName ?? profile.username ?? profile.email,
          role: profile.role,
          equippedAvatarId: profile.equippedAvatarId ?? null,
          equippedBadgeId: profile.equippedBadgeId ?? null,
          equippedNameColorId: profile.equippedNameColorId ?? null,
          equippedFrameId: profile.equippedFrameId ?? null,
          equippedAuraId: profile.equippedAuraId ?? null,
          equippedBannerId: profile.equippedBannerId ?? null,
          equippedGameSkinId: profile.equippedGameSkinId ?? null,
        });

        lastSuccessfulSyncAtRef.current = Date.now();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Delegate to the store's refresh path. Throttle slot NOT
          // consumed so the next focus can sync after refresh succeeds.
          await useSessionStore
            .getState()
            .refreshTokens()
            .catch(() => undefined);
          return;
        }
        // 5xx / network — keep stale snapshot. Throttle slot NOT
        // consumed; next focus may retry.
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[SessionRoleSync] /auth/me failed:', err);
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    const timer = setTimeout(() => void sync(), INITIAL_SYNC_DEFER_MS);

    const unsubscribe = useSessionStore.subscribe((state, prev) => {
      if (state.hydrated && !prev.hydrated) void sync();
    });

    const onFocus = (): void => {
      void sync();
    };
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') void sync();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      unsubscribe();
    };
  }, []);

  return null;
}
