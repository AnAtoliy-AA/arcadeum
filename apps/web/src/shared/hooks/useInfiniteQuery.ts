import { useState, useEffect, useCallback, useRef } from 'react';
import { useRefreshStore } from '@/shared/model/useRefreshStore';

interface UseInfiniteQueryOptions<T, P = unknown> {
  queryKey: (string | number | undefined | null)[];
  queryFn: (ctx: { pageParam: P; signal: AbortSignal }) => Promise<T>;
  initialPageParam: P;
  getNextPageParam: (lastPage: T, allPages: T[]) => P | undefined;
  enabled?: boolean;
  refreshKey?: string;
  initialData?: { pages: T[] } | null;
  refetchOnMount?: boolean;
}

interface UseInfiniteQueryResult<T> {
  data: { pages: T[] } | null;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInfiniteQuery<T, P = unknown>({
  queryKey,
  queryFn,
  initialPageParam,
  getNextPageParam,
  enabled = true,
  refreshKey,
  initialData,
  refetchOnMount = true,
}: UseInfiniteQueryOptions<T, P>): UseInfiniteQueryResult<T> {
  // Use initialData if provided, otherwise start empty
  const [pages, setPages] = useState<T[]>(initialData?.pages || []);
  // Show loading when enabled and no initialData provided (null or undefined means we need to fetch)
  const [isLoading, setIsLoading] = useState(enabled && initialData == null);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize nextPageParam based on initialData
  const [nextPageParam, setNextPageParam] = useState<P | undefined>(() => {
    if (initialData && initialData.pages.length > 0) {
      return getNextPageParam(
        initialData.pages[initialData.pages.length - 1],
        initialData.pages,
      ) as P;
    }
    return initialPageParam;
  });

  const [hasNextPage, setHasNextPage] = useState(() => {
    if (initialData && initialData.pages.length > 0) {
      return (
        getNextPageParam(
          initialData.pages[initialData.pages.length - 1],
          initialData.pages,
        ) !== undefined
      );
    }
    return true;
  });

  // Monitor refresh signals from Zustand
  const refreshSignal = useRefreshStore((state) =>
    refreshKey ? state.getSignal(refreshKey) : 0,
  );
  const lastSignalRef = useRef(refreshSignal);

  const fetchRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryFnRef = useRef(queryFn);
  const getNextPageParamRef = useRef(getNextPageParam);
  const nextPageParamRef = useRef(nextPageParam);
  const initialPageParamRef = useRef(initialPageParam);
  const pagesRef = useRef(pages);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);
  useEffect(() => {
    getNextPageParamRef.current = getNextPageParam;
  }, [getNextPageParam]);
  useEffect(() => {
    nextPageParamRef.current = nextPageParam;
  }, [nextPageParam]);
  useEffect(() => {
    initialPageParamRef.current = initialPageParam;
  }, [initialPageParam]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const fetchData = useCallback(
    async (isInitial = false, isNextPage = false) => {
      // Cancel any previous in-flight request before starting a new one.
      // This prevents React StrictMode's double-invoke from sending duplicate
      // requests to the backend (which cause CORS console errors in dev).
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentFetchId = ++fetchRef.current;
      const paramToUse =
        isInitial || !isNextPage
          ? initialPageParamRef.current
          : nextPageParamRef.current;

      if (isInitial) {
        if (pagesRef.current.length === 0) setIsLoading(true);
      } else if (!isNextPage) {
        setIsRefetching(true);
      }

      if (isNextPage) setIsFetchingNextPage(true);
      setIsFetching(true);
      setError(null);

      try {
        const result = await queryFnRef.current({
          pageParam: paramToUse as P,
          signal: controller.signal,
        });

        if (currentFetchId === fetchRef.current) {
          const nextParam = getNextPageParamRef.current(result, [
            ...(isNextPage ? pagesRef.current : []),
            result,
          ]);

          setNextPageParam(nextParam);
          setHasNextPage(nextParam !== undefined);

          setPages((prevPages) => {
            return isNextPage ? [...prevPages, result] : [result];
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (currentFetchId === fetchRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (currentFetchId === fetchRef.current) {
          setIsLoading(false);
          setIsFetching(false);
          setIsRefetching(false);
          setIsFetchingNextPage(false);
        }
      }
    },
    [], // Stable: all values accessed via refs
  );

  const queryKeyStr = JSON.stringify(queryKey);
  const isFirstMount = useRef(true);
  const prevQueryKeyRef = useRef(queryKeyStr);

  useEffect(() => {
    const isNewKey = prevQueryKeyRef.current !== queryKeyStr;
    const isInitialMount = isFirstMount.current;

    // If key explicitly changed, reset data and loading state
    if (!isInitialMount && isNewKey) {
      setPages(initialData?.pages || []);
      setIsLoading(enabled && initialData == null);
      setNextPageParam(() => {
        if (initialData && initialData.pages.length > 0) {
          return getNextPageParamRef.current(
            initialData.pages[initialData.pages.length - 1],
            initialData.pages,
          ) as P;
        }
        return initialPageParam;
      });
      setHasNextPage(() => {
        if (initialData && initialData.pages.length > 0) {
          return (
            getNextPageParamRef.current(
              initialData.pages[initialData.pages.length - 1],
              initialData.pages,
            ) !== undefined
          );
        }
        return true;
      });
    }

    prevQueryKeyRef.current = queryKeyStr;

    if (isInitialMount) {
      isFirstMount.current = false;
      if (initialData != null && !refetchOnMount) {
        // SSR provided data — we skip the initial client-side fetch to avoid redundant requests
        // only if refetchOnMount is explicitly disabled.
        return;
      }
    }

    const currentFetchRef = fetchRef;

    if (enabled) {
      // If we have initial data (from SSR or current state) and it's the first fetch for this key
      const hasDataForThisKey = pagesRef.current.length > 0;
      const isFirstFetchForKey = currentFetchRef.current === 0 || isNewKey;

      if (isFirstFetchForKey && hasDataForThisKey && !refetchOnMount) {
        // Already have data (e.g. from mount or key change reset) and don't want to refetch
        return;
      }

      // If it's a new key OR we have no data OR we want to refetch on mount, perform a fetch
      if (isNewKey || !hasDataForThisKey || refetchOnMount) {
        fetchData(true);
      }
    } else {
      setNextPageParam(initialPageParam);
      setHasNextPage(true);
    }

    return () => {
      abortControllerRef.current?.abort();
      currentFetchRef.current++;
    };
  }, [
    queryKeyStr,
    enabled,
    fetchData,
    initialPageParam,
    initialData,
    refetchOnMount,
  ]);

  useEffect(() => {
    if (enabled && refreshKey && refreshSignal !== lastSignalRef.current) {
      lastSignalRef.current = refreshSignal;
      fetchData(true);
    }
  }, [refreshSignal, refreshKey, enabled, fetchData]);

  return {
    data: pages.length > 0 ? { pages } : null,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isRefetching,
    error,
    hasNextPage,
    fetchNextPage: () =>
      hasNextPage && !isFetching ? fetchData(false, true) : Promise.resolve(),
    refetch: () => fetchData(true),
  };
}
