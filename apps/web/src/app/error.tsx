'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui';
import { XStack } from 'tamagui';

import { BrowserRegistry } from './BrowserRegistry';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  return (
    <main className="main-outer">
      <BrowserRegistry>
        <XStack
          padding="$10"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <ErrorState
            title="Something went wrong!"
            message={error.message || 'An unexpected error has occurred.'}
            onRetry={() => reset()}
            retryLabel="Try again"
          />
        </XStack>
      </BrowserRegistry>
    </main>
  );
}
