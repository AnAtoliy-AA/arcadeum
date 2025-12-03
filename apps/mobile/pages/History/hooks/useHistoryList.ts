import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchHistory, type FetchHistoryParams, type HistorySummary } from '../api/historyApi';
import { deduplicateHistoryEntries } from '../utils/deduplication';
import type { UseHistoryListParams, UseHistoryListReturn } from '../types';

export function useHistoryList(params: UseHistoryListParams): UseHistoryListReturn {
  const { accessToken, refreshTokens, searchQuery, statusFilter } = params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistorySummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOptions = useMemo(
    () => (refreshTokens ? { refreshTokens } : undefined),
    [refreshTokens],
  );

  const loadHistory = useCallback(
    async (page = 1, append = false) => {
      if (!accessToken) {
        setEntries([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setError(null);
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const historyParams: FetchHistoryParams = {
          page,
          limit: 20,
        };

        if (searchQuery && searchQuery.trim()) {
          historyParams.search = searchQuery.trim();
        }

        if (statusFilter && statusFilter !== 'all') {
          historyParams.status = statusFilter;
        }

        const data = await fetchHistory(accessToken, historyParams, fetchOptions);

        if (append) {
          setEntries((prev) => deduplicateHistoryEntries([...prev, ...data.entries]));
        } else {
          setEntries(deduplicateHistoryEntries(data.entries));
        }

        setHasMore(data.hasMore);
        setCurrentPage(page);
        const totalRecords =
          typeof data.total === 'number' && Number.isFinite(data.total)
            ? data.total
            : data.entries.length;
        setTotalCount(totalRecords);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [accessToken, fetchOptions, searchQuery, statusFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadHistory(1, false);
  }, [loadHistory]);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      setRefreshing(true);
      setCurrentPage(1);
      await loadHistory(1, false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, loadHistory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) {
      return;
    }
    await loadHistory(currentPage + 1, true);
  }, [hasMore, loadingMore, loading, currentPage, loadHistory]);

  const reload = useCallback(() => loadHistory(1, false), [loadHistory]);

  return {
    loading,
    refreshing,
    loadingMore,
    entries,
    error,
    refresh,
    reload,
    loadMore,
    hasMore,
    totalCount,
    fetchOptions,
  };
}
