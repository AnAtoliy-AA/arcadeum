import styled from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

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

export const TurnIndicator = styled.div<{
  $isYourTurn: boolean;
  $theme: SeaBattleTheme;
}>`
  width: 100%;
  padding: 10px 16px;
  background: ${(props) =>
    props.$isYourTurn
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : 'rgba(0, 0, 0, 0.6)'};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 800;
  white-space: nowrap;
  color: white;
  letter-spacing: 0.05em;
  box-shadow: ${(props) =>
    props.$isYourTurn ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'};
  z-index: 99;
  position: sticky;
  top: 0;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 8px 12px;
  }
`;

export const PhaseIndicator = styled.div<{ $theme: SeaBattleTheme }>`
  padding: 8px 16px;
  background: ${(props) => props.$theme.boardBackground};
  border: 1px solid ${(props) => props.$theme.primaryColor};
  border-radius: 20px;
  color: ${(props) => props.$theme.primaryColor};
  font-size: 0.875rem;
  font-weight: 500;
`;

export const PlacementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-bottom: 12px;
  }
`;
