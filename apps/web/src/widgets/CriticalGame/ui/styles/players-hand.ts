import styled from 'styled-components';
import { Card, ActionButton } from './cards';

// Hand Components
export const HandHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const HandTitle = styled.h3`
  margin: 0;
  margin-right: auto;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const HandControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const HandToggleButton = styled(ActionButton)`
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  min-width: auto;
  width: auto;
`;

export const HandCard = styled(Card)<{
  $clickable?: boolean;
  $dimmed?: boolean;
}>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  opacity: ${({ $clickable, $dimmed }) => ($clickable ? 1 : $dimmed ? 0.7 : 1)};
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    opacity 0.2s;
`;
