import styled from 'styled-components';
import { Spinner as SharedSpinner, Button } from '@/shared/ui';

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const Spinner = SharedSpinner;

export const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

export const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export const ErrorText = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const RetryButton = styled(Button).attrs({
  variant: 'secondary',
  size: 'sm',
})``;
