'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import type { AuthUserProfile } from '../api/authApi';

const FOCUS_THROTTLE_MS = 30_000;

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

  useEffect(() => {
    const sync = async (): Promise<void> => {
      if (inFlightRef.current) return;

      const stateBefore = useSessionStore.getState();
      if (!stateBefore.hydrated || !stateBefore.snapshot.accessToken) return;

      const now = Date.now();
      if (now - lastSuccessfulSyncAtRef.current < FOCUS_THROTTLE_MS) return;

      inFlightRef.current = true;
      try {
        const profile = await apiClient.get<AuthUserProfile>('/auth/me', {
          token: stateBefore.snapshot.accessToken,
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
        console.warn('[SessionRoleSync] /auth/me failed:', err);
      } finally {
        inFlightRef.current = false;
      }
    };

    void sync();

    const unsubscribe = useSessionStore.subscribe((state, prev) => {
      if (state.hydrated && !prev.hydrated) void sync();
    });

    const onFocus = (): void => {
      void sync();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, []);

  return null;
}
