import React from 'react';
import type { PlayerStats } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Card, SkeletonText, ProgressCircle } from '@arcadeum/ui';

export const statsOverviewCSS = `
  .stats-overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  @media (min-width: 640px) {
    .stats-overview-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
  }
  @media (min-width: 1024px) {
    .stats-overview-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.25rem;
    }
  }
`;

interface StatsOverviewProps {
  stats: PlayerStats | null;
  loading: boolean;
  currentStreak?: number;
  currentStreakType?: 'won' | 'lost' | null;
  bestWinStreak?: number;
  favoriteGame?: string | null;
}

export function StatsOverview({
  stats,
  loading,
  currentStreak,
  currentStreakType,
  bestWinStreak,
  favoriteGame,
}: StatsOverviewProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <>
        <style>{statsOverviewCSS}</style>
        <div className="stats-overview-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="glass" padding="md">
              <SkeletonText className="h-3.5 w-[60%]" delay={i * 0.1} />
              <SkeletonText
                width="100px"
                height="32px"
                delay={i * 0.1 + 0.05}
              />
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (!stats) return null;

  return (
    <>
      <style>{statsOverviewCSS}</style>
      <div className="stats-overview-grid">
        <Card variant="glass" padding="md">
          <StatLabel>{t('stats.totalGames')}</StatLabel>
          <StatValue data-testid="stats-total-games">
            {stats.totalGames}
          </StatValue>
        </Card>
        <Card variant="glass" padding="md">
          <StatLabel>{t('stats.wins')}</StatLabel>
          <StatValue data-testid="stats-wins" color="var(--success)">
            {stats.wins}
          </StatValue>
        </Card>
        <Card variant="glass" padding="md">
          <StatLabel>{t('stats.losses')}</StatLabel>
          <StatValue data-testid="stats-losses" color="var(--danger)">
            {stats.losses}
          </StatValue>
        </Card>
        <Card variant="glass" padding="md">
          <WinRateCardContent>
            <StatLabel>{t('stats.winRate')}</StatLabel>
            <ProgressCircle value={stats.winRate} size={80} strokeWidth={8} />
          </WinRateCardContent>
        </Card>
        {currentStreak != null && currentStreak > 0 && (
          <Card variant="glass" padding="md">
            <StatLabel>{t('stats.currentStreak')}</StatLabel>
            <StatValue
              data-testid="stats-current-streak"
              color={
                currentStreakType === 'won' ? 'var(--success)' : 'var(--danger)'
              }
            >
              {currentStreak}
              <StreakSuffix>
                {currentStreakType === 'won' ? 'W' : 'L'}
              </StreakSuffix>
            </StatValue>
          </Card>
        )}
        {bestWinStreak != null && bestWinStreak > 0 && (
          <Card variant="glass" padding="md">
            <StatLabel>{t('stats.bestWinStreak')}</StatLabel>
            <StatValue
              data-testid="stats-best-win-streak"
              color="var(--success)"
            >
              {bestWinStreak}
              <StreakSuffix>W</StreakSuffix>
            </StatValue>
          </Card>
        )}
        {favoriteGame && (
          <Card variant="glass" padding="md">
            <StatLabel>{t('stats.favoriteGame')}</StatLabel>
            <StatValue
              data-testid="stats-favorite-game"
              className="text-[28px] leading-[34px]"
            >
              🎯
            </StatValue>
            <span className="text-[16px] font-semibold text-[var(--color)] -mt-1 text-center">
              {favoriteGame}
            </span>
          </Card>
        )}
      </div>
    </>
  );
}

function StatLabel({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[11px] sm:text-[12px] lg:text-[14px] leading-[16px] sm:leading-[18px] uppercase tracking-[1px] sm:tracking-[1.2px] font-medium text-[var(--textSecondary)] mb-1">
      {children}
    </span>
  );
}

function StatValue({
  color,
  className,
  'data-testid': dataTestId,
  children,
}: {
  color?: string;
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      data-testid={dataTestId}
      className={`text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold leading-none tracking-[-0.5px] text-[var(--primaryGradientStart)] ${className ?? ''}`}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}

function WinRateCardContent({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {children}
    </div>
  );
}

function StreakSuffix({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[20px] font-semibold leading-[28px] ml-0.5 text-[var(--textSecondary)]">
      {children}
    </span>
  );
}
