'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
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

export function usePhantom(locale: Locale = DEFAULT_LOCALE) {
  const { t } = useTranslation(locale);
  const wallet = t.wallet;
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
      setError(wallet?.withdraw.phantomNotFound ?? 'Phantom wallet not found. Please install it.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey.toString());
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : (wallet?.withdraw.connectionFailed ?? 'Connection failed'));
    } finally {
      setIsConnecting(false);
    }
  }, [wallet]);

  const disconnect = useCallback(async () => {
    try {
      await window.solana?.disconnect();
    } catch {
      setError(wallet?.withdraw.disconnectFailed ?? 'Failed to disconnect wallet');
      return;
    }
    setPublicKey(null);
    setIsConnected(false);
  }, [wallet]);

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
