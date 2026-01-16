import React from 'react';
import styled from 'styled-components';
import type { PlayerStats } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Grid,
  Card,
  StatValue,
  StatLabel,
  Skeleton,
  SkeletonText,
} from '../styles';
import { ProgressCircle } from '@/shared/ui/Progress';

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
          <Card key={i}>
            <SkeletonText
              $width="60%"
              $height="14px"
              style={{ marginBottom: '0.5rem' }}
            />
            <SkeletonValue />
            <SkeletonBar $delay={i * 0.1} />
          </Card>
        ))}
      </Grid>
    );
  }

  if (!stats) return null;

  return (
    <Grid>
      <Card>
        <StatLabel>{t('stats.totalGames')}</StatLabel>
        <StatValue>{stats.totalGames}</StatValue>
      </Card>
      <Card>
        <StatLabel>{t('stats.wins')}</StatLabel>
        <StatValue style={{ color: '#10b981' }}>{stats.wins}</StatValue>
      </Card>
      <Card>
        <StatLabel>{t('stats.losses')}</StatLabel>
        <StatValue style={{ color: '#ef4444' }}>{stats.losses}</StatValue>
      </Card>
      <WinRateCard>
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

const SkeletonValue = styled(Skeleton)`
  width: 80px;
  height: 40px;
  margin-bottom: 0.5rem;
`;

const SkeletonBar = styled(Skeleton)<{ $delay?: number }>`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  margin-top: auto;
  animation-delay: ${({ $delay }) => $delay || 0}s;
`;

const WinRateCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;
