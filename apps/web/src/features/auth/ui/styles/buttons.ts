import styled from 'styled-components';
import { Button } from '@/shared/ui';

// Auth-specific buttons with pill style (border-radius: 999px)
export const PrimaryButton = styled(Button)`
  border-radius: 999px;
  padding: 0.75rem 1.6rem;
`;

export const SecondaryButton = styled(Button).attrs({ variant: 'secondary' })`
  border-radius: 999px;
  padding: 0.75rem 1.6rem;
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;
