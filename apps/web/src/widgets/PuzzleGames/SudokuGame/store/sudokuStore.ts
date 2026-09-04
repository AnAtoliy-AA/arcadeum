'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { useSoloScoreStore } from '@/features/stats/store/soloScoreStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
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
  /** Set once per completed game; consumed by the UI to show the result dialog. */
  finished: FinishedGameInfo | null;
  setCell: (index: number, value: number) => void;
  note: (index: number, digit: number) => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  newGame: () => void;
}

function finishIfOver(
  game: SudokuState,
  startedAt: number,
): Pick<SudokuStoreState, 'finishedAt' | 'finished'> | null {
  if (game.status !== 'won') return null;

  const finishedAt = Date.now();
  const durationMs = finishedAt - startedAt;
  const userId = useSessionStore.getState().snapshot.userId ?? 'anon';
  const sessionId = `sudoku_${userId}_${finishedAt}`;

  void useLocalStatsStore.getState().recordGameResult({
    gameId: SUDOKU_GAME_ID,
    result: 'won',
    timestamp: finishedAt,
  });

  useSoloScoreStore.getState().addScore({
    gameId: SUDOKU_GAME_ID,
    difficulty: game.difficulty,
    score: durationMs,
    moves: 0,
    durationMs,
    result: 'won',
    sessionId,
    timestamp: finishedAt,
  });

  return {
    finishedAt,
    finished: {
      mistakes: game.mistakes,
      durationMs,
    },
  };
}

export const useSudokuStore = create<SudokuStoreState>()(
  persist(
    (set) => ({
      game: newGame('easy'),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,

      setCell: (index, value) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = setCellValue(state.game, index, value);
          if (game === state.game) return state;
          return { game, ...finishIfOver(game, state.startedAt) };
        }),

      note: (index, digit) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = toggleNote(state.game, index, digit);
          if (game === state.game) return state;
          return { game };
        }),

      changeDifficulty: (difficulty) =>
        set({
          game: newGame(difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
        }),

      newGame: () =>
        set((state) => ({
          game: newGame(state.game.difficulty),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
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
      }),
    },
  ),
);
