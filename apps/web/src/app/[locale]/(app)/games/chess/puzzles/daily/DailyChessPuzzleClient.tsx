'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { PuzzleGame } from '@/widgets/BoardGames/ChessPuzzles/ui/Game';
import { ChessPuzzleTabs } from '@/widgets/BoardGames/ChessPuzzles/ui/ChessPuzzleTabs';
import { DailyStreakBadge } from '@/features/daily-challenges/ui/DailyStreakBadge';
import {
  DailyStreakManager,
  type DailyStreakState,
} from '@/shared/lib/daily-streak';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';

interface DailyChessPuzzleClientProps {
  locale: string;
}

function getSecondsUntilMidnightUtc(): number {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
    ),
  );
  return Math.max(
    0,
    Math.floor((nextMidnight.getTime() - now.getTime()) / 1000),
  );
}

function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function DailyChessPuzzleClient({
  locale,
}: DailyChessPuzzleClientProps) {
  const [streakState, setStreakState] = useState<DailyStreakState>(() =>
    DailyStreakManager.getStreakState(),
  );
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() =>
    getSecondsUntilMidnightUtc(),
  );
  const [solvedInfo, setSolvedInfo] = useState<{
    puzzle: ChessPuzzle;
    moves: string[];
    timeMs: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(getSecondsUntilMidnightUtc());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSolved = useCallback(
    (info: { puzzle: ChessPuzzle; moves: string[]; timeMs: number }) => {
      setSolvedInfo(info);
      const updated = DailyStreakManager.recordCompletion();
      setStreakState(updated);
    },
    [],
  );

  const todayStr = DailyStreakManager.getTodayDateString();
  const isCompletedToday = streakState.lastCompletedDateString === todayStr;

  const handleShare = useCallback(() => {
    const movesCount = solvedInfo?.moves.length ?? 1;
    const timeSec = solvedInfo ? Math.round(solvedInfo.timeMs / 1000) : 0;
    const shareText = `🧩 Arcadeum Daily Chess Puzzle (${todayStr})\nSolved in ${timeSec}s (${movesCount} moves)!\n🔥 Current streak: ${streakState.currentStreak} day${streakState.currentStreak === 1 ? '' : 's'}\nhttps://arcadeum.games/${locale}/games/chess/puzzles/daily`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }, [solvedInfo, todayStr, streakState.currentStreak, locale]);

  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[900px] px-4">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>📅</span> Daily Challenge
            </span>
            <DailyStreakBadge
              streak={streakState.currentStreak}
              multiplier={DailyStreakManager.calculateXpMultiplier(
                streakState.currentStreak,
              )}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color)] mb-2">
            Daily Chess Puzzle
          </h1>
          <p className="text-sm text-[var(--textSecondary)] max-w-md">
            A new hand-curated tactical puzzle every 24 hours. Solve it daily to
            build your streak and earn bonus rating!
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--textSecondary)]">
            <span>Next puzzle in:</span>
            <span
              data-testid="countdown-timer"
              className="font-mono font-bold text-[var(--accent)] bg-[var(--glassBg)] border border-[var(--glassBorder)] px-2.5 py-0.5 rounded-md"
            >
              {formatCountdown(secondsRemaining)}
            </span>
          </div>
        </div>

        <ChessPuzzleTabs activeTab="daily" locale={locale} />

        {isCompletedToday && solvedInfo && (
          <div
            data-testid="daily-puzzle-completed-card"
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div className="text-left">
                <div className="text-sm font-bold text-emerald-400">
                  Daily Challenge Completed!
                </div>
                <div className="text-xs text-[var(--textSecondary)]">
                  Solved in {Math.round(solvedInfo.timeMs / 1000)}s ·{' '}
                  {streakState.currentStreak} day streak
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleShare}
                data-testid="share-puzzle-button"
              >
                {copied ? 'Copied to Clipboard! ✓' : 'Share Result 📋'}
              </Button>
              <Link href={`/${locale}/games/chess/puzzles`}>
                <Button variant="secondary" size="sm">
                  More Puzzles →
                </Button>
              </Link>
            </div>
          </div>
        )}

        <PuzzleGame
          mode="daily"
          onSolved={handleSolved}
          onShare={handleShare}
        />
      </div>
    </main>
  );
}
