'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  finishIfOver,
  undoReducer,
} from '@/features/games/lib/solo-game-store';
import {
  autoFillNotes,
  findHint,
  newGame,
  setCellValue,
  toggleNote,
} from '../lib/engine';
import type { Difficulty, SudokuHint, SudokuState } from '../types';

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
  activeHint: SudokuHint | null;
  highlightErrors: boolean;
  setCell: (index: number, value: number) => void;
  note: (index: number, digit: number) => void;
  undo: () => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  newGame: () => void;
  requestHint: () => void;
  clearHint: () => void;
  applyHint: () => void;
  autoFillNotes: () => void;
  toggleHighlightErrors: () => void;
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
      activeHint: null,
      highlightErrors: true,

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
            activeHint: null,
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
          return update ? { ...update, activeHint: null } : state;
        }),

      changeDifficulty: (difficulty) =>
        set({
          game: newGame(difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          activeHint: null,
        }),

      newGame: () =>
        set((state) => ({
          game: newGame(state.game.difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          activeHint: null,
        })),

      requestHint: () =>
        set((state) => ({
          activeHint: findHint(state.game),
        })),

      clearHint: () =>
        set({
          activeHint: null,
        }),

      applyHint: () =>
        set((state) => {
          if (!state.activeHint || state.finishedAt !== null) return state;
          const { index, digit } = state.activeHint;
          const game = setCellValue(state.game, index, digit);
          if (game === state.game) return { ...state, activeHint: null };
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
            activeHint: null,
            ...(result ?? {}),
          };
        }),

      autoFillNotes: () =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = autoFillNotes(state.game);
          if (game === state.game) return state;
          return {
            history: [...state.history, state.game],
            game,
          };
        }),

      toggleHighlightErrors: () =>
        set((state) => ({
          highlightErrors: !state.highlightErrors,
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
