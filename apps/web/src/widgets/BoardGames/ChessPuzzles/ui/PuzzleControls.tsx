'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

interface PuzzleControlsProps {
  phase: 'waiting' | 'opponent' | 'player' | 'solved' | 'failed';
  rating: number;
  ratingChange?: number;
  streak?: number;
  onNext: () => void;
  onHint?: () => void;
}

function PuzzleControlsImpl({
  phase,
  rating,
  ratingChange,
  streak,
  onNext,
  onHint,
}: PuzzleControlsProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
          PUZZLE
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color)]">
            {rating}
          </span>
          {ratingChange !== undefined && ratingChange !== 0 && (
            <span
              className={cx(
                'text-xs font-bold',
                ratingChange > 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {ratingChange > 0 ? '+' : ''}
              {ratingChange}
            </span>
          )}
        </div>
      </div>

      {streak !== undefined && streak > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-semibold text-orange-400">
            {streak} streak
          </span>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="text-xs text-[var(--textSecondary)] text-center py-2">
          Loading puzzle...
        </div>
      )}

      {phase === 'opponent' && (
        <div className="text-xs text-[var(--textSecondary)] text-center py-2">
          Opponent is thinking...
        </div>
      )}

      {phase === 'player' && (
        <div className="text-xs text-emerald-400 font-semibold text-center py-2">
          Your turn — find the best move
        </div>
      )}

      {phase === 'solved' && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-emerald-400 font-semibold text-center">
            Correct!
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-semibold cursor-pointer hover:bg-emerald-500/25 transition-colors"
          >
            Next Puzzle
          </button>
        </div>
      )}

      {phase === 'failed' && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-red-400 font-semibold text-center">
            Incorrect — try again
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold cursor-pointer hover:bg-red-500/25 transition-colors"
          >
            Next Puzzle
          </button>
        </div>
      )}

      {phase === 'player' && onHint && (
        <button
          type="button"
          onClick={onHint}
          className="w-full py-2 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors"
        >
          Get Hint
        </button>
      )}
    </div>
  );
}

export const PuzzleControls = memo(PuzzleControlsImpl);
