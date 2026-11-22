'use client';

import { ErrorState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface GamesErrorProps {
  onRetry?: () => void;
}

export function GamesError({ onRetry }: GamesErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="col-span-full" data-testid="games-error">
      <ErrorState
        title={t('roomsBrowser.errorTitle')}
        message={t('roomsBrowser.errorMessage')}
        onRetry={onRetry}
        retryLabel={t('roomsBrowser.retry')}
      />
    </div>
  );
}
