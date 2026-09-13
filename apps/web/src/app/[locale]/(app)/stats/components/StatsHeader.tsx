'use client';

import type React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { PageTitle, Button } from '@arcadeum/ui';

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
    <div className="flex flex-row items-center justify-between mb-4 sm:mb-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="xl" gradient>
          {t('stats.pageTitle')}
        </PageTitle>
      </div>
      <Button
        variant="icon"
        size="sm"
        onClick={onRefresh}
        disabled={loading || refreshing}
        className="transition-transform active:scale-95"
      >
        <svg
          className={`w-5 h-5 transition-transform ${refreshing ? 'animate-spin' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
      </Button>
    </div>
  );
}
