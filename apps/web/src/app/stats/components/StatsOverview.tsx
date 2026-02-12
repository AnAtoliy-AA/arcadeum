import React from 'react';
import styled from 'styled-components';
import type { PlayerStats } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Card } from '@/shared/ui';
import { SkeletonText } from '@/shared/ui/Skeleton';
import { ProgressCircle, PROGRESS_COLORS } from '@/shared/ui/Progress';

interface StatsOverviewProps {
  stats: PlayerStats | null;
  loading: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <Grid>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="glass" padding="md">
            <SkeletonText width="60%" height="14px" delay={i * 0.1} />
            <SkeletonValue delay={i * 0.1 + 0.05} />
          </Card>
        ))}
      </Grid>
    );
  }

  if (!stats) return null;

  return (
    <Grid>
      <StatCard variant="glass" padding="md" interactive>
        <StatLabel>{t('stats.totalGames')}</StatLabel>
        <StatValue>{stats.totalGames}</StatValue>
      </StatCard>
      <StatCard variant="glass" padding="md" interactive>
        <StatLabel>{t('stats.wins')}</StatLabel>
        <StatValue $color={PROGRESS_COLORS.success}>{stats.wins}</StatValue>
      </StatCard>
      <StatCard variant="glass" padding="md" interactive>
        <StatLabel>{t('stats.losses')}</StatLabel>
        <StatValue $color={PROGRESS_COLORS.danger}>{stats.losses}</StatValue>
      </StatCard>
      <WinRateCard variant="glass" padding="md" interactive>
        <StatLabel>{t('stats.winRate')}</StatLabel>
        <ProgressCircle
          value={stats.winRate}
          size={80}
          strokeWidth={8}
          animate
        />
      </WinRateCard>
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
`;

const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 2.75rem;
  font-weight: 800;
  color: ${({ $color, theme }) =>
    $color || theme.buttons.primary.gradientStart};
  line-height: 1;
  letter-spacing: -0.02em;
`;

const SkeletonValue = styled.div<{ delay?: number }>`
  width: 80px;
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.surfaces.card.border} 0%,
    ${({ theme }) => theme.surfaces.card.background} 50%,
    ${({ theme }) => theme.surfaces.card.border} 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: ${({ delay }) => delay || 0}s;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const WinRateCard = styled(StatCard)`
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;
