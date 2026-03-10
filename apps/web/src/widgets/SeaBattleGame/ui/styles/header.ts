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
  min-width: 240px;
  max-width: fit-content;
  padding: 8px 24px;
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
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: ${(props) =>
    props.$isYourTurn
      ? '0 10px 40px -10px rgba(16, 185, 129, 0.6)'
      : '0 10px 25px -10px rgba(0, 0, 0, 0.5)'};
  z-index: 90;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '${(props) => (props.$isYourTurn ? '🎯' : '⏳')}';
    font-size: 1.1rem;
  }

  ${(props) =>
    props.$isYourTurn &&
    css`
      animation: ${turnPulse} 2s infinite;
      border-color: #10b981;
    `}

  @media (max-width: 1024px) {
    min-width: 0;
    padding: 6px 16px;
    font-size: 0.8rem;

    &::before {
      font-size: 1rem;
    }
  }
`;

export const CompactHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
  padding: 0.5rem 0;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const HeaderTitleArea = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;

  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
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

export const ChatToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 1024px) {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
`;
