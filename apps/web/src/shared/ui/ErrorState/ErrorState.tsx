import styled from 'styled-components';
import { HTMLAttributes } from 'react';
import { Button } from '../Button';

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const StyledError = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

const ErrorTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.muted};
`;

const RetryButton = styled(Button).attrs({ variant: 'secondary', size: 'sm' })`
  margin-top: 0.5rem;
`;

export function ErrorState({
  message,
  title,
  onRetry,
  retryLabel = 'Try Again',
  ...props
}: ErrorStateProps) {
  return (
    <StyledError {...props}>
      <ErrorIcon>⚠️</ErrorIcon>
      {title && <ErrorTitle>{title}</ErrorTitle>}
      <ErrorMessage>{message}</ErrorMessage>
      {onRetry && <RetryButton onClick={onRetry}>{retryLabel}</RetryButton>}
    </StyledError>
  );
}
