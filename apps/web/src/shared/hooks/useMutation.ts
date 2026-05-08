import { useState, useCallback } from 'react';

export interface UseMutationOptions<T, V> {
  mutationFn: (variables: V) => Promise<T>;
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  data: T | null;
  error: Error | null;
  isPending: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useMutation<T, V>({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
}: UseMutationOptions<T, V>): UseMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      setIsPending(true);
      setIsError(false);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);
        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const formattedError =
          err instanceof Error ? err : new Error(String(err));
        setError(formattedError);
        setIsError(true);
        onError?.(formattedError, variables);
        onSettled?.(undefined, formattedError, variables);
        throw formattedError;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn, onSuccess, onError, onSettled],
  );

  const mutate = useCallback(
    (variables: V) => {
      mutateAsync(variables).catch(() => {
        // Errors are already handled by internal state and callbacks
      });
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isPending,
    isLoading: isPending,
    isSuccess,
    isError,
    reset,
  };
}
