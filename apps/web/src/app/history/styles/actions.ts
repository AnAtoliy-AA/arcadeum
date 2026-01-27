import styled from 'styled-components';
import { Button } from '@/shared/ui';

// Map variants directly - primary, secondary, danger
export const PrimaryActionButton = styled(Button).attrs({
  variant: 'primary',
})``;
export const SecondaryActionButton = styled(Button).attrs({
  variant: 'secondary',
})``;
export const DangerActionButton = styled(Button).attrs({ variant: 'danger' })``;

export const ConfirmRow = styled.div`
  display: flex;
  gap: 1rem;

  button {
    flex: 1;
  }
`;
