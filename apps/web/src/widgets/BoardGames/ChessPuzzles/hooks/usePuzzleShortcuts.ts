'use client';

import { useEffect } from 'react';

interface UsePuzzleShortcutsOptions {
  enabled?: boolean;
  onNext?: () => void;
  onRetry?: () => void;
  onHint?: () => void;
  onShowSolution?: () => void;
  onToggleZen?: () => void;
  onFlipBoard?: () => void;
  onToggleBlindfold?: () => void;
  onPeek?: () => void;
}

export function usePuzzleShortcuts({
  enabled = true,
  onNext,
  onRetry,
  onHint,
  onShowSolution,
  onToggleZen,
  onFlipBoard,
  onToggleBlindfold,
  onPeek,
}: UsePuzzleShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          if (onNext) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'r':
        case 'R':
          if (onRetry) {
            e.preventDefault();
            onRetry();
          }
          break;
        case 'h':
        case 'H':
          if (onHint) {
            e.preventDefault();
            onHint();
          }
          break;
        case 's':
        case 'S':
          if (onShowSolution) {
            e.preventDefault();
            onShowSolution();
          }
          break;
        case 'z':
        case 'Z':
          if (onToggleZen) {
            e.preventDefault();
            onToggleZen();
          }
          break;
        case 'f':
        case 'F':
          if (onFlipBoard) {
            e.preventDefault();
            onFlipBoard();
          }
          break;
        case 'b':
        case 'B':
          if (onToggleBlindfold) {
            e.preventDefault();
            onToggleBlindfold();
          }
          break;
        case 'p':
        case 'P':
          if (onPeek) {
            e.preventDefault();
            onPeek();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    onNext,
    onRetry,
    onHint,
    onShowSolution,
    onToggleZen,
    onFlipBoard,
    onToggleBlindfold,
    onPeek,
  ]);
}
