'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  walletSocket,
  connectWalletSocket,
  disconnectWalletSocket,
} from '../lib/wallet-socket';

interface Props {
  authToken: string;
}

const DEFER_MS = 2000;

/**
 * Client island that maintains the wallet socket connection for authenticated
 * users. Listens for `wallet:updated` events and calls `router.refresh()` so
 * any Server Component showing a balance re-fetches from the server.
 *
 * The connection is deferred by 2 s so it doesn't compete with initial
 * rendering / LCP on pages where wallet data isn't displayed (e.g. landing).
 */
export function WalletLiveBridge({ authToken }: Props) {
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      connectWalletSocket(authToken);

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
  }, [authToken, router]);

  return null;
}
