'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'arcadeum_pet_home_pos';

interface Position {
  x: number;
  y: number;
}

export function useDraggableHome() {
  const boothRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentOffset = useRef<Position>({ x: 0, y: 0 });
  const startPointer = useRef<Position>({ x: 0, y: 0 });
  const startOffset = useRef<Position>({ x: 0, y: 0 });
  const basePosition = useRef<Position>({ x: 0, y: 0 });
  const isPointerDown = useRef(false);
  const hasMoved = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Position;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          currentOffset.current = parsed;
          if (boothRef.current) {
            boothRef.current.style.setProperty(
              '--home-drag-x',
              `${parsed.x}px`,
            );
            boothRef.current.style.setProperty(
              '--home-drag-y',
              `${parsed.y}px`,
            );
          }
        }
      }
    } catch {}
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, a, select, textarea, [role="button"]')) {
      return;
    }
    const el = boothRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    basePosition.current = {
      x: rect.left - currentOffset.current.x,
      y: rect.top - currentOffset.current.y,
    };

    startPointer.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...currentOffset.current };
    isPointerDown.current = true;
    hasMoved.current = false;
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !boothRef.current) return;

    const deltaX = e.clientX - startPointer.current.x;
    const deltaY = e.clientY - startPointer.current.y;

    if (Math.hypot(deltaX, deltaY) > 5) {
      hasMoved.current = true;
    }

    const rect = boothRef.current.getBoundingClientRect();
    const targetLeft = basePosition.current.x + startOffset.current.x + deltaX;
    const targetTop = basePosition.current.y + startOffset.current.y + deltaY;

    const clampedLeft = Math.max(
      10,
      Math.min(window.innerWidth - rect.width - 10, targetLeft),
    );
    const clampedTop = Math.max(
      10,
      Math.min(window.innerHeight - rect.height - 10, targetTop),
    );

    const nextX = Math.round(clampedLeft - basePosition.current.x);
    const nextY = Math.round(clampedTop - basePosition.current.y);

    boothRef.current.style.setProperty('--home-drag-x', `${nextX}px`);
    boothRef.current.style.setProperty('--home-drag-y', `${nextY}px`);
    currentOffset.current = { x: nextX, y: nextY };
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasMoved.current) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(currentOffset.current),
        );
      } catch {}
    }
  }, []);

  const handleHouseClick = useCallback((onToggle: () => void) => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    onToggle();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const el = boothRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const currentLeft = rect.left;
      const currentTop = rect.top;
      const clampedLeft = Math.max(
        10,
        Math.min(window.innerWidth - rect.width - 10, currentLeft),
      );
      const clampedTop = Math.max(
        10,
        Math.min(window.innerHeight - rect.height - 10, currentTop),
      );
      if (clampedLeft !== currentLeft || clampedTop !== currentTop) {
        const diffX = clampedLeft - currentLeft;
        const diffY = clampedTop - currentTop;
        const newX = currentOffset.current.x + diffX;
        const newY = currentOffset.current.y + diffY;
        currentOffset.current = { x: newX, y: newY };
        el.style.setProperty('--home-drag-x', `${newX}px`);
        el.style.setProperty('--home-drag-y', `${newY}px`);
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ x: newX, y: newY }),
          );
        } catch {}
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    boothRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    handleHouseClick,
  };
}
