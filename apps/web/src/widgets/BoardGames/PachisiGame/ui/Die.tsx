'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { usePachisiTheme } from '../lib/PachisiThemeContext';

const PIPS: Record<number, Array<[number, number]>> = {
  1: [[2, 2]],
  2: [
    [1, 1],
    [3, 3],
  ],
  3: [
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  4: [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ],
  5: [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3],
  ],
  6: [
    [1, 1],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 3],
  ],
};

export function Die({ value }: { value: number | null }) {
  const { t } = useTranslation();
  const theme = usePachisiTheme();
  return (
    <div
      aria-label={
        value != null
          ? t('games.pachisi_v1.game.dieValue', { value })
          : undefined
      }
      className="relative h-9 w-9 shrink-0 rounded-lg border shadow-md"
      data-testid="pachisi-die"
      style={{ background: theme.diceFace, borderColor: theme.diceBorder }}
    >
      {(value ? PIPS[value] : []).map(([r, c]) => (
        <span
          key={`${r}-${c}`}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            background: theme.diceDot,
            left: `${(c - 0.5) * 25}%`,
            top: `${(r - 0.5) * 25}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
