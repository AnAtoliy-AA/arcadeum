import styled from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

// Main game container
export const GameContainer = styled.div<{ $theme: SeaBattleTheme }>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${(props) => props.$theme.gameBackground};
  font-family: ${(props) => props.$theme.fontFamily || 'inherit'};
  transition: background 0.5s ease;
`;

// Header section
export const GameHeader = styled.div<{ $theme: SeaBattleTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid ${(props) => props.$theme.cellBorder};
`;

export const GameTitle = styled.h1<{ $theme: SeaBattleTheme }>`
  margin: 0;
  font-size: 1.5rem;
  color: ${(props) => props.$theme.textColor};
  font-weight: 600;
`;

export const GameStatus = styled.span<{ $theme: SeaBattleTheme }>`
  font-size: 0.875rem;
  color: ${(props) => props.$theme.textSecondaryColor};
`;

// Main content area
export const GameContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Game board area
export const BoardArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
`;

// Chat/sidebar area
export const SidebarArea = styled.div`
  width: 320px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 300px;
  }
`;

// Board grid
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
`;

// Individual cell
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

// Row labels container
export const BoardWithLabels = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  gap: 4px;
`;

export const RowLabels = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 4px 0;
`;

export const ColLabels = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 0 4px;
`;

export const Label = styled.span<{ $theme: SeaBattleTheme }>`
  font-size: 0.75rem;
  color: ${(props) => props.$theme.textSecondaryColor};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

// Player section
export const PlayerSection = styled.div<{
  $isMe: boolean;
  $isActive?: boolean;
  $theme: SeaBattleTheme;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: ${(props) =>
    props.$isActive ? props.$theme.boardBackground : 'rgba(0, 0, 0, 0.2)'};
  border: ${(props) => props.$theme.borderWidth || '2px'} solid
    ${(props) =>
      props.$isMe
        ? props.$theme.primaryColor
        : props.$isActive
          ? props.$theme.accentColor
          : props.$theme.cellBorder};
  border-radius: ${(props) => props.$theme.borderRadius};
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$isActive
      ? props.$theme.boxShadow || '0 0 15px rgba(0,0,0,0.2)'
      : 'none'};
`;

export const PlayerName = styled.h3<{ $theme: SeaBattleTheme }>`
  margin: 0;
  color: ${(props) => props.$theme.textColor};
  font-size: 1rem;
  font-weight: 500;
`;

export const PlayerStats = styled.div<{ $theme: SeaBattleTheme }>`
  font-size: 0.875rem;
  color: ${(props) => props.$theme.textSecondaryColor};
`;

// Ship palette for placement
export const ShipPalette = styled.div<{ $theme: SeaBattleTheme }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${(props) => props.$theme.boardBackground};
  border-radius: ${(props) => props.$theme.borderRadius};
  border: 1px solid ${(props) => props.$theme.cellBorder};
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
        ? 'rgba(0,0,0,0.1)'
        : 'transparent'};
  border: 1px solid
    ${(props) =>
      props.$isSelected
        ? props.$theme.primaryColor
        : props.$isPlaced
          ? 'transparent'
          : props.$theme.cellBorder};
  border-radius: 4px;
  cursor: ${(props) => (props.$isPlaced ? 'default' : 'pointer')};
  opacity: ${(props) => (props.$isPlaced ? 0.6 : 1)};
  color: ${(props) => props.$theme.textColor};
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

// Action buttons
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
`;

// Turn indicator
export const TurnIndicator = styled.div<{
  $isYourTurn: boolean;
  $theme: SeaBattleTheme;
}>`
  padding: 12px 20px;
  background: ${(props) =>
    props.$isYourTurn ? props.$theme.cellHover : 'transparent'};
  border: 1px solid
    ${(props) =>
      props.$isYourTurn ? props.$theme.accentColor : props.$theme.cellBorder};
  border-radius: ${(props) => props.$theme.borderRadius};
  text-align: center;
  color: ${(props) =>
    props.$isYourTurn
      ? props.$theme.accentColor
      : props.$theme.textSecondaryColor};
  font-weight: 500;
  margin-bottom: 20px;
`;

// Grids container for multiplayer
export const GridsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
`;

// Phase indicator
export const PhaseIndicator = styled.div<{ $theme: SeaBattleTheme }>`
  padding: 8px 16px;
  background: ${(props) => props.$theme.boardBackground};
  border: 1px solid ${(props) => props.$theme.primaryColor};
  border-radius: 20px;
  color: ${(props) => props.$theme.primaryColor};
  font-size: 0.875rem;
  font-weight: 500;
`;

// Placement header
export const PlacementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
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
`;
