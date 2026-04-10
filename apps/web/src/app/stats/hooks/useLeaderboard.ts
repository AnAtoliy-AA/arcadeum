import { useInfiniteQuery } from '@/shared/hooks/useInfiniteQuery';
import { historyApi } from '@/features/history/api';
import type {
  LeaderboardEntry,
  LeaderboardResponse,
} from '@/features/history/api';
import { useMemo } from 'react';

interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refresh: () => void;
  loadMore: () => void;
}

const PAGE_SIZE = 20;

export function useLeaderboard(
  gameId?: string,
  initialData: LeaderboardResponse | null = null,
): UseLeaderboardResult {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    refetch,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<LeaderboardResponse, number>({
    queryKey: ['leaderboard', gameId],
    queryFn: ({ pageParam = 0 }) =>
      historyApi.getLeaderboard(PAGE_SIZE, pageParam, gameId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialData: initialData ? { pages: [initialData] } : null,
    refreshKey: `leaderboard-${gameId || 'all'}`,
  });

  const leaderboard = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.entries);
  }, [data]);

  const total = data?.pages[0]?.total || 0;

  return {
    leaderboard,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    refreshing: isRefetching,
    error: error ? error.message : null,
    hasMore: hasNextPage || false,
    total,
    refresh: refetch,
    loadMore: fetchNextPage,
  };
}
