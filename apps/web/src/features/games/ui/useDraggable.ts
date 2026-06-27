'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const STORAGE_KEY = 'game-music-player-pos';

function loadPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Position;
    if (typeof p.x === 'number' && typeof p.y === 'number') return p;
  } catch {}
  return null;
}

function savePosition(pos: Position) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {}
}

export function useDraggable(initial: Position) {
  const [pos, setPos] = useState<Position>(() => loadPosition() ?? initial);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, input, a, select, textarea, [role="button"]');
      if (interactive) return;

      dragging.current = true;
      offset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
      target.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [pos],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const nx = e.clientX - offset.current.x;
    const ny = e.clientY - offset.current.y;
    const maxX = window.innerWidth - 50;
    const maxY = window.innerHeight - 50;
    setPos({ x: clamp(nx, 0, maxX), y: clamp(ny, 0, maxY) });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setPos((p) => {
      savePosition(p);
      return p;
    });
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPos((p) => {
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        const nx = clamp(p.x, 0, maxX);
        const ny = clamp(p.y, 0, maxY);
        if (nx !== p.x || ny !== p.y) {
          const next = { x: nx, y: ny };
          savePosition(next);
          return next;
        }
        return p;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { pos, onPointerDown, onPointerMove, onPointerUp };
}
