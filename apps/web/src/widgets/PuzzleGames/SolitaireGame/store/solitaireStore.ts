'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { useSoloScoreStore } from '@/features/stats/store/soloScoreStore';
import {
  applyMove,
  deal,
  draw as drawFromStock,
  evaluateOutcome,
  isValidMove,
} from '../lib/engine';
import type { MoveSource, MoveTarget, SolitaireState } from '../types';

export const SOLITAIRE_GAME_ID = 'solitaire_v1';

export interface FinishedGameInfo {
  won: boolean;
  score: number;
  moves: number;
  durationMs: number;
}

interface SolitaireStoreState {
  game: SolitaireState;
  startedAt: number;
  finishedAt: number | null;
  /** Set once per completed game; consumed by the UI to show the result dialog. */
  finished: FinishedGameInfo | null;
  draw: () => void;
  move: (source: MoveSource, target: MoveTarget) => void;
  newGame: () => void;
}

function finishIfOver(
  game: SolitaireState,
  startedAt: number,
): Pick<SolitaireStoreState, 'finishedAt' | 'finished'> | null {
  const outcome = evaluateOutcome(game);
  if (!outcome.won && !outcome.stuck) return null;

  const finishedAt = Date.now();
  const durationMs = finishedAt - startedAt;
  const sessionId = `sol_${finishedAt}_${Math.random().toString(36).slice(2, 8)}`;
  const won = outcome.won;

  void useLocalStatsStore.getState().recordGameResult({
    gameId: SOLITAIRE_GAME_ID,
    result: won ? 'won' : 'lost',
    timestamp: finishedAt,
  });

  useSoloScoreStore.getState().addScore({
    gameId: SOLITAIRE_GAME_ID,
    difficulty: 'default',
    score: won ? game.score : 0,
    moves: game.moves,
    durationMs,
    result: won ? 'won' : 'lost',
    sessionId,
    timestamp: finishedAt,
  });

  return {
    finishedAt,
    finished: {
      won,
      score: won ? game.score : 0,
      moves: game.moves,
      durationMs,
    },
  };
}

export const useSolitaireStore = create<SolitaireStoreState>()(
  persist(
    (set) => ({
      game: deal(),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,

      draw: () =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = drawFromStock(state.game);
          if (game === state.game) return state;
          return { game, ...finishIfOver(game, state.startedAt) };
        }),

      move: (source, target) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          if (!isValidMove(state.game, source, target)) return state;
          const game = applyMove(state.game, source, target);
          return { game, ...finishIfOver(game, state.startedAt) };
        }),

      newGame: () =>
        set({
          game: deal(),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
        }),
    }),
    {
      name: 'arcadeum_solitaire_game_v1',
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
