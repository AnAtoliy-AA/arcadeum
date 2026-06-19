'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  off?: (event: string, callback: (...args: unknown[]) => void) => void;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export function usePhantom() {
  const { t } = useTranslation();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleDisconnect = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    if (!window.solana?.isPhantom) {
      setError(t('wallet.withdraw.phantomNotFound'));
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey.toString());
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('wallet.withdraw.connectionFailed'));
    } finally {
      setIsConnecting(false);
    }
  }, [t]);

  const disconnect = useCallback(async () => {
    try {
      await window.solana?.disconnect();
    } catch {
      setError(t('wallet.withdraw.disconnectFailed'));
      return;
    }
    setPublicKey(null);
    setIsConnected(false);
  }, [t]);

  useEffect(() => {
    const provider = window.solana;
    if (!provider?.on) return;

    const onDisconnect = () => handleDisconnect();
    provider.on('disconnect', onDisconnect);

    cleanupRef.current = () => {
      provider.off?.('disconnect', onDisconnect);
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [handleDisconnect]);

  return { publicKey, isConnected, isConnecting, error, connect, disconnect };
}
