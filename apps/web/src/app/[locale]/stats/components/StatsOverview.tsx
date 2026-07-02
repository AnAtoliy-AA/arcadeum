import React, { useMemo } from 'react';
import { styled, YStack, Text } from 'tamagui';
import type { PlayerStats } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { Card, SkeletonText, ProgressCircle } from '@arcadeum/ui';

export const statsOverviewCSS = `
  .stats-overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.25rem;
  }
`;

interface StatsOverviewProps {
  stats: PlayerStats | null;
  loading: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  const { t } = useTranslation();
  const records = useLocalStatsStore((s) => s.records);
  const streaks = useMemo(
    () => useLocalStatsStore.getState().getStreaks(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- records triggers re-computation via getState()
    [records.length],
  );
  const favoriteGame = useMemo(
    () => useLocalStatsStore.getState().getFavoriteGame(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- records triggers re-computation via getState()
    [records.length],
  );

  if (loading && !stats) {
    return (
      <>
        <style>{statsOverviewCSS}</style>
        <div className="stats-overview-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="glass" cardPadding="md">
              <SkeletonText width="60%" height="14px" delay={i * 0.1} />
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
        <Card variant="glass" cardPadding="md">
          <StatLabel>{t('stats.totalGames')}</StatLabel>
          <StatValue data-testid="stats-total-games">
            {stats.totalGames}
          </StatValue>
        </Card>
        <Card variant="glass" cardPadding="md">
          <StatLabel>{t('stats.wins')}</StatLabel>
          <StatValue data-testid="stats-wins" color="$success">
            {stats.wins}
          </StatValue>
        </Card>
        <Card variant="glass" cardPadding="md">
          <StatLabel>{t('stats.losses')}</StatLabel>
          <StatValue data-testid="stats-losses" color="$danger">
            {stats.losses}
          </StatValue>
        </Card>
        <Card variant="glass" cardPadding="md">
          <WinRateCardContent>
            <StatLabel>{t('stats.winRate')}</StatLabel>
            <ProgressCircle value={stats.winRate} size={80} strokeWidth={8} />
          </WinRateCardContent>
        </Card>
        {streaks.currentStreak > 0 && (
          <Card variant="glass" cardPadding="md">
            <StatLabel>{t('stats.currentStreak')}</StatLabel>
            <StatValue
              data-testid="stats-current-streak"
              color={
                streaks.currentStreakType === 'won' ? '$success' : '$danger'
              }
            >
              {streaks.currentStreak}
              <StreakSuffix>
                {streaks.currentStreakType === 'won' ? 'W' : 'L'}
              </StreakSuffix>
            </StatValue>
          </Card>
        )}
        {streaks.bestWinStreak > 0 && (
          <Card variant="glass" cardPadding="md">
            <StatLabel>{t('stats.bestWinStreak')}</StatLabel>
            <StatValue data-testid="stats-best-win-streak" color="$success">
              {streaks.bestWinStreak}
              <StreakSuffix>W</StreakSuffix>
            </StatValue>
          </Card>
        )}
        {favoriteGame && (
          <Card variant="glass" cardPadding="md">
            <StatLabel>{t('stats.favoriteGame')}</StatLabel>
            <StatValue data-testid="stats-favorite-game" fontSize="$7">
              🎯
            </StatValue>
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
              mt="$1"
              textAlign="center"
            >
              {favoriteGame}
            </Text>
          </Card>
        )}
      </div>
    </>
  );
}

const StatLabel = styled(Text, {
  name: 'StatsOverviewStatLabel',
  fontSize: '$2',
  color: 'rgba(236,239,238,0.45)',
  textTransform: 'uppercase',
  letterSpacing: 1.2,
  fontWeight: '500',
});

const StatValue = styled(Text, {
  name: 'StatsOverviewStatValue',
  fontSize: '$10',
  fontWeight: '800',
  color: '$primaryGradientStart',
  lineHeight: '$none',
  letterSpacing: -0.5,
});

const WinRateCardContent = styled(YStack, {
  name: 'StatsOverviewWinRateContent',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$4',
});

const StreakSuffix = styled(Text, {
  name: 'StatsOverviewStreakSuffix',
  fontSize: '$5',
  fontWeight: '600',
  color: '$colorMuted',
  marginLeft: 2,
});
