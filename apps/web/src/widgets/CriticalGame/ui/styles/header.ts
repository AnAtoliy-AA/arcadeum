import styled, { keyframes, css, DefaultTheme } from 'styled-components';
import { GAME_VARIANT } from '../../lib/constants';

// Helper functions for variant-specific styles
const getHeaderBackground = (
  variant: string | undefined,
  theme: DefaultTheme,
) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return 'linear-gradient(135deg, rgba(20, 10, 35, 0.95), rgba(45, 10, 60, 0.9))';
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return 'linear-gradient(135deg, rgba(8, 51, 68, 0.95), rgba(22, 78, 99, 0.9))';
  }
  return `linear-gradient(135deg, ${theme.surfaces.card.background}f5, ${theme.surfaces.panel.background}e8)`;
};

const getHeaderBorder = (variant: string | undefined, theme: DefaultTheme) => {
  if (variant === GAME_VARIANT.CYBERPUNK) return 'rgba(192, 38, 211, 0.3)';
  return `${theme.surfaces.card.border}40`;
};

const getHeaderLineBackground = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `linear-gradient(90deg, transparent 0%, rgba(192, 38, 211, 0.6) 25%, rgba(6, 182, 212, 0.6) 50%, rgba(192, 38, 211, 0.6) 75%, transparent 100%)`;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return `linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.6) 25%, rgba(8, 51, 68, 0.6) 50%, rgba(34, 211, 238, 0.6) 75%, transparent 100%)`;
  }
  return `linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.4) 25%, rgba(236, 72, 153, 0.4) 50%, rgba(16, 185, 129, 0.4) 75%, transparent 100%)`;
};

const getHeaderLineShadow = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return '0 0 10px rgba(192, 38, 211, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)';
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(22, 78, 99, 0.3)';
  }
  return 'none';
};

const getTitleBackground = (variant: string | undefined) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return 'linear-gradient(135deg, #c026d3 0%, #06b6d4 50%, #7c3aed 100%)';
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return 'linear-gradient(135deg, #22d3ee 0%, #0891b2 50%, #164e63 100%)';
  }
  return 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%)';
};

// Header Components
export const GameHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.75rem;
  background: ${({ $variant, theme }) => getHeaderBackground($variant, theme)};
  backdrop-filter: blur(16px);
  border-bottom: 1px solid
    ${({ $variant, theme }) => getHeaderBorder($variant, theme)};
  margin: -2rem -2rem 0 -2rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 30;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ $variant }) => getHeaderLineBackground($variant)};
    box-shadow: ${({ $variant }) => getHeaderLineShadow($variant)};
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    margin: -1.25rem -1.25rem 0 -1.25rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const TimerControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

export const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const GameTitle = styled.h2<{ $variant?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ $variant }) => getTitleBackground($variant)};
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
  position: relative;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      &::before,
      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a0a20;
      }
      &::before {
        left: 2px;
        text-shadow: -1px 0 #00ffff;
        background: #1a0a20;
        animation: glitchTop 1s infinite linear alternate-reverse;
      }
      &::after {
        left: -2px;
        text-shadow: -1px 0 #ff00ff;
        background: #1a0a20;
        animation: glitchBottom 1.5s infinite linear alternate-reverse;
      }
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      text-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          transparent 0%,
          rgba(34, 211, 238, 0.1) 50%,
          transparent 100%
        );
        background-size: 100% 200%;
        animation: waterReflect 3s infinite linear;
        pointer-events: none;
      }
    `}

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const TurnStatus = styled.div<{
  $variant?: 'yourTurn' | 'waiting' | 'completed' | 'default';
}>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'yourTurn':
        return '#10b981';
      case 'waiting':
        return '#f59e0b';
      case 'completed':
        return '#8b5cf6';
      default:
        return theme.text.secondary;
    }
  }};
`;

const buttonPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const StartButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  cursor: pointer;
  animation: ${buttonPulse} 2s ease-in-out infinite;

  &:hover:not(:disabled) {
    transform: scale(1.08);
    animation: none;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
  }
`;

export const FullscreenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.surfaces.card.background};
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ChatToggleButton = styled.button<{ $active?: boolean }>`
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
`;
