'use client';

import { useMemo, memo } from 'react';
import { Button } from '@arcadeum/ui';
import {
  getDailyLeaderboard,
  getPersonalBest,
  formatTimeSeconds,
  BADGE_DETAILS,
  getSpeedBadge,
} from '@/features/chess/lib/daily-leaderboard';

interface DailyLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  puzzleId: string;
  lastSolveTimeMs?: number;
}

function DailyLeaderboardModalImpl({
  isOpen,
  onClose,
  dateStr,
  puzzleId,
  lastSolveTimeMs,
}: DailyLeaderboardModalProps) {
  const pbTime = useMemo(() => {
    return getPersonalBest(puzzleId);
  }, [puzzleId]);

  const activeTime = pbTime ?? lastSolveTimeMs;

  const leaderboard = useMemo(() => {
    return getDailyLeaderboard(dateStr, activeTime ?? undefined);
  }, [dateStr, activeTime]);

  const userBadge = activeTime ? getSpeedBadge(activeTime) : null;
  const badgeInfo = userBadge ? BADGE_DETAILS[userBadge] : null;

  if (!isOpen) return null;

  return (
    <div
      data-testid="daily-leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[var(--background)] border border-[var(--glassBorder)] p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color)] flex items-center gap-2">
              <span>⚡ Daily Speed-Run</span>
            </h2>
            <p className="text-xs text-[var(--textSecondary)] mt-0.5">
              Top solve speeds for {dateStr}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--textSecondary)] hover:text-[var(--color)] p-1 rounded-lg text-lg"
            data-testid="close-leaderboard-modal"
          >
            ✕
          </button>
        </div>

        {activeTime && badgeInfo && (
          <div
            data-testid="user-speed-pb-card"
            className="p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-[10px] text-[var(--textSecondary)] uppercase font-semibold">
                Your Personal Best Time
              </div>
              <div className="text-2xl font-bold text-[var(--textPrimary)]">
                {formatTimeSeconds(activeTime)}
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${badgeInfo.colorClass}`}
            >
              <span>{badgeInfo.icon}</span>
              <span>{badgeInfo.label}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
            Daily Solvers Leaderboard
          </div>
          <div className="rounded-xl border border-[var(--glassBorder)] divide-y divide-[var(--glassBorder)] overflow-hidden">
            {leaderboard.map((entry) => {
              const b = BADGE_DETAILS[entry.badge];
              const isUser = entry.username === 'You';
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs transition-colors ${
                    isUser
                      ? 'bg-[var(--primary)]/10 font-semibold'
                      : 'hover:bg-[var(--backgroundHover)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-center text-[var(--textSecondary)]">
                      {entry.rank === 1
                        ? '🥇'
                        : entry.rank === 2
                          ? '🥈'
                          : entry.rank === 3
                            ? '🥉'
                            : `#${entry.rank}`}
                    </span>
                    <span
                      className={
                        isUser
                          ? 'text-[var(--primary)] font-bold'
                          : 'text-[var(--textPrimary)]'
                      }
                    >
                      {entry.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] ${b.colorClass}`}
                    >
                      {b.icon} {b.label}
                    </span>
                    <span className="font-mono font-bold text-[var(--textPrimary)] min-w-[42px] text-right">
                      {formatTimeSeconds(entry.timeMs)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            data-testid="close-leaderboard-btn"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DailyLeaderboardModal = memo(DailyLeaderboardModalImpl);
