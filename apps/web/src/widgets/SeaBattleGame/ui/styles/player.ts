import styled from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

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

  @media (max-width: 768px) {
    padding: 0;
    gap: 4px;
    align-items: stretch;
    width: 100%;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
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
