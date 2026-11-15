'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, GlassCard, Spinner } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  fetchPuzzleRushLeaderboard,
  type RushLeaderboardEntry,
  type RushMode,
} from '@/features/chess/lib/puzzle-rush-api';

export interface PuzzleRushLeaderboardProps {
  initialMode?: RushMode;
  onBack?: () => void;
}

export function PuzzleRushLeaderboard({
  initialMode = 'survival',
  onBack,
}: PuzzleRushLeaderboardProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<RushMode>(initialMode);
  const [entries, setEntries] = useState<RushLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSelectMode = useCallback((newMode: RushMode) => {
    setMode(newMode);
    setLoading(true);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const data = await fetchPuzzleRushLeaderboard(mode, 20);
      if (active) {
        setEntries(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [mode]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return (
      <span className="w-6 text-center text-xs font-bold text-[var(--textSecondary)]">
        #{rank}
      </span>
    );
  };

  return (
    <div
      data-testid="puzzle-rush-leaderboard"
      className="flex flex-col gap-5 w-full max-w-lg mx-auto p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-[var(--color)]">
            🏆 {t('games.chess_v1.puzzleRush.leaderboardTitle')}
          </h3>
          <span className="text-xs text-[var(--textSecondary)]">
            Top tactical solvers across the globe
          </span>
        </div>
        {onBack && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            data-testid="rush-leaderboard-back-btn"
          >
            ← Back
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
        <button
          type="button"
          onClick={() => handleSelectMode('survival')}
          data-testid="leaderboard-tab-survival"
          className={cx(
            'py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer',
            mode === 'survival'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-[var(--textSecondary)] hover:text-[var(--color)]',
          )}
        >
          {t('games.chess_v1.puzzleRush.survival')}
        </button>
        <button
          type="button"
          onClick={() => handleSelectMode('timed')}
          data-testid="leaderboard-tab-timed"
          className={cx(
            'py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer',
            mode === 'timed'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-[var(--textSecondary)] hover:text-[var(--color)]',
          )}
        >
          {t('games.chess_v1.puzzleRush.timed')}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3">
          <Spinner size="md" />
          <span className="text-xs text-[var(--textSecondary)] font-medium">
            Loading rankings...
          </span>
        </div>
      ) : entries.length === 0 ? (
        <GlassCard className="p-8 text-center text-sm text-[var(--textSecondary)] rounded-xl">
          No tactical runs recorded yet. Be the first to claim the throne!
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <GlassCard
              key={`${entry.rank}-${entry.userId}`}
              data-testid={`leaderboard-entry-${entry.rank}`}
              className={cx(
                'flex items-center justify-between p-3 rounded-xl border border-[var(--glassBorder)] transition-all',
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-[var(--glassBg)] to-[var(--backgroundHover)]'
                  : 'bg-[var(--glassBg)]',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7">
                  {getRankBadge(entry.rank)}
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-xs font-bold text-[var(--color)] uppercase">
                  {entry.username.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--color)] leading-snug">
                    {entry.username}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--textSecondary)]">
                    <span>🔥 Streak {entry.bestStreak}</span>
                    <span>•</span>
                    <span>⏱️ {entry.totalTimeSeconds}s</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-base font-black text-[var(--color)]">
                  {entry.score}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
