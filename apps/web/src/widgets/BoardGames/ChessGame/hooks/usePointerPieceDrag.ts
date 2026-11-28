'use client';

import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { FILES, type BoardPosition, type File, type Rank } from '../types';

/** Pixels a pointer must travel before a press becomes a drag. */
export const DRAG_THRESHOLD_PX = 6;

/** Maps a point inside the board grid to the square under it. */
export function pointToSquare(
  x: number,
  y: number,
  width: number,
  height: number,
  isFlipped: boolean,
): BoardPosition | null {
  if (width <= 0 || height <= 0) return null;
  const col = Math.floor((x / width) * 8);
  const row = Math.floor((y / height) * 8);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  const fileIdx = isFlipped ? 7 - col : col;
  const rank = (isFlipped ? row + 1 : 8 - row) as Rank;
  return { file: FILES[fileIdx] as File, rank };
}

export interface PieceDragState {
  from: BoardPosition;
  /** Pointer position relative to the grid, in px. */
  x: number;
  y: number;
  over: BoardPosition | null;
}

interface UsePointerPieceDragOptions {
  gridRef: RefObject<HTMLDivElement | null>;
  isFlipped: boolean;
  enabled: boolean;
  canDrag: (square: BoardPosition) => boolean;
  onDragStart: (from: BoardPosition) => void;
  onDrop: (from: BoardPosition, to: BoardPosition) => void;
}

/**
 * Pointer-events based piece dragging that works the same for mouse, pen
 * and touch (HTML5 drag and drop never fires on touch screens). A short tap
 * is left alone so the regular click-to-move path handles it.
 */
export function usePointerPieceDrag({
  gridRef,
  isFlipped,
  enabled,
  canDrag,
  onDragStart,
  onDrop,
}: UsePointerPieceDragOptions) {
  const [drag, setDrag] = useState<PieceDragState | null>(null);
  const pressRef = useRef<{
    id: number;
    from: BoardPosition;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);

  const locate = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      return {
        x,
        y,
        square: pointToSquare(x, y, rect.width, rect.height, isFlipped),
      };
    },
    [gridRef, isFlipped],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || e.button !== 0 || !e.isPrimary) return;
      const hit = locate(e.clientX, e.clientY);
      if (!hit?.square || !canDrag(hit.square)) return;
      pressRef.current = {
        id: e.pointerId,
        from: hit.square,
        startX: e.clientX,
        startY: e.clientY,
        dragging: false,
      };
    },
    [enabled, locate, canDrag],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const press = pressRef.current;
      if (!press || press.id !== e.pointerId) return;
      const hit = locate(e.clientX, e.clientY);
      if (!hit) return;
      if (!press.dragging) {
        const moved = Math.hypot(
          e.clientX - press.startX,
          e.clientY - press.startY,
        );
        if (moved < DRAG_THRESHOLD_PX) return;
        press.dragging = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Capture is best effort (unsupported in some test environments).
        }
        onDragStart(press.from);
      }
      e.preventDefault();
      setDrag({ from: press.from, x: hit.x, y: hit.y, over: hit.square });
    },
    [locate, onDragStart],
  );

  const finish = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
      const press = pressRef.current;
      if (!press || press.id !== e.pointerId) return;
      pressRef.current = null;
      if (!press.dragging) return;
      setDrag(null);
      const hit = commit ? locate(e.clientX, e.clientY) : null;
      const to = hit?.square;
      if (to && (to.file !== press.from.file || to.rank !== press.from.rank)) {
        onDrop(press.from, to);
      }
    },
    [locate, onDrop],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => finish(e, true),
    [finish],
  );
  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => finish(e, false),
    [finish],
  );

  return {
    drag,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
