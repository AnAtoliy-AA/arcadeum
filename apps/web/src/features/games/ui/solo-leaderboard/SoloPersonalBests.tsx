'use client';

import { useSoloScoreStore } from '@/features/stats/store/soloScoreStore';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';

interface SoloPersonalBestsProps {
  gameId: string;
  difficulty: string;
}

function formatDuration(ms: number): string {
  if (ms === 0) return '--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function SoloPersonalBests({
  gameId,
  difficulty,
}: SoloPersonalBestsProps) {
  const { t } = useTranslation();
  const getPersonalBests = useSoloScoreStore((s) => s.getPersonalBests);
  const bests = getPersonalBests(gameId);
  const gameBests = bests[gameId];

  if (!gameBests || Object.keys(gameBests).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <span className="mb-2 text-3xl opacity-50">🎯</span>
        <p className="text-sm font-semibold text-[var(--textSecondary)]">
          {t('games.soloLeaderboard.noScores')}
        </p>
      </div>
    );
  }

  const difficulties = Object.keys(gameBests);

  return (
    <div className="space-y-3">
      {difficulties.map((diff) => {
        const best = gameBests[diff];
        const isActive = diff === difficulty;
        const winRate =
          best.totalGames > 0
            ? Math.round((best.wins / best.totalGames) * 100)
            : 0;

        return (
          <div
            key={diff}
            className={cx(
              'rounded-xl border p-3.5 transition-all duration-200',
              isActive
                ? 'border-[var(--primary)]/50 bg-[var(--primary)]/10 shadow-sm shadow-[var(--primary)]/10'
                : 'border-[var(--glassBorder)] bg-[var(--glassBg)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
                {t(
                  `games.soloLeaderboard.difficulty.${diff}` as TranslationKey,
                ) || diff}
              </span>
              <div className="flex items-center gap-2">
                {best.totalGames > 0 && (
                  <span className="rounded-md border border-[var(--glassBorder)] bg-[var(--background)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--textSecondary)]">
                    {winRate}% WR
                  </span>
                )}
                {isActive && (
                  <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                    {t('games.soloLeaderboard.current')}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard
                icon="⏱️"
                label={t('games.soloLeaderboard.bestTime')}
                value={formatDuration(best.bestDurationMs)}
              />
              <StatCard
                icon="🎮"
                label={t('games.soloLeaderboard.gamesPlayed')}
                value={String(best.totalGames)}
              />
              <StatCard
                icon="🏆"
                label={t('games.soloLeaderboard.wins')}
                value={String(best.wins)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-[var(--glassBorder)] bg-[var(--background)] p-2 shadow-sm">
      <div className="mb-0.5 flex items-center gap-1">
        <span className="text-[10px]">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
          {label}
        </span>
      </div>
      <span className="font-mono text-sm font-black tabular-nums text-[var(--color)]">
        {value}
      </span>
    </div>
  );
}
