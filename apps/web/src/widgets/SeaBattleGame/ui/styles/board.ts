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
    let bgColor = 'transparent';
    switch (props.$state) {
      case 0:
        bgColor = props.$theme.cellEmpty;
        break;
      case 1:
        bgColor = props.$theme.shipColor;
        break;
      case 2:
        bgColor = props.$theme.hitColor;
        break;
      case 3:
        bgColor = props.$theme.missColor;
        break;
    }

    if (props.$isHighlighted) {
      return `color-mix(in srgb, ${bgColor}, ${props.$theme.cellHover} 70%)`;
    }
    return bgColor;
  }};
  border: ${(props) => props.$theme.borderWidth || '1px'} solid
    ${(props) => props.$theme.cellBorder};
  cursor: ${(props) => (props.$isClickable ? 'pointer' : 'default')};
  transition:
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;
  box-shadow: ${(props) =>
    (props.$state === 1 || props.$state === 2 || props.$isHighlighted) &&
    props.$theme.boxShadow
      ? props.$theme.boxShadow
      : 'none'};

  &:hover {
    background: ${(props) =>
      props.$isClickable
        ? `color-mix(in srgb, ${props.$state === 1 ? props.$theme.shipColor : props.$state === 2 ? props.$theme.hitColor : props.$state === 3 ? props.$theme.missColor : props.$theme.cellEmpty}, ${props.$theme.cellHover} 85%)`
        : undefined};
    transform: ${(props) => (props.$isClickable ? 'scale(1.12)' : 'none')};
    z-index: 10;
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
