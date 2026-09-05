'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface LiveStats {
  activePlayers: number;
  activeRooms: number;
  activeGames: number;
  waitingRooms: number;
}

interface UseLiveStatsOptions {
  /** Polling interval in milliseconds (default: 30000) */
  intervalMs?: number;
  /** Whether to enable polling (default: true) */
  enabled?: boolean;
}

interface UseLiveStatsResult {
  stats: LiveStats | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Shared hook for polling live stats.
 * Eliminates duplicate polling logic in LivePulseBadge and GameLandingLiveStats.
 */
export function useLiveStats(
  options: UseLiveStatsOptions = {},
): UseLiveStatsResult {
  const { intervalMs = 30_000, enabled = true } = options;
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/live-stats`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch live stats (${response.status})`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setStats({
          activePlayers: data.activePlayers ?? 0,
          activeRooms: data.activeRooms ?? 0,
          activeGames: data.activeGames ?? 0,
          waitingRooms: data.waitingRooms ?? 0,
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      void fetchStats();
    }
  }, [enabled, fetchStats]);

  // Set up polling
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    intervalRef.current = setInterval(() => {
      void fetchStats();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, fetchStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
