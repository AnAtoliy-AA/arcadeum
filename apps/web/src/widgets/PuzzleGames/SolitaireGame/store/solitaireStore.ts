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
  findHint,
  isValidMove,
  nextAutoPlaceAction,
} from '../lib/engine';
import type {
  DrawMode,
  MoveSource,
  MoveTarget,
  SolitaireHint,
  SolitaireState,
} from '../types';

export const SOLITAIRE_GAME_ID = 'solitaire_v1';
export const SOLITAIRE_MILESTONE_TARGETS = [26, 39] as const;

let milestoneTimer: ReturnType<typeof setTimeout> | null = null;

function clearMilestoneTimer() {
  if (milestoneTimer) {
    clearTimeout(milestoneTimer);
    milestoneTimer = null;
  }
}

function calculateFoundationCards(game: SolitaireState): number {
  return game.foundations.reduce((sum, pile) => sum + pile.length, 0);
}

export interface FinishedGameInfo {
  won: boolean;
  score: number;
  moves: number;
  durationMs: number;
}

export type AutoPlaceStepResult = 'move' | 'draw' | null;

interface SolitaireStoreState {
  game: SolitaireState;
  startedAt: number;
  finishedAt: number | null;
  finished: FinishedGameInfo | null;
  history: SolitaireState[];
  usedUndo: boolean;
  activeHint: SolitaireHint | null;
  activeMilestone: number | null;
  reachedMilestones: number[];
  dismissMilestone: () => void;
  draw: () => void;
  move: (source: MoveSource, target: MoveTarget) => void;
  autoPlaceStep: () => AutoPlaceStepResult;
  undo: () => void;
  newGame: () => void;
  setDrawMode: (mode: DrawMode) => void;
  requestHint: () => void;
  clearHint: () => void;
  applyHint: () => void;
}

function commitGame(
  state: SolitaireStoreState,
  game: SolitaireState,
): Partial<SolitaireStoreState> {
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

  const count = calculateFoundationCards(game);
  let activeMilestone = state.activeMilestone;
  let reachedMilestones = state.reachedMilestones;
  if (!outcome.won) {
    for (const m of SOLITAIRE_MILESTONE_TARGETS) {
      if (count >= m && !reachedMilestones.includes(m)) {
        reachedMilestones = [...reachedMilestones, m];
        activeMilestone = m;
      }
    }
  }

  if (activeMilestone !== null && activeMilestone !== state.activeMilestone) {
    clearMilestoneTimer();
    milestoneTimer = setTimeout(() => {
      milestoneTimer = null;
      useSolitaireStore.getState().dismissMilestone();
    }, 3500);
  }

  return {
    history: [...state.history, state.game],
    game,
    activeMilestone,
    reachedMilestones,
    ...(result ?? {}),
  };
}

export const useSolitaireStore = create<SolitaireStoreState>()(
  persist(
    (set, get) => ({
      game: deal(),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,
      activeHint: null,
      activeMilestone: null,
      reachedMilestones: [],

      draw: () =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          const game = drawFromStock(state.game);
          if (game === state.game) return state;
          return {
            ...commitGame(state, game),
            activeHint: null,
          };
        }),

      move: (source, target) =>
        set((state) => {
          if (state.finishedAt !== null) return state;
          if (!isValidMove(state.game, source, target)) return state;
          return {
            ...commitGame(state, applyMove(state.game, source, target)),
            activeHint: null,
          };
        }),

      autoPlaceStep: () => {
        const state = get();
        if (state.finishedAt !== null) return null;
        const action = nextAutoPlaceAction(state.game);
        if (!action) return null;
        if (action.kind === 'draw') {
          const game = drawFromStock(state.game);
          if (game === state.game) return null;
          set({
            ...commitGame(state, game),
            activeHint: null,
          });
          return 'draw';
        }
        if (!isValidMove(state.game, action.source, action.target)) return null;
        set({
          ...commitGame(
            state,
            applyMove(state.game, action.source, action.target),
          ),
          activeHint: null,
        });
        return 'move';
      },

      undo: () =>
        set((state) => {
          clearMilestoneTimer();
          const update = undoReducer(state.history, state.finishedAt);
          return update
            ? { ...update, activeHint: null, activeMilestone: null }
            : state;
        }),

      newGame: () => {
        clearMilestoneTimer();
        set((state) => ({
          game: deal(undefined, state.game.drawMode),
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

      setDrawMode: (mode) =>
        set((state) => ({
          game: { ...state.game, drawMode: mode },
          activeHint: null,
        })),

      requestHint: () => {
        const state = get();
        if (state.finishedAt !== null) return;
        const hint = findHint(state.game);
        set({ activeHint: hint });
      },

      clearHint: () => set({ activeHint: null }),

      applyHint: () => {
        const state = get();
        if (state.activeHint === null || state.finishedAt !== null) return;
        const { source, target } = state.activeHint;
        if (!isValidMove(state.game, source, target)) {
          set({ activeHint: null });
          return;
        }
        const updated = commitGame(
          state,
          applyMove(state.game, source, target),
        );
        set({ ...updated, activeHint: null });
      },

      dismissMilestone: () => {
        clearMilestoneTimer();
        set({ activeMilestone: null });
      },
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
        reachedMilestones: state.reachedMilestones,
      }),
    },
  ),
);
