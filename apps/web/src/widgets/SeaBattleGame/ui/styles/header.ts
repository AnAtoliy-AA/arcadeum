import styled, { css, keyframes } from 'styled-components';
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

export const turnPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(87, 195, 255, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(87, 195, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(87, 195, 255, 0); }
`;

export const TurnIndicator = styled.div<{
  $isYourTurn: boolean;
  $theme: SeaBattleTheme;
}>`
  width: auto;
  min-width: 320px;
  max-width: fit-content;
  margin: 16px auto;
  padding: 12px 32px;
  background: ${(props) =>
    props.$isYourTurn ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 0, 0, 0.75)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid
    ${(props) =>
      props.$isYourTurn
        ? 'rgba(16, 185, 129, 0.5)'
        : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: ${(props) =>
    props.$isYourTurn
      ? '0 10px 40px -10px rgba(16, 185, 129, 0.6)'
      : '0 10px 25px -10px rgba(0, 0, 0, 0.5)'};
  z-index: 90;
  position: sticky;
  top: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '${(props) => (props.$isYourTurn ? '🎯' : '⏳')}';
    font-size: 1.2rem;
  }

  ${(props) =>
    props.$isYourTurn &&
    css`
      animation: ${turnPulse} 2s infinite;
      border-color: #10b981;
    `}

  @media (max-width: 768px) {
    min-width: 200px;
    padding: 8px 16px;
    font-size: 0.8rem;
    margin: 12px auto;
    top: 10px;
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
