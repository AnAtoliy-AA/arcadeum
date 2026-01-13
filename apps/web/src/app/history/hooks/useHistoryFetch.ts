import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { historyApi } from '@/features/history/api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { HistorySummary } from '../types';

import { PAGINATION, DEBOUNCE } from '@/shared/config/constants';

interface UseHistoryFetchOptions {
  accessToken: string | null;
  pageSize?: number;
}

interface UseHistoryFetchResult {
  entries: HistorySummary[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  searchQuery: string;
  statusFilter: string;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  fetchHistory: (page?: number, append?: boolean) => Promise<void>;
  refresh: () => void;
  loadMore: () => void;
}

export function useHistoryFetch({
  accessToken,
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
}: UseHistoryFetchOptions): UseHistoryFetchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE.SEARCH_DELAY);

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ['history', { status: statusFilter, search: debouncedSearch }],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken)
        return { entries: [], total: 0, hasMore: false, page: 1 };

      return historyApi.getHistory(
        {
          page: pageParam,
          limit: pageSize,
          status: statusFilter,
          search: debouncedSearch,
        },
        { token: accessToken },
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: !!accessToken,
  });

  const entries = data?.pages.flatMap((page) => page.entries) || [];

  // Backwards compatibility wrappers
  const fetchHistory = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  return {
    entries,
    loading: isLoading,
    refreshing: isRefetching,
    error: error ? error.message : null,
    hasMore: !!hasNextPage,
    loadingMore: isFetchingNextPage,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    fetchHistory,
    refresh: refetch,
    loadMore,
  };
}
