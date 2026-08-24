'use client';

import { useRef } from 'react';
import { useGame2048Theme } from '../lib/Game2048ThemeContext';
import { tileColor, tileTextColor } from '../lib/theme-adapter';
import type { Direction } from '../types';

interface Game2048BoardProps {
  grid: number[];
  onMove: (direction: Direction) => void;
}

/** Minimum delta (px) for a gesture to count as a swipe. */
const SWIPE_THRESHOLD = 24;

export function Game2048Board({ grid, onMove }: Game2048BoardProps) {
  const theme = useGame2048Theme();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start) return;
    touchStart.current = null;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (
      Math.abs(dx) < SWIPE_THRESHOLD &&
      Math.abs(dy) < SWIPE_THRESHOLD
    )
      return;

    if (Math.abs(dx) > Math.abs(dy)) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }
  };

  return (
    <div
      className="mx-auto aspect-square w-full max-w-[26rem] rounded-xl border p-2 sm:p-3"
      style={{
        background: theme.boardBackground,
        borderColor: theme.boardBorder,
        borderRadius: '12px',
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        role="grid"
        aria-label="2048 board"
        className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2"
      >
        {grid.map((value, index) => {
          const fontSize =
            value >= 1024 ? '1.15rem' : value >= 128 ? '1.5rem' : '1.75rem';
          return (
            <div
              key={index}
              role={value !== 0 ? 'gridcell' : undefined}
              aria-label={value !== 0 ? String(value) : undefined}
              className="flex select-none items-center justify-center font-black transition-transform duration-100"
              style={{
                background:
                  value === 0 ? theme.emptyCell : tileColor(value),
                color: value === 0 ? 'transparent' : tileTextColor(value),
                fontSize,
                boxShadow:
                  value >= 2048 ? `0 0 14px ${theme.glow}` : undefined,
                borderRadius: theme.borderRadius,
              }}
            >
              {value !== 0 && value}
            </div>
          );
        })}
      </div>
    </div>
  );
}
