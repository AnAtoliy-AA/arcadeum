'use client';

import { useEffect } from 'react';
import { ErrorState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  return (
    <div className="main-outer">
      <div
        style={{
          padding: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <ErrorState
          title={t('common.error.title') || 'Something went wrong!'}
          message={
            error.message ||
            t('common.error.message') ||
            'An unexpected error has occurred.'
          }
          onRetry={() => reset()}
          retryLabel={t('common.error.retry') || 'Try again'}
        />
      </div>
    </div>
  );
}
