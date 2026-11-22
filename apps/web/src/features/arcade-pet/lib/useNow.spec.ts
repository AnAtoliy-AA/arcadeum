import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNow } from './useNow';

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T23:59:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the current time', () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toBe(Date.parse('2026-01-01T23:59:00Z'));
  });

  it('re-derives on the refresh interval', () => {
    const { result } = renderHook(() => useNow(1000));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(Date.parse('2026-01-01T23:59:02Z'));
  });

  it('re-derives when the window regains focus', () => {
    const { result } = renderHook(() => useNow(60_000));
    vi.setSystemTime(new Date('2026-01-02T00:00:30Z'));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current).toBe(Date.parse('2026-01-02T00:00:30Z'));
  });

  it('re-derives when the tab becomes visible', () => {
    const { result } = renderHook(() => useNow(60_000));
    vi.setSystemTime(new Date('2026-01-02T00:05:00Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(Date.parse('2026-01-02T00:05:00Z'));
  });

  it('removes listeners on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useNow());
    unmount();
    expect(spy).toHaveBeenCalledWith('focus', expect.any(Function));
  });
});
