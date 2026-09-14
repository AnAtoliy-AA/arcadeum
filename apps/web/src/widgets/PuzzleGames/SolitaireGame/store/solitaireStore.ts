'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  finishIfOver,
  undoReducer,
} from '@/features/games/lib/solo-game-store';
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
  finished: FinishedGameInfo | null;
  history: SolitaireState[];
  usedUndo: boolean;
  draw: () => void;
  move: (source: MoveSource, target: MoveTarget) => void;
  undo: () => void;
  newGame: () => void;
}

export const useSolitaireStore = create<SolitaireStoreState>()(
  persist(
    (set) => ({
      game: deal(),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,

      draw: () =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = drawFromStock(state.game);
          if (game === state.game) return state;
          const outcome = evaluateOutcome(game);
          const result = finishIfOver({
            gameId: SOLITAIRE_GAME_ID,
            sessionPrefix: 'sol',
            difficulty: 'default',
            isOver: outcome.won || outcome.stuck,
            won: outcome.won,
            score: outcome.won ? game.score : 0,
            moves: game.moves,
            startedAt: state.startedAt,
            usedUndo: state.usedUndo,
          });
          return {
            history: [...state.history, state.game],
            game,
            ...(result ?? {}),
          };
        }),

      move: (source, target) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          if (!isValidMove(state.game, source, target)) return state;
          const game = applyMove(state.game, source, target);
          const outcome = evaluateOutcome(game);
          const result = finishIfOver({
            gameId: SOLITAIRE_GAME_ID,
            sessionPrefix: 'sol',
            difficulty: 'default',
            isOver: outcome.won || outcome.stuck,
            won: outcome.won,
            score: outcome.won ? game.score : 0,
            moves: game.moves,
            startedAt: state.startedAt,
            usedUndo: state.usedUndo,
          });
          return {
            history: [...state.history, state.game],
            game,
            ...(result ?? {}),
          };
        }),

      undo: () =>
        set((state) => {
          const update = undoReducer(state.history, state.finishedAt);
          return update ?? state;
        }),

      newGame: () =>
        set({
          game: deal(),
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
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
        history: state.history,
        usedUndo: state.usedUndo,
      }),
    },
  ),
);
