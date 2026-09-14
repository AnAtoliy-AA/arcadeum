'use client';

import { useEffect, useCallback, useState } from 'react';

interface UseKeyboardNavigationOptions {
  gridSize: number;
  enabled: boolean;
  onFire: (row: number, col: number) => void;
}

export function useKeyboardNavigation({
  gridSize,
  enabled,
  onFire,
}: UseKeyboardNavigationOptions) {
  const [cursor, setCursor] = useState<{ row: number; col: number } | null>(
    null,
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      setCursor((prev) => {
        const row = prev?.row ?? Math.floor(gridSize / 2);
        const col = prev?.col ?? Math.floor(gridSize / 2);

        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            e.preventDefault();
            return { row: Math.max(0, row - 1), col };
          case 'ArrowDown':
          case 's':
          case 'S':
            e.preventDefault();
            return { row: Math.min(gridSize - 1, row + 1), col };
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            return { row, col: Math.max(0, col - 1) };
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            return { row, col: Math.min(gridSize - 1, col + 1) };
          case 'Enter':
          case ' ':
            e.preventDefault();
            onFire(row, col);
            return prev;
          case 'Escape':
            return null;
          default:
            return prev;
        }
      });
    },
    [enabled, gridSize, onFire],
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return { cursor };
}
