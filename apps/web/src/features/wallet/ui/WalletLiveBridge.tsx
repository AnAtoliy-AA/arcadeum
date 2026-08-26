'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  walletSocket,
  connectWalletSocket,
  disconnectWalletSocket,
} from '@/shared/lib/socket';
import { useSessionStore } from '@/entities/session/store/sessionStore';

const DEFER_MS = 2000;

/**
 * Client island that maintains the wallet socket connection for authenticated
 * users. Listens for `wallet:updated` events and calls `router.refresh()` so
 * any Server Component showing a balance re-fetches from the server.
 *
 * The token is read from the client session store (the same plain JWT the
 * games/chats sockets use) — NOT from the httpOnly cookie, which is stored
 * encrypted and would fail the gateway's JWT verification.
 *
 * The connection is deferred by 2 s so it doesn't compete with initial
 * rendering / LCP on pages where wallet data isn't displayed (e.g. landing).
 */
export function WalletLiveBridge() {
  const router = useRouter();
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const timer = setTimeout(() => {
      connectWalletSocket(accessToken);

      const onUpdate = () => router.refresh();
      walletSocket.on('wallet:updated', onUpdate);

      cleanupRef.current = () => {
        walletSocket.off('wallet:updated', onUpdate);
        disconnectWalletSocket();
      };
    }, DEFER_MS);

    return () => {
      clearTimeout(timer);
      cleanupRef.current?.();
    };
  }, [accessToken, router]);

  return null;
}
