'use client';

import type { UseBoundStore, StoreApi } from 'zustand';

interface UndoState {
  history: unknown[];
  finishedAt: number | null;
  undo: () => void;
}

export interface SoloGameUndoResult {
  undo: () => void;
  canUndo: boolean;
}

/**
 * Shared hook that extracts undo capability from any solo game store.
 * Replaces the duplicated pattern across all 4 game hooks:
 *   const undo = useStore(s => s.undo);
 *   const canUndo = useStore(s => s.history.length > 0 && s.finishedAt === null);
 */
export function useSoloGameUndo<T extends UndoState>(
  store: UseBoundStore<StoreApi<T>>,
): SoloGameUndoResult {
  const undo = store((s) => s.undo);
  const canUndo = store((s) => s.history.length > 0 && s.finishedAt === null);
  return { undo, canUndo };
}
