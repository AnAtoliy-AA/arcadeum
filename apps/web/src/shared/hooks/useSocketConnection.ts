import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  connectSockets,
  connectSocketsAnonymous,
  disconnectSockets,
} from '@/shared/lib/socket';
import { getOrCreateAnonymousId } from '@/shared/lib/api-client';

/**
 * Connects socket namespaces for the current user — authenticated or
 * anonymous.  Meant to be mounted once at the app root (BrowserRegistry)
 * so every page is covered.
 *
 * Runs inside useEffect → non-blocking, never delays initial render.
 */
export function useSocketConnection(): void {
  const lastKeyRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const { accessToken, userId } = useSessionStore.getState().snapshot;

    if (accessToken) {
      if (accessToken !== lastKeyRef.current) {
        lastKeyRef.current = accessToken;
        connectSockets(accessToken);
      }
    } else {
      disconnectSockets();
      void getOrCreateAnonymousId().then((anonId) => {
        const targetId = userId || anonId;
        if (targetId) {
          const key = `anon:${targetId}`;
          if (key !== lastKeyRef.current) {
            lastKeyRef.current = key;
            connectSocketsAnonymous(targetId);
          }
        }
      });
    }

    return () => {
      disconnectSockets();
      lastKeyRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const unsub = useSessionStore.subscribe((state) => {
      const { accessToken, userId } = state.snapshot;

      if (accessToken) {
        if (accessToken !== lastKeyRef.current) {
          lastKeyRef.current = accessToken;
          connectSockets(accessToken);
        }
      } else {
        disconnectSockets();
        const targetId = userId || null;
        if (targetId) {
          const key = `anon:${targetId}`;
          if (key !== lastKeyRef.current) {
            lastKeyRef.current = key;
            connectSocketsAnonymous(targetId);
          }
        } else {
          void getOrCreateAnonymousId().then((anonId) => {
            if (anonId) {
              const key = `anon:${anonId}`;
              if (key !== lastKeyRef.current) {
                lastKeyRef.current = key;
                connectSocketsAnonymous(anonId);
              }
            }
          });
        }
      }
    });

    return unsub;
  }, []);
}
