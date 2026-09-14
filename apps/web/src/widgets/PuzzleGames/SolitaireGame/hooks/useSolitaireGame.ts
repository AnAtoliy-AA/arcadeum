'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSolitaireStore } from '../store/solitaireStore';
import { useSoloGame, type SoloGameResult } from '@/shared/hooks/useSoloGame';
import { useSoloGameUndo } from '@/shared/hooks/useSoloGameUndo';
import type { MoveSource, MoveTarget, SolitaireState } from '../types';

export interface SolitaireGameSpecific {
  finished: {
    won: boolean;
    score: number;
    moves: number;
    durationMs: number;
  } | null;
  draw: () => void;
  move: (source: MoveSource, target: MoveTarget) => void;
  selection: MoveSource | null;
  setSelection: (selection: MoveSource | null) => void;
  handleDraw: () => void;
  handleMove: (source: MoveSource, target: MoveTarget) => void;
  undo: () => void;
  canUndo: boolean;
  usedUndo: boolean;
}

export type SolitaireResult = SoloGameResult<SolitaireState> & {
  gameSpecific: SolitaireGameSpecific;
};

const solitaireSelectors = {
  isRunning: (s: ReturnType<typeof useSolitaireStore.getState>) =>
    s.finishedAt === null,
  startedAt: (s: ReturnType<typeof useSolitaireStore.getState>) => s.startedAt,
  finishedAt: (s: ReturnType<typeof useSolitaireStore.getState>) =>
    s.finishedAt,
  newGame: (s: ReturnType<typeof useSolitaireStore.getState>) => s.newGame,
  game: (s: ReturnType<typeof useSolitaireStore.getState>) => s.game,
};

export function useSolitaireGame(): SolitaireResult {
  const base = useSoloGame({
    gameId: 'solitaire_v1',
    store: useSolitaireStore,
    selectors: solitaireSelectors,
  });

  const finished = useSolitaireStore((s) => s.finished);
  const draw = useSolitaireStore((s) => s.draw);
  const move = useSolitaireStore((s) => s.move);
  const { undo, canUndo } = useSoloGameUndo(useSolitaireStore);
  const usedUndo = useSolitaireStore((s) => s.usedUndo);

  const [selection, setSelection] = useState<MoveSource | null>(null);
  const { play } = base.actions;

  const handleDraw = useCallback(() => {
    play('card_flip');
    draw();
  }, [draw, play]);

  const handleMove = useCallback(
    (source: MoveSource, target: MoveTarget) => {
      play('card_place');
      move(source, target);
    },
    [move, play],
  );

  return useMemo(
    () => ({
      ...base,
      gameSpecific: {
        finished,
        draw,
        move,
        selection,
        setSelection,
        handleDraw,
        handleMove,
        undo,
        canUndo,
        usedUndo,
      },
    }),
    [
      base,
      finished,
      draw,
      move,
      selection,
      handleDraw,
      handleMove,
      undo,
      canUndo,
      usedUndo,
    ],
  );
}
