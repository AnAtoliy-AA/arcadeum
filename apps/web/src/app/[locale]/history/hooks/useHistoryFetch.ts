import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useDeferredValue,
  useRef,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useInfiniteQuery } from '@/shared/hooks/useInfiniteQuery';
import { historyApi, GetHistoryResponse } from '@/features/history/api';
import type { HistorySummary } from '../types';
import { PAGINATION } from '@/shared/config/constants';

interface UseHistoryFetchOptions {
  accessToken: string | null;
  pageSize?: number;
  initialData?: {
    entries: HistorySummary[];
    total: number;
    hasMore: boolean;
    page: number;
  };
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
  initialData,
}: UseHistoryFetchOptions): UseHistoryFetchResult {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state management
  const statusFilter = searchParams?.get('status') || 'all';
  const initialSearchQuery = searchParams?.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Update URL helper - ref to current params to avoid dependency loop
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const currentParams = new URLSearchParams(
        searchParamsRef.current?.toString() || '',
      );
      let changed = false;

      Object.entries(updates).forEach(([key, value]) => {
        const currentValue = currentParams.get(key);
        const newValue = value === 'all' || value === '' ? undefined : value;

        if (newValue === undefined) {
          if (currentParams.has(key)) {
            currentParams.delete(key);
            changed = true;
          }
        } else if (currentValue !== newValue) {
          currentParams.set(key, newValue);
          changed = true;
        }
      });

      if (changed) {
        router.push(`${pathname}?${currentParams.toString()}`, {
          scroll: false,
        });
      }
    },
    [pathname, router],
  );

  const handleStatusFilterChange = useCallback(
    (status: string) => {
      updateParams({ status });
    },
    [updateParams],
  );

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Sync deferred search query to URL - only if it actually changed from current URL
  useEffect(() => {
    const currentUrlSearch = searchParamsRef.current?.get('search') || '';
    if (deferredSearchQuery !== currentUrlSearch) {
      updateParams({ search: deferredSearchQuery });
    }
  }, [deferredSearchQuery, updateParams]);

  const memoizedInitialData = useMemo(() => {
    return initialData ? { pages: [initialData] } : undefined;
  }, [initialData]);

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery<GetHistoryResponse, number>({
    queryKey: ['history', statusFilter, deferredSearchQuery, accessToken],
    queryFn: async ({ pageParam = 0 }) => {
      if (!accessToken)
        return { entries: [], total: 0, hasMore: false, page: 0 };

      return historyApi.getHistory(
        {
          page: pageParam,
          limit: pageSize,
          status: statusFilter,
          search: deferredSearchQuery,
        },
        { token: accessToken },
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: !!accessToken,
    initialData: memoizedInitialData,
    refreshKey: 'history',
  });

  const entries = useMemo(() => {
    return data?.pages.flatMap((page) => page.entries) || [];
  }, [data]);

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
    setSearchQuery: handleSearchQueryChange,
    setStatusFilter: handleStatusFilterChange,
    fetchHistory,
    refresh: refetch,
    loadMore,
  };
}
