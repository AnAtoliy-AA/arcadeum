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
}

export function usePuzzleShortcuts({
  enabled = true,
  onNext,
  onRetry,
  onHint,
  onShowSolution,
  onToggleZen,
  onFlipBoard,
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
  ]);
}
