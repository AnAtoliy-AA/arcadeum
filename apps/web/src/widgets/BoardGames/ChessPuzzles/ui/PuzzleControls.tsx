'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { PuzzlePhase } from '../hooks/usePuzzleState';

interface PuzzleControlsProps {
  phase: PuzzlePhase;
  rating: number;
  ratingChange?: number;
  streak?: number;
  mode?: 'daily' | 'rated' | 'themed';
  onNext: () => void;
  onRetry?: () => void;
  onShowSolution?: () => void;
  onHint?: () => void;
  onShare?: () => void;
}

function PuzzleControlsImpl({
  phase,
  rating,
  ratingChange,
  streak,
  mode,
  onNext,
  onRetry,
  onShowSolution,
  onHint,
  onShare,
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
        <div className="text-xs text-[var(--accent)] font-semibold text-center py-2 animate-pulse">
          Opponent is replying...
        </div>
      )}

      {phase === 'solution' && (
        <div className="text-xs text-sky-400 font-semibold text-center py-2 animate-pulse">
          Playing solution line...
        </div>
      )}

      {phase === 'player' && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-emerald-400 font-semibold text-center py-1">
            Your turn : find the best move
          </div>
          {onHint && (
            <button
              type="button"
              onClick={onHint}
              data-testid="puzzle-hint-btn"
              className="w-full py-2 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors"
            >
              Get Hint 💡
            </button>
          )}
        </div>
      )}

      {phase === 'solved' && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-emerald-400 font-semibold text-center py-1">
            {mode === 'daily' ? "Today's Puzzle Solved! 🎉" : 'Correct! 🎉'}
          </div>
          {mode === 'daily' && onShare && (
            <button
              type="button"
              onClick={onShare}
              data-testid="puzzle-share-btn"
              className="w-full py-2 px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Share Solution 📋
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            data-testid="puzzle-next-btn"
            className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-500/25 transition-colors"
          >
            {mode === 'daily' ? 'Practice More Puzzles →' : 'Next Puzzle →'}
          </button>
        </div>
      )}

      {phase === 'failed' && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-red-400 font-semibold text-center py-1">
            Incorrect : try again
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                data-testid="puzzle-retry-btn"
                className="flex-1 py-2 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors"
              >
                Try Again 🔄
              </button>
            )}
            {onShowSolution && (
              <button
                type="button"
                onClick={onShowSolution}
                data-testid="puzzle-solution-btn"
                className="flex-1 py-2 px-3 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold cursor-pointer hover:bg-sky-500/25 transition-colors"
              >
                Show Solution 👁️
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onNext}
            data-testid="puzzle-failed-next-btn"
            className="w-full py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold cursor-pointer hover:bg-red-500/25 transition-colors"
          >
            Skip to Next Puzzle →
          </button>
        </div>
      )}
    </div>
  );
}

export const PuzzleControls = memo(PuzzleControlsImpl);
