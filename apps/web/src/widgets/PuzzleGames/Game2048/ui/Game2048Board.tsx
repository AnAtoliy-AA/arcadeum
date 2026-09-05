'use client';

import { useRef, type CSSProperties } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useSoloFullscreen } from '@/features/games/ui/SoloGameContainer';
import { useGame2048Theme } from '../lib/Game2048ThemeContext';
import type { Game2048Theme } from '../lib/theme';
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
    return 'bg-[var(--g2048-empty-cell)] border border-[var(--g2048-board-border)]/40 backdrop-blur-[1px]';
  }
  return (
    TILE_STYLE_MAP[value] ??
    'bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 text-white shadow-[0_0_28px_rgba(236,72,153,0.7)] ring-2 ring-white/80 animate-pulse text-base sm:text-lg'
  );
}

function boardVars(theme: Game2048Theme): CSSProperties {
  return {
    '--g2048-board-bg': theme.boardBackground,
    '--g2048-board-border': theme.boardBorder,
    '--g2048-empty-cell': theme.emptyCell,
    '--g2048-glow': theme.glow,
  } as CSSProperties;
}

export function Game2048Board({ grid, onMove }: Game2048BoardProps) {
  const theme = useGame2048Theme();
  const isFullscreen = useSoloFullscreen();
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
      style={boardVars(theme)}
      className={cx(
        'mx-auto aspect-square w-full touch-none rounded-2xl sm:rounded-3xl border border-[var(--g2048-board-border)] bg-black/25 backdrop-blur-[2px] p-2 sm:p-3 shadow-2xl select-none transition-all duration-200',
        isFullscreen
          ? 'max-w-[min(94vw,min(calc(100vh-12rem),40rem))]'
          : 'max-w-[min(100vw-1rem,min(50vh,25.5rem))] sm:max-w-[min(100vw-2rem,min(52vh,26.5rem))]',
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        role="grid"
        aria-label="2048 board"
        className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2 sm:gap-2.5"
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
              isFullscreen && 'md:text-4xl',
            )}
          >
            {value !== 0 && value}
          </div>
        ))}
      </div>
    </div>
  );
}
