'use client';

import { useGameSession } from '@/features/games/hooks/useGameSession';
import { useAutoExitFullscreen } from '@/features/games/hooks/useAutoExitFullscreen';
import type { GameSessionSummary } from '@/shared/types/games';

interface AutoExitFullscreenOnFinishProps {
  roomId: string;
  isFullscreen: boolean;
  exitFullscreen: () => void;
  /** Baseline session so an already-finished room never auto-exits on mount. */
  initialSession?: GameSessionSummary | null;
}

/**
 * Renders nothing — it exists only to drive the auto-exit-on-finish behaviour.
 *
 * The reliable client-side "game finished" signal is `session.status`
 * (delivered via `games.session.snapshot`); the room status is NOT pushed to
 * clients on completion. We subscribe to the live session here, isolated in its
 * own component so per-move snapshots don't re-render the whole GamePageLayout
 * (and the game widget) on every turn.
 */
export function AutoExitFullscreenOnFinish({
  roomId,
  isFullscreen,
  exitFullscreen,
  initialSession,
}: AutoExitFullscreenOnFinishProps) {
  const { session } = useGameSession({ roomId, initialSession });

  useAutoExitFullscreen({
    status: session?.status,
    isFullscreen,
    exitFullscreen,
  });

  return null;
}
