'use client';

import { useEffect } from 'react';
import { getOrCreateAnonymousId } from '@/shared/lib/api-client';
import {
  connectSocketsAnonymous,
  disconnectSockets,
  getGamesSocket,
} from '@/shared/lib/socket';

const WATCHDOG_MS = 5000;

/**
 * Keeps one anonymous games socket alive for a broadcast scene.
 *
 * socket.io gives up after `reconnectionAttempts` (10 by default), which is
 * fine for a person but not for a stream that must run for days. This hook
 * lifts the cap and adds a watchdog that re-dials whenever the socket is
 * neither connected nor connecting. It never surfaces an error: the scene
 * simply keeps showing the last known state.
 *
 * It owns exactly one interval and no socket listeners, and tears both down
 * (and the socket) on unmount, so cycling through many rooms does not leak.
 */
export function useAnonymousSpectatorSocket(): void {
  useEffect(() => {
    let stopped = false;

    try {
      getGamesSocket().io.reconnectionAttempts(Infinity);
    } catch {
      // Manager not available (SSR/test); the watchdog below still covers us.
    }

    const ensureConnected = async () => {
      if (stopped) return;
      try {
        const sock = getGamesSocket();
        if (sock.connected || sock.io?._readyState === 'opening') return;
        const anonId = await getOrCreateAnonymousId();
        if (stopped || !anonId) return;
        if (sock.connected) return;
        connectSocketsAnonymous(anonId);
      } catch {
        // Swallow: the next tick retries.
      }
    };

    void ensureConnected();
    const timer = setInterval(() => void ensureConnected(), WATCHDOG_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
      disconnectSockets();
    };
  }, []);
}
