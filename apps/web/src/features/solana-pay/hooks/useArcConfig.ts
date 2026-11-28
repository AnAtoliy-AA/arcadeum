'use client';

import { useEffect, useState } from 'react';
import { getArcConfig, type ArcConfig } from '@/shared/api/arc-config';

let inFlight: Promise<ArcConfig> | null = null;
let cached: ArcConfig | null = null;

/** Loads the backend ARC config once; failures are never cached. */
export function loadArcConfig(): Promise<ArcConfig> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = getArcConfig()
      .then((c) => {
        cached = c;
        return c;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function resetArcConfigCache(): void {
  cached = null;
  inFlight = null;
}

export function useArcConfig(): {
  config: ArcConfig | null;
  loading: boolean;
  error: boolean;
} {
  const [config, setConfig] = useState<ArcConfig | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    loadArcConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading, error };
}
