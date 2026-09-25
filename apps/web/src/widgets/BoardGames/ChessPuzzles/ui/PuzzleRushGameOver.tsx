'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';

interface PuzzleRushGameOverProps {
  score: number;
  bestStreak: number;
  totalTime: number;
  rating: number;
  onPlayAgain: () => void;
}

export function PuzzleRushGameOver({
  score,
  bestStreak,
  totalTime,
  rating,
  onPlayAgain,
}: PuzzleRushGameOverProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-black text-[var(--color)]">
        {t('games.chess_v1.puzzleRush.gameOver')}
      </h2>
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-3xl font-black text-[var(--color)]">
            {score}
          </span>
          <span className="text-[10px] text-[var(--textSecondary)]">Score</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-3xl font-black text-orange-400">
            {bestStreak}
          </span>
          <span className="text-[10px] text-[var(--textSecondary)]">
            Best Streak
          </span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-3xl font-black text-sky-400">{totalTime}s</span>
          <span className="text-[10px] text-[var(--textSecondary)]">Time</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          <span className="text-3xl font-black text-purple-400">{rating}</span>
          <span className="text-[10px] text-[var(--textSecondary)]">
            Rating
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onPlayAgain}
        data-testid="puzzle-rush-play-again-btn"
        className="w-full py-3 px-6 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--color)] text-sm font-bold cursor-pointer hover:bg-[var(--primary)]/25 transition-colors"
      >
        {t('games.chess_v1.puzzleRush.playAgain')}
      </button>
    </div>
  );
}
