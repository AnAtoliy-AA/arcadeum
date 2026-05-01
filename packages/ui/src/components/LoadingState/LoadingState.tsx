import { YStack, Text, styled, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactElement } from 'react';
import { Spinner, SpinnerSize } from '../Spinner/Spinner';

export type LoadingStateProps = {
  message?: string;
  size?: SpinnerSize;
  'data-testid'?: string;
};

const StyledLoading = styled(YStack, {
  name: 'LoadingState',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$4',
  padding: '$8',
});

const LoadingMessage = styled(Text, {
  name: 'LoadingMessage',
  fontSize: '$3',
  color: '$color',
  opacity: 0.6,
});

export const LoadingState = memo(function LoadingState({
  message = 'Loading...',
  size = 'md',
  'data-testid': dataTestId,
}: LoadingStateProps): ReactElement {
  return (
    <StyledLoading data-testid={dataTestId}>
      <Spinner size={size} />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </StyledLoading>
  );
});
