'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';

export type RushMode = 'survival' | 'timed';

interface PuzzleRushMenuProps {
  highScores: Record<RushMode, number>;
  onStart: (mode: RushMode) => void;
}

export function PuzzleRushMenu({ highScores, onStart }: PuzzleRushMenuProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-[var(--color)] mb-2">
          {t('games.chess_v1.puzzleRush.title')}
        </h2>
        <p className="text-sm text-[var(--textSecondary)]">
          {t('games.chess_v1.puzzleRush.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <span className="text-xs text-[var(--textSecondary)] uppercase font-semibold">
            Best Survival
          </span>
          <span className="text-2xl font-black text-emerald-400">
            {highScores.survival}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <span className="text-xs text-[var(--textSecondary)] uppercase font-semibold">
            Best Timed
          </span>
          <span className="text-2xl font-black text-sky-400">
            {highScores.timed}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={() => onStart('survival')}
          data-testid="puzzle-rush-survival-btn"
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
        >
          {t('games.chess_v1.puzzleRush.survival')}
        </button>
        <button
          type="button"
          onClick={() => onStart('timed')}
          data-testid="puzzle-rush-timed-btn"
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-base font-bold cursor-pointer hover:from-sky-600 hover:to-indigo-600 transition-all shadow-lg shadow-sky-500/20"
        >
          {t('games.chess_v1.puzzleRush.timed')}
        </button>
      </div>
    </div>
  );
}
