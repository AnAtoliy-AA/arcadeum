'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import {
  SoloGameContainer,
  formatDuration,
  useSoloTimer,
  useSoloPause,
  SoloActionButton,
} from '@/features/games/ui/SoloGameContainer';
import { useSoloTheme } from '@/features/games/store/soloThemeStore';
import { Game2048ThemeProvider } from '../lib/Game2048ThemeContext';
import { useGame2048Store } from '../store/game2048Store';
import type { Direction } from '../types';
import { Game2048Board } from './Game2048Board';

export default function Game2048() {
  useTrackSoloGameStarted('game_2048_v1');
  const { themeId } = useSoloTheme('game_2048_v1');
  return (
    <Game2048ThemeProvider variant={themeId}>
      <Game2048Table />
    </Game2048ThemeProvider>
  );
}

function Game2048Table() {
  const { t } = useTranslation();
  const { themeId } = useSoloTheme('game_2048_v1');
  const grid = useGame2048Store((state) => state.grid);
  const score = useGame2048Store((state) => state.score);
  const best = useGame2048Store((state) => state.best);
  const finished = useGame2048Store((state) => state.finished);
  const status = useGame2048Store((state) => state.status);
  const keepPlayingFlag = useGame2048Store((state) => state.keepPlayingFlag);
  const startedAt = useGame2048Store((state) => state.startedAt);
  const finishedAt = useGame2048Store((state) => state.finishedAt);
  const move = useGame2048Store((state) => state.move);
  const continuePlaying = useGame2048Store((state) => state.continuePlaying);
  const newGame = useGame2048Store((state) => state.newGame);

  const isRunning = finishedAt === null;
  const pause = useSoloPause(isRunning, finishedAt);
  const timer = useSoloTimer(isRunning, startedAt, pause.isPaused);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (pause.isPaused) return;
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
  }, [move, pause.isPaused]);

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

  const handleMove = useCallback(
    (direction: Direction) => {
      if (pause.isPaused) return;
      move(direction);
    },
    [move, pause.isPaused],
  );

  const statsItems = [
    {
      id: 'score',
      label: t('games.game_2048_v1.hud.score'),
      value: score,
      icon: '🎯',
      dataTestId: 'game-2048-score',
    },
    {
      id: 'best',
      label: t('games.game_2048_v1.hud.best'),
      value: best,
      icon: '🏆',
      dataTestId: 'game-2048-best',
    },
    {
      id: 'time',
      label: t('games.game_2048_v1.hud.time'),
      value: timer.formatted,
      icon: '⏱️',
      dataTestId: 'game-2048-timer',
    },
  ];

  const actions = (
    <SoloActionButton
      onClick={newGame}
      dataTestId="game-2048-new-game-button"
      icon="🔄"
    >
      {t('games.game_2048_v1.hud.newGame')}
    </SoloActionButton>
  );

  return (
    <SoloGameContainer
      gameId="game_2048_v1"
      difficulty="default"
      sortBy="score"
      order="desc"
      pause={pause}
      isRunning={isRunning}
      startedAt={startedAt}
      finishedAt={finishedAt}
      onNewGame={newGame}
      statsItems={statsItems}
      actions={actions}
      loadingMessage="games.game_2048_v1.board.loading"
      modal={{
        result: finished ? (finished.won ? 'victory' : 'defeat') : null,
        gameName: '2048',
        rematchLabel: t('games.game_2048_v1.result.playAgain'),
        theme: themeId,
        stats,
        messages: {
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
        },
        secondaryAction:
          finished?.won && status !== 'lost' && !keepPlayingFlag
            ? {
                label: t('games.game_2048_v1.result.keepGoing'),
                onClick: continuePlaying,
                testId: 'keep-going-button',
              }
            : undefined,
        onClose: status === 'won' ? continuePlaying : undefined,
      }}
    >
      <Game2048Board grid={grid} onMove={handleMove} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1 sm:hidden select-none">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <button
              type="button"
              onClick={() => handleMove('up')}
              data-testid="pad-up"
              aria-label="Move Up"
              className="absolute top-0 h-10 w-10 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex items-center justify-center text-sm font-bold shadow-md active:scale-90 active:bg-[var(--primary)]/20 active:border-[var(--primary)] transition-transform"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleMove('left')}
              data-testid="pad-left"
              aria-label="Move Left"
              className="absolute left-0 h-10 w-10 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex items-center justify-center text-sm font-bold shadow-md active:scale-90 active:bg-[var(--primary)]/20 active:border-[var(--primary)] transition-transform"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => handleMove('down')}
              data-testid="pad-down"
              aria-label="Move Down"
              className="absolute bottom-0 h-10 w-10 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex items-center justify-center text-sm font-bold shadow-md active:scale-90 active:bg-[var(--primary)]/20 active:border-[var(--primary)] transition-transform"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => handleMove('right')}
              data-testid="pad-right"
              aria-label="Move Right"
              className="absolute right-0 h-10 w-10 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex items-center justify-center text-sm font-bold shadow-md active:scale-90 active:bg-[var(--primary)]/20 active:border-[var(--primary)] transition-transform"
            >
              ▶
            </button>
            <div className="h-5 w-5 rounded-full bg-[var(--backgroundHover)]" />
          </div>
          <p className="text-center text-xs text-[var(--textSecondary)]">
            {t('games.game_2048_v1.board.controlsHint')}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--textSecondary)]">
          <div className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              W
            </kbd>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              A
            </kbd>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              S
            </kbd>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              D
            </kbd>
            <span className="px-1 text-[var(--textSecondary)]">or</span>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              ↑
            </kbd>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              ←
            </kbd>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              ↓
            </kbd>
            <kbd className="rounded border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color)] shadow-sm">
              →
            </kbd>
          </div>
          <span>to slide</span>
        </div>
      </div>
    </SoloGameContainer>
  );
}
