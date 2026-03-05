'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui';
import styled from 'styled-components';

const Container = styled.div`
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

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
    <Container>
      <ErrorState
        title="Something went wrong!"
        message={error.message || 'An unexpected error has occurred.'}
        onRetry={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        retryLabel="Try again"
      />
    </Container>
  );
}
