'use client';

import { XStack, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PageTitle } from '@/shared/ui';

interface HistoryHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function HistoryHeader({
  loading,
  refreshing,
  onRefresh,
}: HistoryHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <XStack jc="space-between" ai="center" mb="$8">
        <PageTitle size="xl" gradient>
          {t('navigation.historyTab')}
        </PageTitle>
        <Button
          variant="icon"
          size="sm"
          onClick={onRefresh}
          disabled={loading || refreshing}
          aria-label={t('history.actions.refresh')}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              width: 20,
              height: 20,
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}
          >
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </Button>
      </XStack>
    </>
  );
}
