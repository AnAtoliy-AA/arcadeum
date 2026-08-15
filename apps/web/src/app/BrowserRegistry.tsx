'use client';

import { ReactNode, useEffect } from 'react';
import { useSessionStore } from '@/entities/session/store/sessionStore';

interface BrowserRegistryProps {
  children: ReactNode;
}

export default function BrowserRegistry({ children }: BrowserRegistryProps) {
  useEffect(() => {
    // Lazy-load the socket module only for pagehide cleanup. A static
    // import would pull socket.io-client into the initial bundle of
    // every page (the home page never opens a socket connection).
    let disconnect: (() => void) | undefined;
    void import('@/shared/lib/socket').then((mod) => {
      disconnect = mod.disconnectSockets;
    });

    const handlePageHide = () => {
      disconnect?.();
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const state = useSessionStore.getState();
      if (!state.hydrated || !state.snapshot.accessToken) return;
      const expiresAt = state.snapshot.accessTokenExpiresAt;
      if (!expiresAt) return;
      const expiresAtMs = Date.parse(expiresAt);
      if (!Number.isFinite(expiresAtMs)) return;
      const msUntilExpiry = expiresAtMs - Date.now();
      if (msUntilExpiry < 2 * 60 * 1000) {
        state.refreshTokens().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    useSessionStore.getState().setHydrated(true);
  }, []);

  return <>{children}</>;
}
