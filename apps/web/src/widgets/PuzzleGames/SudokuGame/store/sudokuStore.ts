'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  finishIfOver,
  undoReducer,
} from '@/features/games/lib/solo-game-store';
import { newGame, setCellValue, toggleNote } from '../lib/engine';
import type { Difficulty, SudokuState } from '../types';

export const SUDOKU_GAME_ID = 'sudoku_v1';

export interface FinishedGameInfo {
  mistakes: number;
  durationMs: number;
}

interface SudokuStoreState {
  game: SudokuState;
  startedAt: number;
  finishedAt: number | null;
  finished: FinishedGameInfo | null;
  history: SudokuState[];
  usedUndo: boolean;
  setCell: (index: number, value: number) => void;
  note: (index: number, digit: number) => void;
  undo: () => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  newGame: () => void;
}

export const useSudokuStore = create<SudokuStoreState>()(
  persist(
    (set) => ({
      game: newGame('easy'),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,

      setCell: (index, value) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = setCellValue(state.game, index, value);
          if (game === state.game) return state;
          const result = finishIfOver<FinishedGameInfo>(
            {
              gameId: SUDOKU_GAME_ID,
              sessionPrefix: 'sudoku',
              difficulty: game.difficulty,
              isOver: game.status === 'won',
              won: true,
              score: 0,
              moves: 0,
              startedAt: state.startedAt,
              usedUndo: state.usedUndo,
            },
            (info) => ({
              mistakes: game.mistakes,
              durationMs: info.durationMs,
            }),
          );
          return {
            history: [...state.history, state.game],
            game,
            ...(result ?? {}),
          };
        }),

      note: (index, digit) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = toggleNote(state.game, index, digit);
          if (game === state.game) return state;
          return {
            history: [...state.history, state.game],
            game,
          };
        }),

      undo: () =>
        set((state) => {
          const update = undoReducer(state.history, state.finishedAt);
          return update ?? state;
        }),

      changeDifficulty: (difficulty) =>
        set({
          game: newGame(difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
        }),

      newGame: () =>
        set((state) => ({
          game: newGame(state.game.difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
        })),
    }),
    {
      name: 'arcadeum_sudoku_game_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        game: state.game,
        startedAt: state.startedAt,
        finishedAt: state.finishedAt,
        finished: state.finished,
        history: state.history,
        usedUndo: state.usedUndo,
      }),
    },
  ),
);
