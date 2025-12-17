import { useState, useCallback, useEffect } from "react";
import { resolveApiUrl } from "@/shared/lib/api-base";
import type { HistorySummary } from "../types";

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
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useHistoryFetch({
  accessToken,
  pageSize = 20,
}: UseHistoryFetchOptions): UseHistoryFetchResult {
  const [entries, setEntries] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchHistory = useCallback(
    async (page = 1, append = false) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const url = resolveApiUrl(`/games/history?${params.toString()}`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();
        const newEntries = data.entries || [];

        // Deduplicate entries by roomId
        const deduplicate = (items: HistorySummary[]) => {
          const seen = new Set<string>();
          return items.filter((item) => {
            if (seen.has(item.roomId)) {
              return false;
            }
            seen.add(item.roomId);
            return true;
          });
        };

        if (append) {
          setEntries((prev) => deduplicate([...prev, ...newEntries]));
        } else {
          setEntries(deduplicate(newEntries));
        }

        setCurrentPage(page);
        const nextHasMore =
          typeof data.hasMore === "boolean"
            ? data.hasMore
            : newEntries.length === pageSize;
        setHasMore(nextHasMore);
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
    [accessToken, pageSize, searchQuery, statusFilter]
  );

  const refresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setRefreshing(true);
    setCurrentPage(1);
    await fetchHistory(1, false);
    setRefreshing(false);
  }, [accessToken, fetchHistory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing || loadingMore) {
      return;
    }
    await fetchHistory(currentPage + 1, true);
  }, [hasMore, loading, refreshing, loadingMore, currentPage, fetchHistory]);

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(1, false);
  }, [fetchHistory]);

  return {
    entries,
    loading,
    refreshing,
    error,
    hasMore,
    loadingMore,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    fetchHistory,
    refresh,
    loadMore,
  };
}
