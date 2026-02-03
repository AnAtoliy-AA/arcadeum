import styled from 'styled-components';

// Main game container
export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1a 0%, #1a2233 100%);
`;

// Header section
export const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const GameTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
  font-weight: 600;
`;

export const GameStatus = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
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
export const BoardGrid = styled.div<{ $size?: number }>`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px;
  border-radius: 8px;
  max-width: 400px;
  aspect-ratio: 1;
`;

// Individual cell
export const BoardCell = styled.div<{
  $state: number;
  $isClickable?: boolean;
  $isHighlighted?: boolean;
}>`
  aspect-ratio: 1;
  background: ${(props) => {
    if (props.$isHighlighted) return 'rgba(59, 130, 246, 0.5)';
    switch (props.$state) {
      case 0:
        return 'rgba(255, 255, 255, 0.05)'; // Empty
      case 1:
        return 'var(--color-primary)'; // Ship
      case 2:
        return 'var(--color-error)'; // Hit
      case 3:
        return 'rgba(255, 255, 255, 0.3)'; // Miss
      default:
        return 'transparent';
    }
  }};
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: ${(props) => (props.$isClickable ? 'pointer' : 'default')};
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$isClickable ? 'rgba(59, 130, 246, 0.3)' : undefined};
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

export const Label = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
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
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: ${(props) =>
    props.$isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
  border: 2px solid
    ${(props) =>
      props.$isMe
        ? 'var(--color-primary)'
        : props.$isActive
          ? 'rgba(59, 130, 246, 0.5)'
          : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  transition: all 0.3s ease;
`;

export const PlayerName = styled.h3`
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 500;
`;

export const PlayerStats = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

// Ship palette for placement
export const ShipPalette = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

export const ShipItem = styled.div<{
  $size: number;
  $isPlaced?: boolean;
  $isSelected?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${(props) =>
    props.$isSelected
      ? 'rgba(59, 130, 246, 0.3)'
      : props.$isPlaced
        ? 'rgba(76, 175, 80, 0.2)'
        : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid
    ${(props) =>
      props.$isSelected
        ? 'var(--color-primary)'
        : props.$isPlaced
          ? 'rgba(76, 175, 80, 0.5)'
          : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 4px;
  cursor: ${(props) => (props.$isPlaced ? 'default' : 'pointer')};
  opacity: ${(props) => (props.$isPlaced ? 0.6 : 1)};
`;

export const ShipPreview = styled.div<{ $size: number }>`
  display: flex;
  gap: 2px;
`;

export const ShipCell = styled.div`
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 2px;
`;

export const ShipName = styled.span`
  font-size: 0.875rem;
  color: var(--color-text);
  flex: 1;
`;

// Action buttons
export const ActionButton = styled.button<{
  $variant?: 'primary' | 'secondary';
}>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${(props) =>
    props.$variant === 'primary'
      ? 'var(--color-primary)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${(props) =>
    props.$variant === 'primary' ? '#fff' : 'var(--color-text)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Turn indicator
export const TurnIndicator = styled.div<{ $isYourTurn: boolean }>`
  padding: 12px 20px;
  background: ${(props) =>
    props.$isYourTurn ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid
    ${(props) =>
      props.$isYourTurn
        ? 'rgba(76, 175, 80, 0.5)'
        : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  text-align: center;
  color: ${(props) =>
    props.$isYourTurn ? '#4caf50' : 'var(--color-text-secondary)'};
  font-weight: 500;
`;

// Grids container for multiplayer
export const GridsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
`;

// Phase indicator
export const PhaseIndicator = styled.div`
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  color: var(--color-primary);
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

export const RotateButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
