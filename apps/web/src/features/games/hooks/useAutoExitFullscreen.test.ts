import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useAutoExitFullscreen,
  AUTO_EXIT_FULLSCREEN_DELAY_MS,
} from './useAutoExitFullscreen';

interface Props {
  status: string | undefined;
  isFullscreen: boolean;
}

describe('useAutoExitFullscreen', () => {
  let exitFullscreen: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.useFakeTimers();
    exitFullscreen = vi.fn<() => void>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(initial: Props) {
    return renderHook(
      ({ status, isFullscreen }: Props) =>
        useAutoExitFullscreen({ status, isFullscreen, exitFullscreen }),
      { initialProps: initial },
    );
  }

  it('exits fullscreen after the delay when status transitions to completed', () => {
    const { rerender } = setup({ status: 'in_progress', isFullscreen: true });

    rerender({ status: 'completed', isFullscreen: true });
    expect(exitFullscreen).not.toHaveBeenCalled();

    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).toHaveBeenCalledOnce();
  });

  it('does not exit when not in fullscreen at the moment of finish', () => {
    const { rerender } = setup({ status: 'in_progress', isFullscreen: false });

    rerender({ status: 'completed', isFullscreen: false });
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).not.toHaveBeenCalled();
  });

  it('does not exit when mounted with an already-completed status', () => {
    setup({ status: 'completed', isFullscreen: true });
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).not.toHaveBeenCalled();
  });

  it('fires once per game — re-entering fullscreen after exit does not re-trigger', () => {
    const { rerender } = setup({ status: 'in_progress', isFullscreen: true });

    rerender({ status: 'completed', isFullscreen: true });
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).toHaveBeenCalledOnce();

    // Player manually re-enters fullscreen while still on the finished game
    rerender({ status: 'completed', isFullscreen: false });
    rerender({ status: 'completed', isFullscreen: true });
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).toHaveBeenCalledOnce();
  });

  it('re-arms for a rematch (completed -> lobby -> completed fires again)', () => {
    const { rerender } = setup({ status: 'in_progress', isFullscreen: true });

    rerender({ status: 'completed', isFullscreen: true });
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).toHaveBeenCalledTimes(1);

    rerender({ status: 'lobby', isFullscreen: true });
    rerender({ status: 'in_progress', isFullscreen: true });
    rerender({ status: 'completed', isFullscreen: true });
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).toHaveBeenCalledTimes(2);
  });

  it('cancels the pending timer on unmount', () => {
    const { rerender, unmount } = setup({
      status: 'in_progress',
      isFullscreen: true,
    });

    rerender({ status: 'completed', isFullscreen: true });
    unmount();
    vi.advanceTimersByTime(AUTO_EXIT_FULLSCREEN_DELAY_MS);
    expect(exitFullscreen).not.toHaveBeenCalled();
  });
});
