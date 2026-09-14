'use client';

import { useCallback, useMemo } from 'react';
import { useGame2048Store } from '../store/game2048Store';
import { useSoloGame, type SoloGameResult } from '@/shared/hooks/useSoloGame';
import { useSoloGameUndo } from '@/shared/hooks/useSoloGameUndo';
import type { Direction } from '../types';

export interface Game2048GameSpecific {
  grid: number[];
  score: number;
  best: number;
  finished: {
    won: boolean;
    score: number;
    moves: number;
    durationMs: number;
  } | null;
  status: string;
  keepPlayingFlag: boolean;
  continuePlaying: () => void;
  handleMove: (direction: Direction) => void;
  undo: () => void;
  canUndo: boolean;
  usedUndo: boolean;
}

export type Game2048Result = SoloGameResult<number[]> & {
  gameSpecific: Game2048GameSpecific;
};

const game2048Selectors = {
  isRunning: (s: ReturnType<typeof useGame2048Store.getState>) =>
    s.finishedAt === null,
  startedAt: (s: ReturnType<typeof useGame2048Store.getState>) => s.startedAt,
  finishedAt: (s: ReturnType<typeof useGame2048Store.getState>) => s.finishedAt,
  newGame: (s: ReturnType<typeof useGame2048Store.getState>) => s.newGame,
  game: (s: ReturnType<typeof useGame2048Store.getState>) => s.grid,
};

export function useGame2048Game(): Game2048Result {
  const base = useSoloGame({
    gameId: 'game_2048_v1',
    store: useGame2048Store,
    selectors: game2048Selectors,
  });

  const score = useGame2048Store((s) => s.score);
  const best = useGame2048Store((s) => s.best);
  const finished = useGame2048Store((s) => s.finished);
  const status = useGame2048Store((s) => s.status);
  const keepPlayingFlag = useGame2048Store((s) => s.keepPlayingFlag);
  const continuePlaying = useGame2048Store((s) => s.continuePlaying);
  const move = useGame2048Store((s) => s.move);
  const { undo, canUndo } = useSoloGameUndo(useGame2048Store);
  const usedUndo = useGame2048Store((s) => s.usedUndo);

  const handleMove = useCallback(
    (direction: Direction) => {
      const prevScore = useGame2048Store.getState().score;
      move(direction);
      const newScore = useGame2048Store.getState().score;
      if (newScore > prevScore) {
        base.actions.play('merge');
      } else {
        base.actions.play('slide_tile');
      }
    },
    [move, base.actions],
  );

  return useMemo(
    () => ({
      ...base,
      gameSpecific: {
        grid: base.game,
        score,
        best,
        finished,
        status,
        keepPlayingFlag,
        continuePlaying,
        handleMove,
        undo,
        canUndo,
        usedUndo,
      },
    }),
    [
      base,
      score,
      best,
      finished,
      status,
      keepPlayingFlag,
      continuePlaying,
      handleMove,
      undo,
      canUndo,
      usedUndo,
    ],
  );
}
