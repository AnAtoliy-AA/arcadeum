'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSudokuStore } from '../store/sudokuStore';
import { useSoloGame, type SoloGameResult } from '@/shared/hooks/useSoloGame';
import { useSoloGameUndo } from '@/shared/hooks/useSoloGameUndo';
import type { Difficulty, SudokuState } from '../types';

export interface SudokuGameSpecific {
  finished: { durationMs: number; mistakes: number } | null;
  setCell: (index: number, value: number) => void;
  note: (index: number, value: number) => void;
  undo: () => void;
  canUndo: boolean;
  usedUndo: boolean;
  changeDifficulty: (difficulty: Difficulty) => void;
  selected: number | null;
  setSelected: (
    index: number | null | ((prev: number | null) => number | null),
  ) => void;
  notesMode: boolean;
  setNotesMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  applyDigit: (digit: number) => void;
  erase: () => void;
}

export type SudokuResult = SoloGameResult<SudokuState> & {
  gameSpecific: SudokuGameSpecific;
};

const sudokuSelectors = {
  isRunning: (s: ReturnType<typeof useSudokuStore.getState>) =>
    s.finishedAt === null,
  startedAt: (s: ReturnType<typeof useSudokuStore.getState>) => s.startedAt,
  finishedAt: (s: ReturnType<typeof useSudokuStore.getState>) => s.finishedAt,
  newGame: (s: ReturnType<typeof useSudokuStore.getState>) => s.newGame,
  game: (s: ReturnType<typeof useSudokuStore.getState>) => s.game,
};

export function useSudokuGame(): SudokuResult {
  const base = useSoloGame({
    gameId: 'sudoku_v1',
    store: useSudokuStore,
    selectors: sudokuSelectors,
  });

  const finished = useSudokuStore((s) => s.finished);
  const setCell = useSudokuStore((s) => s.setCell);
  const note = useSudokuStore((s) => s.note);
  const { undo, canUndo } = useSoloGameUndo(useSudokuStore);
  const usedUndo = useSudokuStore((s) => s.usedUndo);
  const changeDifficulty = useSudokuStore((s) => s.changeDifficulty);

  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);

  const applyDigit = useCallback(
    (digit: number) => {
      if (selected === null || base.pause.isPaused) return;
      base.actions.play('place_digit');
      if (notesMode) note(selected, digit);
      else setCell(selected, digit);
    },
    [selected, base.pause.isPaused, notesMode, note, setCell, base.actions],
  );

  const erase = useCallback(() => {
    if (selected === null || base.pause.isPaused) return;
    base.actions.play('click');
    setCell(selected, 0);
  }, [selected, base.pause.isPaused, setCell, base.actions]);

  return useMemo(
    () => ({
      ...base,
      gameSpecific: {
        finished,
        setCell,
        note,
        undo,
        canUndo,
        usedUndo,
        changeDifficulty,
        selected,
        setSelected,
        notesMode,
        setNotesMode,
        applyDigit,
        erase,
      },
    }),
    [
      base,
      finished,
      setCell,
      note,
      undo,
      canUndo,
      usedUndo,
      changeDifficulty,
      selected,
      notesMode,
      applyDigit,
      erase,
    ],
  );
}
