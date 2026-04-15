'use client';

import React from 'react';
import { styled, XStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PageTitle } from '@/shared/ui';
import { Button } from '@arcadeum/ui';

export const statsHeaderCSS = `
  @keyframes stats-header-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .stats-refresh-icon--spinning {
    animation: stats-header-spin 1s linear infinite;
  }
`;

interface StatsHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function StatsHeader({
  loading,
  refreshing,
  onRefresh,
}: StatsHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <style>{statsHeaderCSS}</style>
      <PageTitle size="xl" gradient>
        {t('stats.pageTitle')}
      </PageTitle>
      <Button
        variant="icon"
        size="sm"
        onClick={onRefresh}
        disabled={loading || refreshing}
      >
        <svg
          className={refreshing ? 'stats-refresh-icon--spinning' : ''}
          style={{ width: 20, height: 20 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
      </Button>
    </Header>
  );
}

const Header = styled(XStack, {
  name: 'StatsHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$7',
} as never);
