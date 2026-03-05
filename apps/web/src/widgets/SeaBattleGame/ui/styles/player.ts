import styled, { css, keyframes } from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

const turnPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

const targetPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(87, 195, 255, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(87, 195, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(87, 195, 255, 0); }
`;

export const PlayerSection = styled.div<{
  $isMe: boolean;
  $isActive?: boolean;
  $isTargetable?: boolean;
  $theme: SeaBattleTheme;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: ${(props) =>
    props.$isActive
      ? 'rgba(16, 185, 129, 0.1)'
      : props.$isTargetable
        ? 'rgba(87, 195, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.2)'};
  border: ${(props) => props.$theme.borderWidth || '2px'} solid
    ${(props) => {
      if (props.$isActive) return '#10b981';
      if (props.$isTargetable) return '#57c3ff';
      if (props.$isMe) return props.$theme.primaryColor;
      return props.$theme.cellBorder;
    }};
  border-radius: ${(props) => props.$theme.borderRadius};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: visible;
  cursor: ${(props) => (props.$isTargetable ? 'crosshair' : 'default')};

  ${(props) =>
    props.$isActive &&
    css`
      animation: ${turnPulse} 2s infinite;
      z-index: 5;
    `}

  ${(props) =>
    props.$isTargetable &&
    css`
      animation: ${targetPulse} 2s infinite;
      border-color: #57c3ff;
      background: rgba(87, 195, 255, 0.05);

      &:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 15px 35px -10px rgba(87, 195, 255, 0.4);
        background: rgba(87, 195, 255, 0.1);
      }
    `}

  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
  }
`;

export const BadgeWrapper = styled.div`
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 10;
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
