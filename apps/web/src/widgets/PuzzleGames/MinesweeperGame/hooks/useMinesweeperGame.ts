'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMinesweeperStore } from '../store/minesweeperStore';
import { useSoloGame, type SoloGameResult } from '@/shared/hooks/useSoloGame';
import { useSoloGameUndo } from '@/shared/hooks/useSoloGameUndo';
import type { MinesweeperState, Difficulty } from '../types';

export interface MinesweeperGameSpecific {
  finished: { won: boolean; durationSeconds: number | null } | null;
  reveal: (index: number) => void;
  flag: (index: number) => void;
  undo: () => void;
  canUndo: boolean;
  usedUndo: boolean;
  flagMode: boolean;
  setFlagMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  isPressing: boolean;
  setIsPressing: (pressing: boolean) => void;
  minesLeft: number;
  elapsedSeconds: number;
  changeDifficulty: (difficulty: Difficulty) => void;
  handleReveal: (index: number) => void;
  handleFlag: (index: number) => void;
}

export type MinesweeperResult = SoloGameResult<MinesweeperState> & {
  gameSpecific: MinesweeperGameSpecific;
};

const minesweeperSelectors = {
  isRunning: (s: ReturnType<typeof useMinesweeperStore.getState>) =>
    s.startedAt !== null && s.finishedAt === null,
  startedAt: (s: ReturnType<typeof useMinesweeperStore.getState>) =>
    s.startedAt ?? 0,
  finishedAt: (s: ReturnType<typeof useMinesweeperStore.getState>) =>
    s.finishedAt,
  newGame: (s: ReturnType<typeof useMinesweeperStore.getState>) => s.newGame,
  game: (s: ReturnType<typeof useMinesweeperStore.getState>) => s.game,
};

export function useMinesweeperGame(): MinesweeperResult {
  const base = useSoloGame({
    gameId: 'minesweeper_v1',
    store: useMinesweeperStore,
    selectors: minesweeperSelectors,
  });

  const finished = useMinesweeperStore((s) => s.finished);
  const reveal = useMinesweeperStore((s) => s.reveal);
  const flag = useMinesweeperStore((s) => s.flag);
  const { undo, canUndo } = useSoloGameUndo(useMinesweeperStore);
  const usedUndo = useMinesweeperStore((s) => s.usedUndo);
  const changeDifficulty = useMinesweeperStore((s) => s.changeDifficulty);

  const [flagMode, setFlagMode] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const minesLeft = Math.max(base.game.mineCount - base.game.flagCount, 0);

  const elapsedSeconds = useMemo(() => {
    if (
      finished?.durationSeconds !== null &&
      finished?.durationSeconds !== undefined
    ) {
      return finished.durationSeconds;
    }
    if (base.state.startedAt !== null && base.state.finishedAt !== null) {
      return Math.floor((base.state.finishedAt - base.state.startedAt) / 1000);
    }
    return 0;
  }, [finished, base.state.startedAt, base.state.finishedAt]);

  const handleReveal = useCallback(
    (index: number) => {
      if (base.game.status !== 'playing') return;
      base.actions.play('reveal');
      reveal(index);
    },
    [reveal, base.game.status, base.actions],
  );

  const handleFlag = useCallback(
    (index: number) => {
      if (base.game.status !== 'playing') return;
      base.actions.play('flag');
      flag(index);
    },
    [flag, base.game.status, base.actions],
  );

  return useMemo(
    () => ({
      ...base,
      gameSpecific: {
        finished,
        reveal,
        flag,
        undo,
        canUndo,
        usedUndo,
        changeDifficulty,
        flagMode,
        setFlagMode,
        isPressing,
        setIsPressing,
        minesLeft,
        elapsedSeconds,
        handleReveal,
        handleFlag,
      },
    }),
    [
      base,
      finished,
      reveal,
      flag,
      undo,
      canUndo,
      usedUndo,
      changeDifficulty,
      flagMode,
      isPressing,
      minesLeft,
      elapsedSeconds,
      handleReveal,
      handleFlag,
    ],
  );
}
