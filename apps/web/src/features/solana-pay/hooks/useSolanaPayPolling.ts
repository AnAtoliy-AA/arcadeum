'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSolanaPayStatus,
  type SolanaPayStatus,
} from '@/shared/api/solana-pay';

interface UseSolanaPayPollingOptions {
  sessionId: string | null;
  onConfirmed: (signature: string) => void;
  onExpired?: () => void;
  onError?: (error: string) => void;
  pollIntervalMs?: number;
  maxPolls?: number;
}

export function useSolanaPayPolling({
  sessionId,
  onConfirmed,
  onExpired,
  onError,
  pollIntervalMs = 5000,
  maxPolls = 60,
}: UseSolanaPayPollingOptions) {
  const [status, setStatus] = useState<SolanaPayStatus['status']>('pending');
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    pollCountRef.current = 0;

    const currentSessionId = sessionId;

    async function poll() {
      if (pollCountRef.current >= maxPolls) {
        onExpired?.();
        setStatus('expired');
        return;
      }

      try {
        const result = await getSolanaPayStatus(currentSessionId);

        if (result.status === 'confirmed' && result.signature) {
          setStatus('confirmed');
          onConfirmed(result.signature);
          return;
        }

        if (result.status === 'expired') {
          setStatus('expired');
          onExpired?.();
          return;
        }

        pollCountRef.current++;
        timerRef.current = setTimeout(poll, pollIntervalMs);
      } catch {
        pollCountRef.current++;
        timerRef.current = setTimeout(poll, pollIntervalMs);
      }
    }

    poll();

    return () => {
      stopPolling();
    };
  }, [
    sessionId,
    pollIntervalMs,
    maxPolls,
    onConfirmed,
    onExpired,
    onError,
    stopPolling,
  ]);

  return { status, stopPolling };
}
