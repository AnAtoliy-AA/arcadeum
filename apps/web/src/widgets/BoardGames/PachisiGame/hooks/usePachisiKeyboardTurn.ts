'use client';

import { useEffect } from 'react';

interface UsePachisiKeyboardTurnOptions {
  myTurn: boolean;
  isGameOver: boolean;
  actionBusy: boolean;
  canMove: boolean;
  movableTokenIds: Set<number>;
  onPassTurn?: () => void;
  onMove: (tokenId: number) => void;
}

export function usePachisiKeyboardTurn({
  myTurn,
  isGameOver,
  actionBusy,
  canMove,
  movableTokenIds,
  onPassTurn,
  onMove,
}: UsePachisiKeyboardTurnOptions) {
  useEffect(() => {
    if (!myTurn || isGameOver || actionBusy || !canMove) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (movableTokenIds.size === 0 && onPassTurn) {
        e.preventDefault();
        onPassTurn();
        return;
      }

      if (movableTokenIds.size === 1) {
        const [soleTokenId] = Array.from(movableTokenIds);
        e.preventDefault();
        onMove(soleTokenId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    myTurn,
    isGameOver,
    actionBusy,
    canMove,
    movableTokenIds,
    onPassTurn,
    onMove,
  ]);
}
