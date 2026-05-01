import { YStack, Text, styled, H3, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactElement } from 'react';
import { Button } from '../Button/Button';

export type ErrorStateProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  'data-testid'?: string;
};

const StyledError = styled(YStack, {
  name: 'ErrorState',
  padding: '$8',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$4',
  backgroundColor: '$background',
});

const ErrorIcon = styled(Text, {
  name: 'ErrorIcon',
  fontSize: '$8',
});

const ErrorTitle = styled(H3, {
  name: 'ErrorTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const ErrorMessage = styled(Text, {
  name: 'ErrorMessage',
  fontSize: '$3',
  color: '$color',
  opacity: 0.6,
  style: {
    textAlign: 'center',
  },
});

export const ErrorState = memo(function ErrorState({
  message,
  title,
  onRetry,
  retryLabel = 'Try Again',
  'data-testid': dataTestId,
}: ErrorStateProps): ReactElement {
  return (
    <StyledError data-testid={dataTestId}>
      <ErrorIcon>⚠️</ErrorIcon>
      {title && <ErrorTitle>{title}</ErrorTitle>}
      <ErrorMessage>{message}</ErrorMessage>
      {onRetry && (
        <YStack marginTop="$4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </YStack>
      )}
    </StyledError>
  );
});
