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
import type {
  Difficulty,
  SudokuHint,
  SudokuInputMode,
  SudokuState,
} from '../types';

export const SUDOKU_GAME_ID = 'sudoku_v1';
export const SUDOKU_MILESTONE_TARGETS = [50, 75] as const;

let milestoneTimer: ReturnType<typeof setTimeout> | null = null;

function clearMilestoneTimer() {
  if (milestoneTimer) {
    clearTimeout(milestoneTimer);
    milestoneTimer = null;
  }
}

function calculateSudokuProgress(game: SudokuState): number {
  let givensCount = 0;
  let correctFilled = 0;
  for (let i = 0; i < 81; i += 1) {
    if (game.givens[i] !== 0) {
      givensCount += 1;
    } else if (game.cells[i] !== 0 && game.cells[i] === game.solution[i]) {
      correctFilled += 1;
    }
  }
  const totalToFill = 81 - givensCount;
  return totalToFill > 0 ? (correctFilled / totalToFill) * 100 : 0;
}

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
  inputMode: SudokuInputMode;
  activeDigit: number | null;
  activeMilestone: number | null;
  reachedMilestones: number[];
  dismissMilestone: () => void;
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
  setInputMode: (mode: SudokuInputMode) => void;
  toggleInputMode: () => void;
  setActiveDigit: (digit: number | null) => void;
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
      inputMode: 'cell_first',
      activeDigit: null,
      activeMilestone: null,
      reachedMilestones: [],

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

          const progress = calculateSudokuProgress(game);
          let activeMilestone = state.activeMilestone;
          let reachedMilestones = state.reachedMilestones;
          if (game.status !== 'won') {
            for (const m of SUDOKU_MILESTONE_TARGETS) {
              if (progress >= m && !reachedMilestones.includes(m)) {
                reachedMilestones = [...reachedMilestones, m];
                activeMilestone = m;
              }
            }
          }

          if (
            activeMilestone !== null &&
            activeMilestone !== state.activeMilestone
          ) {
            clearMilestoneTimer();
            milestoneTimer = setTimeout(() => {
              milestoneTimer = null;
              useSudokuStore.getState().dismissMilestone();
            }, 3500);
          }

          return {
            history: [...state.history, state.game],
            game,
            activeHint: null,
            activeMilestone,
            reachedMilestones,
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
          clearMilestoneTimer();
          const update = undoReducer(state.history, state.finishedAt);
          return update
            ? { ...update, activeHint: null, activeMilestone: null }
            : state;
        }),

      changeDifficulty: (difficulty) => {
        clearMilestoneTimer();
        set({
          game: newGame(difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          activeHint: null,
          activeMilestone: null,
          reachedMilestones: [],
        });
      },

      newGame: () => {
        clearMilestoneTimer();
        set((state) => ({
          game: newGame(state.game.difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          activeHint: null,
          activeMilestone: null,
          reachedMilestones: [],
        }));
      },

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

          const progress = calculateSudokuProgress(game);
          let activeMilestone = state.activeMilestone;
          let reachedMilestones = state.reachedMilestones;
          if (game.status !== 'won') {
            for (const m of SUDOKU_MILESTONE_TARGETS) {
              if (progress >= m && !reachedMilestones.includes(m)) {
                reachedMilestones = [...reachedMilestones, m];
                activeMilestone = m;
              }
            }
          }

          if (
            activeMilestone !== null &&
            activeMilestone !== state.activeMilestone
          ) {
            clearMilestoneTimer();
            milestoneTimer = setTimeout(() => {
              milestoneTimer = null;
              useSudokuStore.getState().dismissMilestone();
            }, 3500);
          }

          return {
            history: [...state.history, state.game],
            game,
            activeHint: null,
            activeMilestone,
            reachedMilestones,
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

      setInputMode: (inputMode) => set({ inputMode }),

      toggleInputMode: () =>
        set((state) => ({
          inputMode:
            state.inputMode === 'cell_first' ? 'digit_first' : 'cell_first',
        })),

      setActiveDigit: (activeDigit) => set({ activeDigit }),

      dismissMilestone: () => {
        clearMilestoneTimer();
        set({ activeMilestone: null });
      },
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
        reachedMilestones: state.reachedMilestones,
      }),
    },
  ),
);
