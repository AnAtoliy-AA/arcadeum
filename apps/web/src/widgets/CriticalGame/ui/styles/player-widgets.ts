import styled from 'styled-components';
import { getVariantStyles } from './variants';

export const PlayerStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
`;

export const PlayerCardCount = styled.div<{
  $isCurrentTurn?: boolean;
  $variant?: string;
  $type?: 'default' | 'stash' | 'marked';
}>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? `rgba(0, 0, 0, 0.5)` : theme.background.base};
  border: 1px solid
    ${({ $isCurrentTurn, theme }) =>
      $isCurrentTurn ? 'rgba(255, 255, 255, 0.4)' : theme.surfaces.card.border};
  font-weight: 700;
  color: ${({ $isCurrentTurn }) => ($isCurrentTurn ? '#fff' : 'inherit')};
  text-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'};

  /* Variant & Type Specific Styles */
  ${({ $variant, $type, $isCurrentTurn }) =>
    getVariantStyles($variant).players.getCardCountStyles?.(
      $isCurrentTurn,
      $type,
    )}

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }
`;

export const TurnIndicator = styled.div<{ $variant?: string }>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;

  ${({ $variant }) =>
    getVariantStyles($variant).players.getTurnIndicatorStyles?.()}
`;
