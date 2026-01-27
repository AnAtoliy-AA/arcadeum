import styled from 'styled-components';
import { PageTitle, Button } from '@/shared/ui';

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled(PageTitle).attrs({ size: 'lg' })``;

export const RefreshButton = styled(Button).attrs({
  variant: 'secondary',
  size: 'sm',
})``;

export const RefreshIcon = styled.span<{ $spinning: boolean }>`
  display: inline-block;
  font-size: 1.25rem;
  animation: ${({ $spinning }) =>
    $spinning ? 'spin 1s linear infinite' : 'none'};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
