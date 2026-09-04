'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { useSoloScoreStore } from '@/features/stats/store/soloScoreStore';
import { newGame, revealCell, toggleFlag } from '../lib/engine';
import type { Difficulty, MinesweeperState } from '../types';

export const MINESWEEPER_GAME_ID = 'minesweeper_v1';

export interface FinishedGameInfo {
  won: boolean;
  /** Seconds elapsed between the first reveal and the final move. */
  durationSeconds: number | null;
}

interface MinesweeperStoreState {
  game: MinesweeperState;
  /** Timestamp of the first reveal — the classic minesweeper clock. */
  startedAt: number | null;
  finishedAt: number | null;
  /** Set once per completed game; consumed by the UI to show the result dialog. */
  finished: FinishedGameInfo | null;
  reveal: (index: number) => void;
  flag: (index: number) => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  newGame: () => void;
}

function finishIfOver(
  game: MinesweeperState,
  startedAt: number | null,
): Pick<MinesweeperStoreState, 'finishedAt' | 'finished'> | null {
  if (game.status === 'playing') return null;

  const finishedAt = Date.now();
  const durationMs = startedAt === null ? 0 : finishedAt - startedAt;
  const sessionId = `ms_${finishedAt}_${Math.random().toString(36).slice(2, 8)}`;

  void useLocalStatsStore.getState().recordGameResult({
    gameId: MINESWEEPER_GAME_ID,
    result: game.status === 'won' ? 'won' : 'lost',
    timestamp: finishedAt,
  });

  useSoloScoreStore.getState().addScore({
    gameId: MINESWEEPER_GAME_ID,
    difficulty: game.difficulty,
    score: durationMs,
    moves: 0,
    durationMs,
    result: game.status === 'won' ? 'won' : 'lost',
    sessionId,
    timestamp: finishedAt,
  });

  return {
    finishedAt,
    finished: {
      won: game.status === 'won',
      durationSeconds:
        startedAt === null ? null : Math.round((finishedAt - startedAt) / 1000),
    },
  };
}

export const useMinesweeperStore = create<MinesweeperStoreState>()(
  persist(
    (set) => ({
      game: newGame('beginner'),
      startedAt: null,
      finishedAt: null,
      finished: null,

      reveal: (index) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          // Engine handles hidden reveals, chords on satisfied numbers,
          // and no-ops (flagged/revealed cells return the same reference).
          const game = revealCell(state.game, index);
          if (game === state.game) return state;
          // The classic clock starts ticking on the very first reveal.
          const startedAt =
            state.startedAt ?? (game.generated ? Date.now() : state.startedAt);
          return {
            game,
            startedAt,
            ...finishIfOver(game, startedAt),
          };
        }),

      flag: (index) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = toggleFlag(state.game, index);
          if (game === state.game) return state;
          return { game };
        }),

      changeDifficulty: (difficulty) =>
        set({
          game: newGame(difficulty),
          startedAt: null,
          finishedAt: null,
          finished: null,
        }),

      newGame: () =>
        set((state) => ({
          game: newGame(state.game.difficulty),
          startedAt: null,
          finishedAt: null,
          finished: null,
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
      }),
    },
  ),
);
