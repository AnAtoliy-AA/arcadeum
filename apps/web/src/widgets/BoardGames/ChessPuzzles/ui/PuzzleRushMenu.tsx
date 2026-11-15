'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { DailyStreakManager } from '@/shared/lib/daily-streak';

export type RushMode = 'survival' | 'timed';

interface PuzzleRushMenuProps {
  highScores: Record<RushMode, number>;
  onStart: (mode: RushMode) => void;
  onOpenLeaderboard?: () => void;
}

export function PuzzleRushMenu({
  highScores,
  onStart,
  onOpenLeaderboard,
}: PuzzleRushMenuProps) {
  const { t } = useTranslation();
  const streakState = DailyStreakManager.getStreakState();
  const multiplier = DailyStreakManager.calculateXpMultiplier(
    streakState.currentStreak,
  );

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {streakState.currentStreak > 0 && (
            <span
              data-testid="puzzle-rush-streak-indicator"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold"
            >
              <span>🔥</span> {streakState.currentStreak} Day Streak (
              {multiplier}
              x)
            </span>
          )}
        </div>
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
        {onOpenLeaderboard && (
          <button
            type="button"
            onClick={onOpenLeaderboard}
            data-testid="puzzle-rush-leaderboard-btn"
            className="w-full py-3 px-6 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--color)] text-sm font-bold cursor-pointer hover:bg-[var(--backgroundHover)] transition-all flex items-center justify-center gap-2"
          >
            <span>🏆</span> {t('games.chess_v1.puzzleRush.viewLeaderboard')}
          </button>
        )}
      </div>
    </div>
  );
}
