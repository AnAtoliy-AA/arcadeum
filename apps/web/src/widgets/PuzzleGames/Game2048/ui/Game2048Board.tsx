'use client';

import { useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { Direction } from '../types';

interface Game2048BoardProps {
  grid: number[];
  onMove: (direction: Direction) => void;
}

const SWIPE_THRESHOLD = 24;

const TILE_STYLE_MAP: Record<number, string> = {
  2: 'bg-[#eee4da] text-[#776e65] shadow-sm text-2xl sm:text-3xl',
  4: 'bg-[#ede0c8] text-[#776e65] shadow-sm text-2xl sm:text-3xl',
  8: 'bg-[#f2b179] text-[#f9f6f2] shadow-md shadow-orange-500/10 text-2xl sm:text-3xl',
  16: 'bg-[#f59563] text-[#f9f6f2] shadow-md shadow-orange-500/20 text-xl sm:text-2xl',
  32: 'bg-[#f67c5f] text-[#f9f6f2] shadow-md shadow-rose-500/20 text-xl sm:text-2xl',
  64: 'bg-[#f65e3b] text-[#f9f6f2] shadow-md shadow-red-500/25 text-xl sm:text-2xl',
  128: 'bg-[#edcf72] text-[#f9f6f2] shadow-lg shadow-amber-500/30 ring-1 ring-amber-300/40 text-lg sm:text-xl',
  256: 'bg-[#edcc61] text-[#f9f6f2] shadow-lg shadow-amber-500/40 ring-2 ring-amber-300/50 text-lg sm:text-xl',
  512: 'bg-[#edc850] text-[#f9f6f2] shadow-xl shadow-amber-500/50 ring-2 ring-yellow-300/60 text-lg sm:text-xl',
  1024: 'bg-[#edc53f] text-[#f9f6f2] shadow-xl shadow-amber-400/60 ring-2 ring-yellow-200/70 text-base sm:text-lg',
  2048: 'bg-gradient-to-br from-[#edc22e] via-amber-400 to-yellow-300 text-white shadow-[0_0_24px_rgba(251,191,36,0.65)] ring-2 ring-yellow-200 animate-pulse text-base sm:text-lg',
};

function getTileClasses(value: number): string {
  if (value === 0) {
    return 'bg-slate-900/60 border border-white/5';
  }
  return (
    TILE_STYLE_MAP[value] ??
    'bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 text-white shadow-[0_0_28px_rgba(236,72,153,0.7)] ring-2 ring-white/80 animate-pulse text-base sm:text-lg'
  );
}

export function Game2048Board({ grid, onMove }: Game2048BoardProps) {
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
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD)
      return;

    if (Math.abs(dx) > Math.abs(dy)) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }
  };

  return (
    <div
      data-testid="game-2048-board"
      className="mx-auto aspect-square w-full max-w-[26rem] touch-none rounded-3xl border border-amber-500/20 bg-slate-950/75 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        role="grid"
        aria-label="2048 board"
        className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2.5 sm:gap-3"
      >
        {grid.map((value, index) => (
          <div
            key={index}
            role={value !== 0 ? 'gridcell' : undefined}
            aria-label={value !== 0 ? String(value) : undefined}
            data-testid={`tile-${index}`}
            className={cx(
              'flex select-none items-center justify-center rounded-2xl font-black transition-all duration-150',
              getTileClasses(value),
            )}
          >
            {value !== 0 && value}
          </div>
        ))}
      </div>
    </div>
  );
}
