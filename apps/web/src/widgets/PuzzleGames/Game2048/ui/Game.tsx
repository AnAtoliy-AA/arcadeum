'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button, LoadingState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import { Game2048ThemeProvider } from '../lib/Game2048ThemeContext';
import { useGame2048Store } from '../store/game2048Store';
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

  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

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

  const maxTile = useMemo(() => Math.max(0, ...grid), [grid]);

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      score: finished.score,
      turns: finished.moves,
      duration: formatDuration(finished.durationMs),
      customStats: [
        {
          id: 'best-score',
          label: t('games.game_2048_v1.hud.best'),
          value: best,
        },
        {
          id: 'max-tile',
          label: 'Max Tile',
          value: maxTile,
        },
      ],
    };
  }, [finished, best, maxTile, t]);

  const handleCloseModal = useCallback(() => {
    useGame2048Store.setState({ finished: null });
  }, []);

  if (!mounted) {
    return <LoadingState message={t('games.game_2048_v1.board.loading')} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-3">
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3.5 shadow-xl backdrop-blur-md sm:p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatCard
            label={t('games.game_2048_v1.hud.score')}
            value={score}
            dataTestId="game-2048-score"
          />
          <StatCard
            label={t('games.game_2048_v1.hud.best')}
            value={best}
            dataTestId="game-2048-best"
          />
          <StatCard
            label={t('games.game_2048_v1.hud.time')}
            value={formatDuration(elapsedMs)}
            dataTestId="game-2048-timer"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={newGame}
          data-testid="game-2048-new-game-button"
        >
          {t('games.game_2048_v1.hud.newGame')}
        </Button>
      </div>

      <Game2048Board grid={grid} onMove={handleMove} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMove('up')}
            data-testid="pad-up"
          >
            ▲
          </Button>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMove('left')}
            data-testid="pad-left"
          >
            ◀
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMove('down')}
            data-testid="pad-down"
          >
            ▼
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMove('right')}
            data-testid="pad-right"
          >
            ▶
          </Button>
        </div>
        <p className="text-center text-xs text-[var(--textSecondary)]">
          {t('games.game_2048_v1.board.controlsHint')}
        </p>
      </div>

      <GameResultModal
        isOpen={finished !== null}
        result={finished ? (finished.won ? 'victory' : 'defeat') : null}
        gameName="2048"
        onRematch={newGame}
        rematchLabel={t('games.game_2048_v1.result.playAgain')}
        secondaryAction={
          finished?.won
            ? {
                label: t('games.game_2048_v1.result.keepGoing'),
                onClick: continuePlaying,
                testId: 'keep-going-button',
              }
            : undefined
        }
        onClose={handleCloseModal}
        t={t}
        messages={{
          title: t(
            finished?.won
              ? 'games.game_2048_v1.result.wonTitle'
              : 'games.game_2048_v1.result.lostTitle',
          ),
          message: t(
            finished?.won
              ? 'games.game_2048_v1.result.wonBody'
              : 'games.game_2048_v1.result.lostBody',
          ),
        }}
        theme="zen"
        stats={stats}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  dataTestId,
}: {
  label: string;
  value: string | number;
  dataTestId?: string;
}) {
  return (
    <div
      data-testid={dataTestId}
      className="flex flex-col items-center justify-center rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] px-2.5 py-1.5 backdrop-blur-sm sm:px-3 sm:py-2"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
        {label}
      </span>
      <span className="font-mono text-base font-extrabold tabular-nums text-[var(--color)] sm:text-lg">
        {value}
      </span>
    </div>
  );
}
