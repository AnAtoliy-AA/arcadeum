'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { useSoloScoreStore } from '@/features/stats/store/soloScoreStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
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
  /** Set once per completed game; consumed by the UI to show the result dialog. */
  finished: FinishedGameInfo | null;
  move: (direction: Direction) => void;
  continuePlaying: () => void;
  newGame: () => void;
}

function finishIfOver(
  status: 'playing' | 'won' | 'lost',
  score: number,
  moves: number,
  startedAt: number,
  hasEverWon: boolean = false,
): Pick<Game2048StoreState, 'finishedAt' | 'finished'> | null {
  if (status === 'playing') return null;

  const won = status === 'won' || hasEverWon;
  const finishedAt = Date.now();
  const durationMs = finishedAt - startedAt;
  const userId = useSessionStore.getState().snapshot.userId ?? 'anon';
  const sessionId = `g2048_${userId}_${finishedAt}`;

  void useLocalStatsStore.getState().recordGameResult({
    gameId: GAME_2048_ID,
    result: won ? 'won' : 'lost',
    timestamp: finishedAt,
  });

  useSoloScoreStore.getState().addScore({
    gameId: GAME_2048_ID,
    difficulty: 'default',
    score,
    moves,
    durationMs,
    result: won ? 'won' : 'lost',
    sessionId,
    timestamp: finishedAt,
  });

  return {
    finishedAt,
    finished: {
      won,
      score,
      moves,
      durationMs,
    },
  };
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

      move: (direction) => {
        const state = get();
        if (state.status === 'lost') return;

        const effectiveKeepPlaying =
          state.status === 'won' ? true : state.keepPlayingFlag;

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
        set((current) => ({
          grid: next.grid,
          score: next.score,
          status: next.status,
          keepPlayingFlag: next.keepPlaying || effectiveKeepPlaying,
          moves: next.moves,
          best,
          ...(isNewlyFinished
            ? finishIfOver(
                next.status,
                next.score,
                next.moves,
                current.startedAt,
                state.status === 'won' || state.keepPlayingFlag,
              )
            : state.status === 'won' && next.status !== 'lost'
              ? { finished: null, finishedAt: null }
              : null),
        }));
      },

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
      }),
    },
  ),
);
