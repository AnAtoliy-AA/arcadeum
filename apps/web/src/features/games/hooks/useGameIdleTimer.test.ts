import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameIdleTimer } from './useGameIdleTimer';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';

describe('useGameIdleTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is inactive when disabled', () => {
    const { result } = renderHook(() =>
      useGameIdleTimer({
        enabled: false,
        isMyTurn: true,
        canAct: true,
        onTimeout: vi.fn(),
      }),
    );
    expect(result.current.isActive).toBe(false);
    expect(result.current.isRunning).toBe(false);
  });

  it('counts down while it is the player turn and they can act', () => {
    const { result } = renderHook(() =>
      useGameIdleTimer({
        enabled: true,
        isMyTurn: true,
        canAct: true,
        onTimeout: vi.fn(),
      }),
    );
    expect(result.current.secondsRemaining).toBe(IDLE_TIMER_DURATION_SEC);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsRemaining).toBe(IDLE_TIMER_DURATION_SEC - 3);
  });

  it('fires onTimeout once when the timer reaches zero', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useGameIdleTimer({
        enabled: true,
        isMyTurn: true,
        canAct: true,
        onTimeout,
      }),
    );
    act(() => {
      vi.advanceTimersByTime(IDLE_TIMER_DURATION_SEC * 1000 + 5000);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(result.current.secondsRemaining).toBe(0);
  });

  it('stops counting when it is not the player turn', () => {
    const onTimeout = vi.fn();
    const { result, rerender } = renderHook(
      (props) => useGameIdleTimer(props),
      {
        initialProps: {
          enabled: true,
          isMyTurn: true,
          canAct: true,
          onTimeout,
        },
      },
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const before = result.current.secondsRemaining;
    rerender({ enabled: true, isMyTurn: false, canAct: true, onTimeout });
    expect(result.current.isRunning).toBe(false);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsRemaining).toBe(before);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
