import styled from 'styled-components';
import { HTMLAttributes } from 'react';
import { Spinner } from '../Spinner';

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StyledLoading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

const LoadingMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
`;

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  ...props
}: LoadingStateProps) {
  return (
    <StyledLoading {...props}>
      <Spinner size={size} />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </StyledLoading>
  );
}
