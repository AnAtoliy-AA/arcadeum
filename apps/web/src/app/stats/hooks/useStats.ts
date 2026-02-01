import { useQuery } from '@tanstack/react-query';
import { historyApi } from '@/features/history/api';
import type { PlayerStats } from '@/features/history/api';

interface UseStatsOptions {
  accessToken: string | null;
}

interface UseStatsResult {
  stats: PlayerStats | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

export function useStats({ accessToken }: UseStatsOptions): UseStatsResult {
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['player-stats'],
    queryFn: async () => {
      if (!accessToken) return null;
      return historyApi.getStats({ token: accessToken });
    },
    enabled: !!accessToken,
  });

  return {
    stats: data || null,
    loading: isLoading,
    refreshing: isRefetching,
    error: error ? error.message : null,
    refresh: refetch,
  };
}
