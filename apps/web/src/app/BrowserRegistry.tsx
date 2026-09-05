'use client';

import { ReactNode, useEffect } from 'react';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { useSocketConnection } from '@/shared/hooks/useSocketConnection';
import { disconnectSockets } from '@/shared/lib/socket';

interface BrowserRegistryProps {
  children: ReactNode;
}

export default function BrowserRegistry({ children }: BrowserRegistryProps) {
  useSocketConnection();

  // ARC-900: Register the service worker manually as a safety net.
  // The @ducanh2912/next-pwa plugin normally handles registration, but if the
  // plugin is disabled (e.g. NEXT_PUBLIC_E2E was accidentally set on staging)
  // the SW never registers and offline downloads are stuck on "Waiting for the
  // app to fully load…". This fallback ensures the SW is always registered in
  // production, regardless of the plugin state.
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }
    // Skip if the PWA plugin already registered a controlling SW.
    if (navigator.serviceWorker.controller) return;
    // Skip if a registration is already in flight or completed.
    navigator.serviceWorker.getRegistration('/').then((reg) => {
      if (reg) return;
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Registration failed — offline features will be unavailable but the
        // rest of the app is unaffected.
      });
    });
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      disconnectSockets();
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
