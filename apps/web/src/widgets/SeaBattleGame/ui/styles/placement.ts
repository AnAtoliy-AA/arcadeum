import styled from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

export const ShipPalette = styled.div<{ $theme: SeaBattleTheme }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${(props) => props.$theme.boardBackground};
  border-radius: ${(props) => props.$theme.borderRadius};
  border: 1px solid ${(props) => props.$theme.cellBorder};

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    padding: 12px 8px;
    gap: 16px;
    border: none;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      display: none;
    }
    .ship-palette-title {
      display: none;
    }
  }
`;

export const ShipItem = styled.div<{
  $size: number;
  $isPlaced?: boolean;
  $isSelected?: boolean;
  $theme: SeaBattleTheme;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${(props) =>
    props.$isSelected
      ? props.$theme.cellHover
      : props.$isPlaced
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid
    ${(props) =>
      props.$isSelected
        ? props.$theme.primaryColor
        : props.$isPlaced
          ? 'transparent'
          : props.$theme.cellBorder};
  border-radius: 8px;
  cursor: ${(props) => (props.$isPlaced ? 'default' : 'pointer')};
  opacity: ${(props) => (props.$isPlaced ? 0.5 : 1)};
  color: ${(props) => props.$theme.textColor};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) =>
    props.$isSelected ? `0 0 15px ${props.$theme.primaryColor}33` : 'none'};

  &:hover:not(:disabled) {
    background: ${(props) =>
      !props.$isPlaced ? props.$theme.cellHover : undefined};
    transform: ${(props) => (!props.$isPlaced ? 'translateY(-2px)' : 'none')};
  }

  @media (max-width: 768px) {
    flex-shrink: 0;
    padding: 6px 10px;
  }
`;

export const ShipPreview = styled.div<{ $size: number }>`
  display: flex;
  gap: 2px;
`;

export const ShipCell = styled.div<{ $theme: SeaBattleTheme }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.$theme.shipColor};
  border-radius: 2px;
  border: 1px solid ${(props) => props.$theme.cellBorder};
`;

export const ShipName = styled.span<{ $theme: SeaBattleTheme }>`
  font-size: 0.875rem;
  color: ${(props) => props.$theme.textColor};
  flex: 1;
`;

export const PlacementControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const RotateButton = styled.button<{ $theme: SeaBattleTheme }>`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${(props) => props.$theme.cellBorder};
  border-radius: 4px;
  color: ${(props) => props.$theme.textColor};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.$theme.cellHover};
  }

  @media (max-width: 768px) {
    flex: 1;
    min-width: 120px;
    padding: 10px 16px;
    font-size: 0.875rem;
    border-radius: ${(props) => props.$theme.borderRadius};
    border: none;
    background: ${(props) => props.$theme.primaryColor};
    color: white;
    font-weight: 600;

    &:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

export const PlacementActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding: 8px;
  }
`;

export const ActionButton = styled.button<{
  $variant?: 'primary' | 'secondary';
  $theme: SeaBattleTheme;
}>`
  padding: 12px 24px;
  border: none;
  border-radius: ${(props) => props.$theme.borderRadius};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${(props) => props.$theme.fontFamily || 'inherit'};

  background: ${(props) =>
    props.$variant === 'primary'
      ? props.$theme.primaryColor
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${(props) =>
    props.$variant === 'primary' ? '#fff' : props.$theme.textColor};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.875rem;
    flex: 1;
    min-width: 120px;
  }
`;
