import { useState, useEffect, useCallback, useRef } from 'react';
import { useRefreshStore } from '@/shared/model/useRefreshStore';

export interface QueryFunctionContext {
  signal: AbortSignal;
}

export interface UseQueryOptions<T> {
  queryKey: (string | number | undefined | null)[];
  queryFn: (ctx: QueryFunctionContext) => Promise<T>;
  enabled?: boolean;
  refreshKey?: string;
  initialData?: T | null; // Added support for initial data from SSR hydration
  refetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  refreshKey,
  initialData,
  refetchOnMount = true,
  onSuccess,
  onError,
}: UseQueryOptions<T>): UseQueryResult<T> {
  // Use initialData if provided, otherwise start as null
  const [data, setData] = useState<T | null>(initialData ?? null);
  // Show loading when enabled and no initialData provided (null or undefined means we need to fetch)
  const [isLoading, setIsLoading] = useState(enabled && initialData == null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store queryFn and callbacks in refs to keep fetchData stable and avoid infinite loops
  const queryFnRef = useRef(queryFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Monitor refresh signals from Zustand
  const refreshSignal = useRefreshStore((state) =>
    refreshKey ? state.getSignal(refreshKey) : 0,
  );
  const lastSignalRef = useRef(refreshSignal);

  const fetchRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (isInitial = false) => {
      // Cancel any previous in-flight request before starting a new one.
      // This prevents React StrictMode's double-invoke from sending duplicate
      // requests to the backend (which cause CORS console errors in dev).
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentFetchId = ++fetchRef.current;
      if (isInitial) {
        if (!dataRef.current) setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      setIsFetching(true);
      setError(null);

      try {
        const result = await queryFnRef.current({ signal: controller.signal });
        if (currentFetchId === fetchRef.current) {
          setData(result);
          onSuccessRef.current?.(result);
        }
      } catch (err) {
        // Silently drop aborted requests — these come from cleanup/StrictMode,
        // not from real errors the user needs to see.
        if (err instanceof Error && err.name === 'AbortError') return;
        if (currentFetchId === fetchRef.current) {
          const formattedError =
            err instanceof Error ? err : new Error(String(err));
          setError(formattedError);
          onErrorRef.current?.(formattedError);
        }
      } finally {
        if (currentFetchId === fetchRef.current) {
          setIsLoading(false);
          setIsFetching(false);
          setIsRefetching(false);
        }
      }
    },
    [], // stable — all external values accessed via refs
  );

  // Determine query key string for effect dependency
  const queryKeyStr = JSON.stringify(queryKey);
  const isFirstMount = useRef(true);
  const prevQueryKeyRef = useRef(queryKeyStr);

  useEffect(() => {
    // If key explicitly changed, reset data and loading state
    if (!isFirstMount.current && prevQueryKeyRef.current !== queryKeyStr) {
      setData(null);
      setIsLoading(true);
    }
    prevQueryKeyRef.current = queryKeyStr;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialData != null && !refetchOnMount) {
        // SSR provided data — we skip the initial client-side fetch only if refetchOnMount is false.
        return;
      }
    }

    const currentFetchRef = fetchRef;

    if (enabled) {
      // If we have data and don't want to refetch on mount, skip.
      // Otherwise (new key, no data, or refetchOnMount is true), proceed to fetch.
      const hasData = dataRef.current != null;
      const isNewKey = prevQueryKeyRef.current !== queryKeyStr;

      if (!isNewKey && hasData && !refetchOnMount) {
        return;
      }

      fetchData(true);
    }

    return () => {
      // Abort the in-flight request and advance the fetch counter so any
      // late-resolving response is treated as stale and discarded.
      abortControllerRef.current?.abort();
      currentFetchRef.current++;
    };
  }, [queryKeyStr, enabled, fetchData, initialData, refetchOnMount]);

  // Handle global refresh trigger
  useEffect(() => {
    if (enabled && refreshKey && refreshSignal !== lastSignalRef.current) {
      lastSignalRef.current = refreshSignal;
      fetchData(false);
    }
  }, [refreshSignal, refreshKey, enabled, fetchData]);

  return {
    data,
    isLoading,
    isFetching,
    isRefetching,
    error,
    refetch: () => fetchData(false),
  };
}
