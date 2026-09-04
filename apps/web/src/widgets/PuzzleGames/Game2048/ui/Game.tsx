'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import {
  SoloGameContainer,
  StatCard,
  formatDuration,
} from '@/features/games/ui/SoloGameContainer';
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

function Game2048Table() {
  const { t } = useTranslation();
  const grid = useGame2048Store((state) => state.grid);
  const score = useGame2048Store((state) => state.score);
  const best = useGame2048Store((state) => state.best);
  const finished = useGame2048Store((state) => state.finished);
  const startedAt = useGame2048Store((state) => state.startedAt);
  const finishedAt = useGame2048Store((state) => state.finishedAt);
  const move = useGame2048Store((state) => state.move);
  const continuePlaying = useGame2048Store((state) => state.continuePlaying);
  const newGame = useGame2048Store((state) => state.newGame);

  const isRunning = finishedAt === null;

  useEffect(() => {
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
  }, [move]);

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
    (direction: Direction) => move(direction),
    [move],
  );

  const hud = (
    <>
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
          value={formatDuration(finished?.durationMs ?? 0)}
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
    </>
  );

  return (
    <SoloGameContainer
      gameId="game_2048_v1"
      difficulty="default"
      sortBy="score"
      order="desc"
      isRunning={isRunning}
      startedAt={startedAt}
      finishedAt={finishedAt}
      onNewGame={newGame}
      hud={hud}
      loadingMessage="games.game_2048_v1.board.loading"
      modal={{
        result: finished ? (finished.won ? 'victory' : 'defeat') : null,
        gameName: '2048',
        rematchLabel: t('games.game_2048_v1.result.playAgain'),
        theme: 'zen',
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
        secondaryAction: finished?.won
          ? {
              label: t('games.game_2048_v1.result.keepGoing'),
              onClick: continuePlaying,
              testId: 'keep-going-button',
            }
          : undefined,
      }}
    >
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
    </SoloGameContainer>
  );
}
