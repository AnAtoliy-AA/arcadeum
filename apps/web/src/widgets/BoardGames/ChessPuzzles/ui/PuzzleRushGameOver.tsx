'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { TacticalScoreShareModal } from './TacticalScoreShareModal';
import { DailyStreakManager } from '@/shared/lib/daily-streak';
import type { RushMode } from './PuzzleRushMenu';

interface PuzzleRushGameOverProps {
  score: number;
  bestStreak: number;
  totalTime: number;
  rating: number;
  mode?: RushMode;
  onPlayAgain: () => void;
  onOpenLeaderboard?: () => void;
  rank?: number;
  isNewBest?: boolean;
}

export function PuzzleRushGameOver({
  score,
  bestStreak,
  totalTime,
  rating,
  mode = 'survival',
  onPlayAgain,
  onOpenLeaderboard,
  rank,
  isNewBest,
}: PuzzleRushGameOverProps) {
  const { t } = useTranslation();
  const [shareOpen, setShareOpen] = useState(false);
  const streakState = DailyStreakManager.getStreakState();
  const multiplier = DailyStreakManager.calculateXpMultiplier(
    streakState.currentStreak,
  );

  return (
    <div
      data-testid="puzzle-rush-gameover"
      className="flex flex-col items-center gap-4 p-8 max-w-md mx-auto"
    >
      {isNewBest && (
        <span
          data-testid="puzzle-rush-new-pb"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
        >
          <span>🏆</span> {t('games.chess_v1.puzzleRush.newPersonalBest')}
        </span>
      )}

      <h2 className="text-2xl font-black text-[var(--color)]">
        {t('games.chess_v1.puzzleRush.gameOver')}
      </h2>

      {rank !== undefined && rank > 0 && (
        <div
          data-testid="puzzle-rush-rank-indicator"
          className="text-xs text-[var(--textSecondary)]"
        >
          Global Rank:{' '}
          <span className="font-bold text-[var(--color)]">#{rank}</span>
        </div>
      )}

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

      <div className="flex flex-col gap-2.5 w-full mt-2">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          data-testid="puzzle-rush-share-btn"
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <span>🚀</span> {t('games.chess_v1.puzzleRush.shareScore')}
        </button>

        {onOpenLeaderboard && (
          <button
            type="button"
            onClick={onOpenLeaderboard}
            data-testid="puzzle-rush-view-leaderboard-btn"
            className="w-full py-3 px-6 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--color)] text-sm font-bold cursor-pointer hover:bg-[var(--backgroundHover)] transition-all flex items-center justify-center gap-2"
          >
            <span>🏆</span> {t('games.chess_v1.puzzleRush.viewLeaderboard')}
          </button>
        )}

        <button
          type="button"
          onClick={onPlayAgain}
          data-testid="puzzle-rush-play-again-btn"
          className="w-full py-3 px-6 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--color)] text-sm font-bold cursor-pointer hover:bg-[var(--primary)]/25 transition-colors"
        >
          {t('games.chess_v1.puzzleRush.playAgain')}
        </button>
      </div>

      <TacticalScoreShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        gameMode={mode}
        score={score}
        bestStreak={bestStreak}
        totalTimeSeconds={totalTime}
        rating={rating}
        streakMultiplier={multiplier}
      />
    </div>
  );
}
