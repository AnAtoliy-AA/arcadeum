'use client';

import { useEffect, type RefObject } from 'react';

interface UsePachisiKeyboardTurnOptions {
  myTurn: boolean;
  isGameOver: boolean;
  actionBusy: boolean;
  canMove: boolean;
  movableTokenIds: Set<number>;
  onPassTurn?: () => void;
  onMove: (tokenId: number) => void;
  /** Board element; enables arrow-key cycling between movable tokens. */
  boardRef?: RefObject<HTMLElement | null>;
}

export function usePachisiKeyboardTurn({
  myTurn,
  isGameOver,
  actionBusy,
  canMove,
  movableTokenIds,
  onPassTurn,
  onMove,
  boardRef,
}: UsePachisiKeyboardTurnOptions) {
  useMovableTokenArrows(boardRef, myTurn && canMove);

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

/**
 * Arrow keys move focus between movable tokens, most advanced first, so the
 * order follows the game instead of the rotated DOM order.
 */
function useMovableTokenArrows(
  boardRef: RefObject<HTMLElement | null> | undefined,
  enabled: boolean,
) {
  useEffect(() => {
    const board = boardRef?.current;
    if (!board || !enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
      const backward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
      if (!forward && !backward) return;
      const buttons = Array.from(
        board.querySelectorAll<HTMLButtonElement>(
          'button[data-movable="true"]',
        ),
      ).sort(
        (a, b) =>
          Number(b.dataset.progress ?? 0) - Number(a.dataset.progress ?? 0),
      );
      if (buttons.length < 2) return;
      const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (idx < 0) return;
      e.preventDefault();
      const next = (idx + (forward ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    };
    board.addEventListener('keydown', onKeyDown);
    return () => board.removeEventListener('keydown', onKeyDown);
  }, [boardRef, enabled]);
}
