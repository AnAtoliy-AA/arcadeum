import { useState, useCallback } from 'react';
import type { BoardPosition, File, Rank } from '../types';

export interface Arrow {
  from: BoardPosition;
  to: BoardPosition;
  color: string;
}

export interface DrawingCircle {
  square: BoardPosition;
  color: string;
}

const DRAWING_COLORS = [
  'rgba(34, 197, 94, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(59, 130, 246, 0.7)',
  'rgba(234, 179, 8, 0.7)',
  'rgba(249, 115, 22, 0.7)',
];

const MAX_ARROWS = 5;
const MAX_CIRCLES = 5;

export function useBoardDrawings() {
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [circles, setCircles] = useState<DrawingCircle[]>([]);
  const [colorIndex, setColorIndex] = useState(0);

  const currentColor = DRAWING_COLORS[colorIndex];

  const cycleColor = useCallback(() => {
    setColorIndex((prev) => (prev + 1) % DRAWING_COLORS.length);
  }, []);

  const addArrow = useCallback(
    (from: BoardPosition, to: BoardPosition) => {
      setArrows((prev) => {
        const next = [...prev, { from, to, color: currentColor }];
        return next.length > MAX_ARROWS ? next.slice(-MAX_ARROWS) : next;
      });
    },
    [currentColor],
  );

  const addCircle = useCallback(
    (square: BoardPosition) => {
      setCircles((prev) => {
        const next = [...prev, { square, color: currentColor }];
        return next.length > MAX_CIRCLES ? next.slice(-MAX_CIRCLES) : next;
      });
    },
    [currentColor],
  );

  const clearDrawings = useCallback(() => {
    setArrows([]);
    setCircles([]);
  }, []);

  const removeArrow = useCallback((index: number) => {
    setArrows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeCircle = useCallback((index: number) => {
    setCircles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    arrows,
    circles,
    currentColor,
    cycleColor,
    addArrow,
    addCircle,
    clearDrawings,
    removeArrow,
    removeCircle,
  };
}
