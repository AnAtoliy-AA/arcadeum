import styled from 'styled-components';
import { Button } from '@/shared/ui';

export const ActionButton = styled(Button)<{
  $primary?: boolean;
  $danger?: boolean;
}>`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  ${({ $danger }) =>
    $danger &&
    `
    border-color: currentColor;
    opacity: 0.7;
  `}
`;

// Map variants for convenience
export const PrimaryActionButton = styled(Button).attrs({ variant: 'primary' })`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
`;

export const SecondaryActionButton = styled(Button).attrs({
  variant: 'secondary',
})`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
`;

export const DangerActionButton = styled(Button).attrs({ variant: 'danger' })`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
`;

export const ConfirmRow = styled.div`
  display: flex;
  gap: 1rem;

  button {
    flex: 1;
  }
`;
