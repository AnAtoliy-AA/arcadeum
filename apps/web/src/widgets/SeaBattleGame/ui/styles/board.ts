import styled from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

export const BoardGrid = styled.div<{ $theme: SeaBattleTheme }>`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  background: ${(props) => props.$theme.boardBackground};
  padding: 4px;
  border-radius: ${(props) => props.$theme.borderRadius};
  border: ${(props) => props.$theme.borderWidth || '1px'} solid
    ${(props) => props.$theme.cellBorder};
  max-width: 400px;
  aspect-ratio: 1;
  box-shadow: ${(props) => props.$theme.boxShadow || 'none'};

  @media (max-width: 768px) {
    max-width: none;
    width: 100%;
    gap: 1px;
    padding: 2px;
  }
`;

export const BoardCell = styled.div<{
  $state: number;
  $isClickable?: boolean;
  $isHighlighted?: boolean;
  $theme: SeaBattleTheme;
}>`
  aspect-ratio: 1;
  border-radius: ${(props) => props.$theme.borderRadius};
  background: ${(props) => {
    if (props.$isHighlighted) return props.$theme.cellHover;
    switch (props.$state) {
      case 0:
        return props.$theme.cellEmpty; // Empty
      case 1:
        return props.$theme.shipColor; // Ship
      case 2:
        return props.$theme.hitColor; // Hit
      case 3:
        return props.$theme.missColor; // Miss
      default:
        return 'transparent';
    }
  }};
  border: ${(props) => props.$theme.borderWidth || '1px'} solid
    ${(props) => props.$theme.cellBorder};
  cursor: ${(props) => (props.$isClickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    (props.$state === 1 || props.$state === 2 || props.$isHighlighted) &&
    props.$theme.boxShadow
      ? props.$theme.boxShadow
      : 'none'};

  &:hover {
    background: ${(props) =>
      props.$isClickable ? props.$theme.cellHover : undefined};
    transform: ${(props) => (props.$isClickable ? 'scale(1.05)' : 'none')};
  }
`;

export const BoardWithLabels = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  gap: 4px;

  @media (max-width: 768px) {
    gap: 2px;
    width: 100%;
  }
`;

export const RowLabels = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 4px 0;

  @media (max-width: 768px) {
    /* Labels remain visible on mobile but compact */
  }
`;

export const ColLabels = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 0 4px;

  @media (max-width: 768px) {
    /* Labels remain visible on mobile but compact */
  }
`;

export const Label = styled.span<{ $theme: SeaBattleTheme }>`
  font-size: 0.75rem;
  color: ${(props) => props.$theme.textSecondaryColor};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  @media (max-width: 768px) {
    font-size: 0.5rem;
    width: 12px;
    height: 12px;
  }
`;
