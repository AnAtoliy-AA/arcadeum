'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  finishIfOver,
  undoReducer,
} from '@/features/games/lib/solo-game-store';
import { newGame, revealCell, toggleFlag } from '../lib/engine';
import type { Difficulty, MinesweeperState } from '../types';

export const MINESWEEPER_GAME_ID = 'minesweeper_v1';

export interface FinishedGameInfo {
  won: boolean;
  durationSeconds: number | null;
}

interface MinesweeperStoreState {
  game: MinesweeperState;
  startedAt: number | null;
  finishedAt: number | null;
  finished: FinishedGameInfo | null;
  history: MinesweeperState[];
  usedUndo: boolean;
  reveal: (index: number) => void;
  flag: (index: number) => void;
  undo: () => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  newGame: () => void;
}

export const useMinesweeperStore = create<MinesweeperStoreState>()(
  persist(
    (set) => ({
      game: newGame('beginner'),
      startedAt: null,
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,

      reveal: (index) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = revealCell(state.game, index);
          if (game === state.game) return state;
          const startedAt =
            state.startedAt ?? (game.generated ? Date.now() : state.startedAt);
          const effectiveStartedAt = startedAt ?? Date.now();
          const isOver = game.status !== 'playing';
          const result = finishIfOver<FinishedGameInfo>(
            {
              gameId: MINESWEEPER_GAME_ID,
              sessionPrefix: 'ms',
              difficulty: game.difficulty,
              isOver,
              won: game.status === 'won',
              score: 0,
              moves: 0,
              startedAt: effectiveStartedAt,
              usedUndo: state.usedUndo,
            },
            (info) => ({
              won: info.won,
              durationSeconds:
                startedAt === null ? null : Math.round(info.durationMs / 1000),
            }),
          );
          return {
            history: [...state.history, state.game],
            game,
            startedAt,
            ...(result ?? {}),
          };
        }),

      flag: (index) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = toggleFlag(state.game, index);
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
          startedAt: null,
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
        }),

      newGame: () =>
        set((state) => ({
          game: newGame(state.game.difficulty),
          startedAt: null,
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
        })),
    }),
    {
      name: 'arcadeum_minesweeper_game_v1',
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
