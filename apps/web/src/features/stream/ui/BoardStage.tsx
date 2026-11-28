'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { STREAM_BOARD_DESIGN } from '../lib/gameLayout';
import { ActiveEmotesProvider } from '@/features/games/ui/GameWidgetContainer';
import { GameWidgetErrorBoundary } from '@/features/games/ui/GameWidgetErrorBoundary';
import { getStreamGameLayout } from '../lib/gameLayout';

const RETRY_MS = 3000;

/**
 * Hosts a game widget inside the board panel. The widget is laid out on a
 * fixed design canvas (the board panel at 1920x1080) and the canvas is scaled
 * to fit the real panel, so 1280x720 and 1920x1080 captures look identical
 * apart from sharpness, whatever each widget's internal breakpoints do. Also
 * applies the per-game scale,
 * marks the viewer as a spectator, and self-heals if the widget crashes
 * (re-mounts it after a short pause instead of showing an error screen).
 */
export function BoardStage({
  gameId,
  roomKey,
  children,
}: {
  gameId: string;
  roomKey: string;
  children: ReactNode;
}) {
  const { scale } = getStreamGameLayout(gameId);
  const [attempt, setAttempt] = useState(0);
  const retryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hostRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<number | null>(null);

  useEffect(() => () => clearTimeout(retryRef.current), []);

  // Fit the fixed design canvas into whatever size the panel has. Observed,
  // not polled: it only runs when the panel is resized.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const measure = () => {
      if (host.clientWidth === 0 || host.clientHeight === 0) return;
      setFit(
        Math.min(
          host.clientWidth / STREAM_BOARD_DESIGN.width,
          host.clientHeight / STREAM_BOARD_DESIGN.height,
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      data-testid="board-stage"
      data-game-id={gameId}
      className="absolute inset-0"
    >
      <div
        className="absolute left-1/2 top-1/2 flex flex-col"
        style={{
          width: STREAM_BOARD_DESIGN.width / scale,
          height: STREAM_BOARD_DESIGN.height / scale,
          transform: `translate(-50%, -50%) scale(${(fit ?? 1) * scale})`,
          visibility: fit === null ? 'hidden' : 'visible',
        }}
      >
        <ActiveEmotesProvider value={{ emotes: [], isSpectating: true }}>
          <GameWidgetErrorBoundary
            resetKey={`${roomKey}:${attempt}`}
            fallback={<div data-testid="board-stage-fallback" />}
            onError={() => {
              clearTimeout(retryRef.current);
              retryRef.current = setTimeout(
                () => setAttempt((n) => n + 1),
                RETRY_MS,
              );
            }}
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </GameWidgetErrorBoundary>
        </ActiveEmotesProvider>
      </div>
    </div>
  );
}
