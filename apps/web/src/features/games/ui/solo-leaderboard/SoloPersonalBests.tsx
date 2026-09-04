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
      <div className="py-6 text-center text-sm text-[var(--textSecondary)]">
        {t('games.soloLeaderboard.noScores')}
      </div>
    );
  }

  const difficulties = Object.keys(gameBests);

  return (
    <div className="space-y-2">
      {difficulties.map((diff) => {
        const best = gameBests[diff];
        const isActive = diff === difficulty;

        return (
          <div
            key={diff}
            className={cx(
              'rounded-xl border p-3 transition-all',
              isActive
                ? 'border-[var(--primary)]/40 bg-[var(--primary)]/10'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)]',
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
                {t(
                  `games.soloLeaderboard.difficulty.${diff}` as TranslationKey,
                ) || diff}
              </span>
              {isActive && (
                <span className="rounded-full bg-[var(--primary)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                  {t('games.soloLeaderboard.current')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard
                label={t('games.soloLeaderboard.bestTime')}
                value={formatDuration(best.bestDurationMs)}
              />
              <StatCard
                label={t('games.soloLeaderboard.gamesPlayed')}
                value={String(best.totalGames)}
              />
              <StatCard
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-[var(--background)] p-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--textSecondary)]">
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-[var(--color)]">
        {value}
      </span>
    </div>
  );
}
