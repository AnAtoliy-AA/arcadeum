import { renderHook, act } from '@testing-library/react';
import { useServerWakeUpProgress } from './useServerWakeUpProgress';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useServerWakeUpProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates progress over time', () => {
    const { result } = renderHook(() => useServerWakeUpProgress(true));

    expect(result.current.progress).toBe(0);
    expect(result.current.isLongPending).toBe(false);

    // Advance 2 seconds (LONG_PENDING_THRESHOLD_MS)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isLongPending).toBe(true);
    // 2s out of 30s = ~6.6% -> 7%
    expect(result.current.progress).toBeGreaterThan(0);
  });

  it('resets when isBusy becomes false', () => {
    const { result, rerender } = renderHook(
      ({ isBusy }) => useServerWakeUpProgress(isBusy),
      {
        initialProps: { isBusy: true },
      },
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.elapsedSeconds).toBe(5);

    rerender({ isBusy: false });
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.isLongPending).toBe(false);
  });
});
