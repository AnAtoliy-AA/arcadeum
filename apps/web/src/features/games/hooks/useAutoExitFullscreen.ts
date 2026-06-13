import { useEffect, useRef } from 'react';

/**
 * Delay between a game finishing and the page leaving fullscreen. Gives the
 * player a brief moment to see the final board before the view collapses back
 * to the normal page chrome (the game-over result modal still shows).
 */
export const AUTO_EXIT_FULLSCREEN_DELAY_MS = 1500;

interface UseAutoExitFullscreenOptions {
  /** Current room status — `'completed'` marks the game as finished. */
  status: string | undefined;
  /** Whether the page is currently in the CSS fullscreen mode. */
  isFullscreen: boolean;
  /** Leaves fullscreen. Should be a stable callback (e.g. from useFullscreen). */
  exitFullscreen: () => void;
  /** Override the auto-exit delay (primarily for tests). */
  delayMs?: number;
}

/**
 * Auto-exits fullscreen a short moment after a game finishes.
 *
 * Fires only on the transition into `'completed'` (not on the steady completed
 * state), so it triggers once per game: re-entering fullscreen afterward stays,
 * joining an already-finished room never triggers it, and a rematch
 * (completed -> lobby -> completed) naturally re-arms. Only exits if the page
 * was actually in fullscreen when the game finished.
 */
export function useAutoExitFullscreen({
  status,
  isFullscreen,
  exitFullscreen,
  delayMs = AUTO_EXIT_FULLSCREEN_DELAY_MS,
}: UseAutoExitFullscreenOptions): void {
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    const justFinished = prevStatus !== 'completed' && status === 'completed';
    if (!justFinished || !isFullscreen) return;

    const timer = setTimeout(exitFullscreen, delayMs);
    return () => clearTimeout(timer);
  }, [status, isFullscreen, exitFullscreen, delayMs]);
}
