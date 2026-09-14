'use client';

import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { useSoloScoreStore } from '@/features/stats/store/soloScoreStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import type { SoloGameFinishedInfo } from './solo-game-types';

export interface FinishIfOverConfig {
  gameId: string;
  /** Unique session prefix, e.g. 'sol', 'ms', 'sudoku', 'g2048'. */
  sessionPrefix: string;
  /** The difficulty string for this game. */
  difficulty: string;
  /** Whether the game is over. */
  isOver: boolean;
  /** Whether the player won. */
  won: boolean;
  /** Score value (points, duration, etc). */
  score: number;
  /** Number of moves made. */
  moves: number;
  /** Timestamp when the game started. */
  startedAt: number;
  /** Whether undo was used. */
  usedUndo: boolean;
}

export interface FinishIfOverResult {
  finishedAt: number;
  finished: SoloGameFinishedInfo;
}

/**
 * Shared finishIfOver logic: records game result to local stats and solo score
 * stores, returns finished state for the Zustand store.
 */
export function finishIfOver<F = SoloGameFinishedInfo>(
  config: FinishIfOverConfig,
  mapFinished?: (info: SoloGameFinishedInfo) => F,
): { finishedAt: number; finished: F } | null {
  if (!config.isOver) return null;

  const finishedAt = Date.now();
  const durationMs = finishedAt - config.startedAt;
  const userId = useSessionStore.getState().snapshot.userId ?? 'anon';
  const sessionId = `${config.sessionPrefix}_${userId}_${finishedAt}`;

  void useLocalStatsStore.getState().recordGameResult({
    gameId: config.gameId,
    result: config.won ? 'won' : 'lost',
    timestamp: finishedAt,
  });

  useSoloScoreStore.getState().addScore({
    gameId: config.gameId,
    difficulty: config.difficulty,
    score: config.score,
    moves: config.moves,
    durationMs,
    result: config.won ? 'won' : 'lost',
    sessionId,
    timestamp: finishedAt,
    usedUndo: config.usedUndo,
  });

  const info: SoloGameFinishedInfo = {
    won: config.won,
    score: config.score,
    moves: config.moves,
    durationMs,
  };

  return {
    finishedAt,
    finished: mapFinished ? mapFinished(info) : (info as F),
  };
}

/**
 * Common undo reducer logic. Returns the state update object for undo, or null
 * if undo is not possible (empty history or game already finished).
 */
export function undoReducer<T>(
  history: T[],
  finishedAt: number | null,
): {
  history: T[];
  game: T;
  usedUndo: true;
} | null {
  if (history.length === 0 || finishedAt !== null) return null;
  const previousGame = history[history.length - 1];
  return {
    history: history.slice(0, -1),
    game: previousGame,
    usedUndo: true,
  };
}
