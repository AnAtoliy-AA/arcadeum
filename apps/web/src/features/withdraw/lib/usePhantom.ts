'use client';

import { useState, useCallback } from 'react';

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export function usePhantom() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.solana?.isPhantom) {
      setError('Phantom wallet not found. Please install it.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey.toString());
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await window.solana?.disconnect();
    setPublicKey(null);
    setIsConnected(false);
  }, []);

  return { publicKey, isConnected, isConnecting, error, connect, disconnect };
}
