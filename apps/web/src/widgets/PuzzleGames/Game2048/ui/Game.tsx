'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Button, LoadingState, Modal } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { Game2048ThemeProvider } from '../lib/Game2048ThemeContext';
import {
  useGame2048Store,
  type FinishedGameInfo,
} from '../store/game2048Store';
import type { Direction } from '../types';
import { Game2048Board } from './Game2048Board';

export default function Game2048() {
  useTrackSoloGameStarted('game_2048_v1');
  return (
    <Game2048ThemeProvider>
      <Game2048Table />
    </Game2048ThemeProvider>
  );
}

function subscribeNoop(): () => void {
  return () => undefined;
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function Game2048Table() {
  const { t } = useTranslation();
  const grid = useGame2048Store((state) => state.grid);
  const score = useGame2048Store((state) => state.score);
  const best = useGame2048Store((state) => state.best);
  const finished = useGame2048Store((state) => state.finished);
  const startedAt = useGame2048Store((state) => state.startedAt);
  const move = useGame2048Store((state) => state.move);
  const continuePlaying = useGame2048Store((state) => state.continuePlaying);
  const newGame = useGame2048Store((state) => state.newGame);

  // The board is random and persisted, so it can only render after mount —
  // otherwise SSR markup (fresh board on the server) never matches the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Arrow keys / WASD drive the board.
  useEffect(() => {
    if (!mounted) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      };
      const direction = keyMap[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mounted, move]);

  // Elapsed timer; ticks until the game finishes.
  const [elapsedMs, setElapsedMs] = useState(0);
  const isRunning = mounted && finished === null;
  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(
      () => setElapsedMs(Date.now() - startedAt),
      1000,
    );
    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const handleMove = useCallback(
    (direction: Direction) => move(direction),
    [move],
  );

  if (!mounted) {
    return <LoadingState message={t('games.game_2048_v1.board.loading')} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-sm">
          <Stat label={t('games.game_2048_v1.hud.score')} value={score} />
          <Stat label={t('games.game_2048_v1.hud.best')} value={best} />
          <Stat
            label={t('games.game_2048_v1.hud.time')}
            value={formatDuration(elapsedMs)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={newGame}>
          {t('games.game_2048_v1.hud.newGame')}
        </Button>
      </div>

      <Game2048Board grid={grid} onMove={handleMove} />

      <p className="text-center text-xs opacity-60">
        {t('games.game_2048_v1.board.controlsHint')}
      </p>

      <ResultDialog
        finished={finished}
        onNewGame={newGame}
        onContinue={continuePlaying}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide opacity-60">
        {label}
      </span>
      <span className="font-mono text-lg font-bold leading-tight">{value}</span>
    </span>
  );
}

function ResultDialog({
  finished,
  onNewGame,
  onContinue,
}: {
  finished: FinishedGameInfo | null;
  onNewGame: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  if (!finished) return null;

  return (
    <Modal open onClose={() => undefined}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <h2 className="text-2xl font-black">
          {t(
            finished.won
              ? 'games.game_2048_v1.result.wonTitle'
              : 'games.game_2048_v1.result.lostTitle',
          )}
        </h2>
        <p className="text-sm opacity-80">
          {t(
            finished.won
              ? 'games.game_2048_v1.result.wonBody'
              : 'games.game_2048_v1.result.lostBody',
          )}
        </p>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="opacity-60">{t('games.game_2048_v1.hud.score')}</dt>
            <dd className="font-mono text-lg">{finished.score}</dd>
          </div>
          <div>
            <dt className="opacity-60">
              {t('games.game_2048_v1.hud.movesLabel')}
            </dt>
            <dd className="font-mono text-lg">{finished.moves}</dd>
          </div>
          <div>
            <dt className="opacity-60">{t('games.game_2048_v1.hud.time')}</dt>
            <dd className="font-mono text-lg">
              {formatDuration(finished.durationMs)}
            </dd>
          </div>
        </dl>
        <div className="flex gap-3">
          {finished.won && (
            <Button variant="outline" onClick={onContinue}>
              {t('games.game_2048_v1.result.keepGoing')}
            </Button>
          )}
          <Button onClick={onNewGame}>
            {t('games.game_2048_v1.result.playAgain')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
