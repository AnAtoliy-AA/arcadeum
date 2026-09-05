'use client';

import { useTranslation } from '@/shared/lib/useTranslation';

const DOT_COORDS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 28],
    [72, 28],
    [28, 50],
    [72, 50],
    [28, 72],
    [72, 72],
  ],
};

interface DieProps {
  value: number | null;
  isRolling?: boolean;
  className?: string;
}

export function Die({ value, isRolling, className }: DieProps) {
  const { t } = useTranslation();

  if (value == null && !isRolling) return null;

  const dots = value && DOT_COORDS[value] ? DOT_COORDS[value] : DOT_COORDS[1];

  return (
    <div
      aria-label={
        value != null
          ? t('games.pachisi_v1.game.dieValue', { value })
          : undefined
      }
      className={`pachisi-die relative h-9 w-9 shrink-0 rounded-lg border shadow-md transition-transform duration-200 ${
        isRolling ? 'animate-spin' : ''
      } ${className ?? ''}`}
      data-testid="pachisi-die"
      title={
        value != null
          ? t('games.pachisi_v1.game.dieValue', { value })
          : undefined
      }
    >
      <svg className="h-full w-full p-1" viewBox="0 0 100 100">
        {dots.map(([cxCoord, cyCoord], idx) => (
          <circle
            className="pachisi-die-dot"
            cx={cxCoord}
            cy={cyCoord}
            fill="currentColor"
            key={`dot-${idx}-${cxCoord}-${cyCoord}`}
            r={8.5}
          />
        ))}
      </svg>
    </div>
  );
}
