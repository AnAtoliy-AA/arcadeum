'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseFenPiecePlacement } from '@/features/analysis/lib/fen';
import type { Board, BoardPosition, ChessClientState } from '../types';

export type HistoryStep = 'first' | 'prev' | 'next' | 'last';

/** Index of the move to show: -1 is the start position, null is live. */
export type HistoryViewIndex = number | null;

export function resolveHistoryStep(
  current: HistoryViewIndex,
  totalMoves: number,
  step: HistoryStep,
): HistoryViewIndex {
  if (totalMoves === 0) return null;
  const last = totalMoves - 1;
  const from = current ?? last;
  let next: number;
  if (step === 'first') next = -1;
  else if (step === 'prev') next = Math.max(-1, from - 1);
  else if (step === 'next') next = Math.min(last, from + 1);
  else next = last;
  return next >= last ? null : next;
}

type HistorySnapshot = Pick<
  ChessClientState,
  'moveHistory' | 'positionHistory'
>;

/**
 * Lets players and spectators step through earlier positions of the current
 * game without leaving it. Viewing the latest move is the same as "live".
 */
export function useMoveHistoryView(snapshot: HistorySnapshot | null) {
  const totalMoves = snapshot?.moveHistory.length ?? 0;
  const [viewIndex, setViewIndex] = useState<HistoryViewIndex>(null);

  // A takeback can shrink the history below the viewed index: go live.
  useEffect(() => {
    if (viewIndex !== null && viewIndex >= totalMoves - 1) {
      queueMicrotask(() => setViewIndex(null));
    }
  }, [viewIndex, totalMoves]);

  const step = useCallback(
    (target: HistoryStep) =>
      setViewIndex((cur) => resolveHistoryStep(cur, totalMoves, target)),
    [totalMoves],
  );

  const select = useCallback(
    (index: number) =>
      setViewIndex(index >= totalMoves - 1 ? null : Math.max(-1, index)),
    [totalMoves],
  );

  const goLive = useCallback(() => setViewIndex(null), []);

  const viewedBoard = useMemo<Board | null>(() => {
    if (viewIndex === null || !snapshot) return null;
    const fen = snapshot.positionHistory[viewIndex + 1];
    if (!fen) return null;
    try {
      return parseFenPiecePlacement(fen) as Board;
    } catch {
      return null;
    }
  }, [viewIndex, snapshot]);

  const viewedLastMove = useMemo<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(() => {
    if (viewIndex === null || viewIndex < 0 || !snapshot) return null;
    const move = snapshot.moveHistory[viewIndex];
    return move ? { from: move.from, to: move.to } : null;
  }, [viewIndex, snapshot]);

  const isViewingHistory = viewIndex !== null && viewedBoard !== null;

  return {
    viewIndex: isViewingHistory ? viewIndex : null,
    isViewingHistory,
    viewedBoard: isViewingHistory ? viewedBoard : null,
    viewedLastMove,
    step,
    select,
    goLive,
  };
}
