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

    // Refresh Server Components once after the socket connects. SSR can race
    // BE startup (BalanceChip swallows fetch errors and renders null); without
    // this hook the chip stays null until the user manually reloads. Guarded
    // by a ref so we only refresh on the FIRST connect of this mount, not on
    // every reconnect.
    let didInitialRefresh = false;
    const onConnect = () => {
      if (didInitialRefresh) return;
      didInitialRefresh = true;
      router.refresh();
    };
    const onUpdate = () => router.refresh();

    walletSocket.on('connect', onConnect);
    walletSocket.on('wallet:updated', onUpdate);

    // If the socket was already connected before this effect ran (e.g.
    // navigating back to the layout), fire the initial refresh immediately.
    if (walletSocket.connected) onConnect();

    return () => {
      walletSocket.off('connect', onConnect);
      walletSocket.off('wallet:updated', onUpdate);
      disconnectWalletSocket();
    };
  }, [authToken, router]);

  return null;
}
