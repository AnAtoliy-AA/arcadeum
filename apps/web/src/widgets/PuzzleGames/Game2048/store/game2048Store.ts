'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { finishIfOver } from '@/features/games/lib/solo-game-store';
import { move, newGame } from '../lib/engine';
import type { Direction } from '../types';

export const GAME_2048_ID = 'game_2048_v1';

export interface FinishedGameInfo {
  won: boolean;
  score: number;
  moves: number;
  durationMs: number;
}

interface Game2048StoreState {
  grid: number[];
  score: number;
  best: number;
  status: 'playing' | 'won' | 'lost';
  keepPlayingFlag: boolean;
  moves: number;
  startedAt: number;
  finishedAt: number | null;
  finished: FinishedGameInfo | null;
  history: Array<{ grid: number[]; score: number; moves: number }>;
  usedUndo: boolean;
  reachedMilestones: number[];
  activeMilestone: number | null;
  move: (direction: Direction) => void;
  undo: () => void;
  continuePlaying: () => void;
  newGame: () => void;
  dismissMilestone: () => void;
}

export const useGame2048Store = create<Game2048StoreState>()(
  persist(
    (set, get) => ({
      grid: newGame().grid,
      score: 0,
      best: 0,
      status: 'playing',
      keepPlayingFlag: false,
      moves: 0,
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,
      reachedMilestones: [],
      activeMilestone: null,

      move: (direction) => {
        const state = get();
        if (state.status === 'lost') return;
        if (state.status === 'won' && !state.keepPlayingFlag) return;
        if (state.finishedAt !== null) return;

        const effectiveKeepPlaying = state.keepPlayingFlag;

        const next = move(
          {
            grid: state.grid,
            score: state.score,
            status: state.status,
            keepPlaying: effectiveKeepPlaying,
            moves: state.moves,
          },
          direction,
        );
        if (next.grid === state.grid) return;

        const isNewlyFinished =
          (state.status === 'playing' &&
            (next.status === 'won' || next.status === 'lost')) ||
          (state.status === 'won' && next.status === 'lost');

        const best = Math.max(state.best, next.score);
        set((current) => {
          const patch: Partial<Game2048StoreState> = {
            grid: next.grid,
            score: next.score,
            status: next.status,
            keepPlayingFlag: next.keepPlaying || effectiveKeepPlaying,
            moves: next.moves,
            best,
            history: [
              ...current.history,
              {
                grid: current.grid,
                score: current.score,
                moves: current.moves,
              },
            ],
          };

          if (isNewlyFinished) {
            const result = finishIfOver<FinishedGameInfo>(
              {
                gameId: GAME_2048_ID,
                sessionPrefix: 'g2048',
                difficulty: 'default',
                isOver: true,
                won:
                  next.status === 'won' ||
                  state.status === 'won' ||
                  state.keepPlayingFlag,
                score: next.score,
                moves: next.moves,
                startedAt: current.startedAt,
                usedUndo: current.usedUndo,
              },
              (info) => ({
                won: info.won,
                score: info.score,
                moves: info.moves,
                durationMs: info.durationMs,
              }),
            );
            if (result) {
              patch.finishedAt = result.finishedAt;
              patch.finished = result.finished;
            }
          }

          const maxTile = Math.max(0, ...next.grid);
          const milestoneTargets = [1024, 2048, 4096];
          let activeMilestone = current.activeMilestone;
          let reachedMilestones = current.reachedMilestones;
          for (const m of milestoneTargets) {
            if (maxTile >= m && !reachedMilestones.includes(m)) {
              reachedMilestones = [...reachedMilestones, m];
              activeMilestone = m;
            }
          }
          patch.reachedMilestones = reachedMilestones;
          patch.activeMilestone = activeMilestone;

          return patch;
        });
      },

      undo: () =>
        set((state) => {
          if (state.history.length === 0 || state.finishedAt !== null)
            return state;
          const previousState = state.history[state.history.length - 1];
          return {
            history: state.history.slice(0, -1),
            grid: previousState.grid,
            score: previousState.score,
            moves: previousState.moves,
            status: 'playing',
            usedUndo: true,
            activeMilestone: null,
          };
        }),

      continuePlaying: () =>
        set((state) => {
          if (state.status === 'lost') return state;
          return { keepPlayingFlag: true, finished: null, finishedAt: null };
        }),

      newGame: () =>
        set({
          grid: newGame().grid,
          score: 0,
          status: 'playing',
          keepPlayingFlag: false,
          moves: 0,
          startedAt: Date.now(),
          finishedAt: null,
          finished: null,
          history: [],
          usedUndo: false,
          reachedMilestones: [],
          activeMilestone: null,
        }),

      dismissMilestone: () =>
        set({
          activeMilestone: null,
        }),
    }),
    {
      name: 'arcadeum_game_2048_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        grid: state.grid,
        score: state.score,
        best: state.best,
        status: state.status,
        keepPlayingFlag: state.keepPlayingFlag,
        moves: state.moves,
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
