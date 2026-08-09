'use client';

import { ReactNode, useEffect } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import {
  connectSockets,
  connectSocketsAnonymous,
  disconnectSockets,
} from '@/shared/lib/socket';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { config as tamaguiConfig } from '@/shared/config/tamagui.config';

// Prime config immediately for SSR and Client environments

interface BrowserRegistryProps {
  children: ReactNode;
}

export default function BrowserRegistry({ children }: BrowserRegistryProps) {
  useServerInsertedHTML(() => {
    try {
      if (typeof tamaguiConfig.getCSS !== 'function') {
        console.error(
          'tamaguiConfig.getCSS is not a function. Current config:',
          Object.keys(tamaguiConfig),
        );
        throw new Error('tamaguiConfig.getCSS is not a function');
      }
      const code = tamaguiConfig.getCSS();
      if (!code) {
        return null;
      }
      return (
        <style
          dangerouslySetInnerHTML={{
            __html: code,
          }}
        />
      );
    } catch (error) {
      console.error('Failed to generate Tamagui CSS during SSR:', error);
      return null;
    }
  });

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

  useEffect(() => {
    const state = useSessionStore.getState();
    if (!state.hydrated) return;
    const { accessToken, userId } = state.snapshot;
    if (accessToken) {
      connectSockets(accessToken);
    } else if (userId) {
      connectSocketsAnonymous(userId);
    }
  }, []);

  return <>{children}</>;
}
