'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui';
import { XStack } from 'tamagui';

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
    <XStack
      padding="$10"
      justifyContent="center"
      alignItems="center"
      minHeight="50vh"
    >
      <ErrorState
        title="Something went wrong!"
        message={error.message || 'An unexpected error has occurred.'}
        onRetry={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        retryLabel="Try again"
      />
    </XStack>
  );
}
