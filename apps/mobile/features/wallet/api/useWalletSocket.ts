import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  walletSocket,
  connectWalletSocket,
  disconnectWalletSocket,
} from '@/features/wallet/lib/wallet-socket';

export function useWalletSocket(token: string | null | undefined): void {
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return;

    connectWalletSocket(token);

    const onUpdate = () => {
      void qc.invalidateQueries({ queryKey: ['wallet'] });
    };

    walletSocket.on('wallet:updated', onUpdate);

    return () => {
      walletSocket.off('wallet:updated', onUpdate);
      disconnectWalletSocket();
    };
  }, [token, qc]);
}
