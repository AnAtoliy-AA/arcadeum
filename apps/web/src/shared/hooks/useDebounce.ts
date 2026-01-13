import { useEffect, useState } from 'react';

export const DEFAULT_DEBOUNCE_DELAY = 500;

/**
 * A hook that returns a debounced value.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(
  value: T,
  delay: number = DEFAULT_DEBOUNCE_DELAY,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
