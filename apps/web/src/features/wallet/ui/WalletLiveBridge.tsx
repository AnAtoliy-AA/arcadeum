'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  walletSocket,
  connectWalletSocket,
  disconnectWalletSocket,
} from '../lib/wallet-socket';

interface Props {
  authToken: string;
}

/**
 * Client island that maintains the wallet socket connection for authenticated
 * users. Listens for `wallet:updated` events and calls `router.refresh()` so
 * any Server Component showing a balance re-fetches from the server.
 *
 * Mounted exactly once in the root layout (apps/web/src/app/layout.tsx) so it
 * is not re-created when navigating between pages. The bridge is only rendered
 * when a valid auth token exists — the Server Component parent guards that.
 */
export function WalletLiveBridge({ authToken }: Props) {
  const router = useRouter();

  useEffect(() => {
    connectWalletSocket(authToken);

    const onUpdate = () => router.refresh();
    walletSocket.on('wallet:updated', onUpdate);

    return () => {
      walletSocket.off('wallet:updated', onUpdate);
      disconnectWalletSocket();
    };
  }, [authToken, router]);

  return null;
}
