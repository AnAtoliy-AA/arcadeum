import styled, { keyframes, css } from 'styled-components';

// Header Components
export const GameHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.75rem;
  background: ${({ $variant, theme }) =>
    $variant === 'cyberpunk'
      ? 'linear-gradient(135deg, rgba(20, 10, 35, 0.95), rgba(45, 10, 60, 0.9))'
      : `linear-gradient(135deg, ${theme.surfaces.card.background}f5, ${theme.surfaces.panel.background}e8)`};
  backdrop-filter: blur(16px);
  border-bottom: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'cyberpunk'
        ? 'rgba(192, 38, 211, 0.3)'
        : `${theme.surfaces.card.border}40`};
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
    background: ${({ $variant }) =>
      $variant === 'cyberpunk'
        ? `linear-gradient(
            90deg,
            transparent 0%,
            rgba(192, 38, 211, 0.6) 25%,
            rgba(6, 182, 212, 0.6) 50%,
            rgba(192, 38, 211, 0.6) 75%,
            transparent 100%
          )`
        : `linear-gradient(
            90deg,
            transparent 0%,
            rgba(99, 102, 241, 0.4) 25%,
            rgba(236, 72, 153, 0.4) 50%,
            rgba(16, 185, 129, 0.4) 75%,
            transparent 100%
          )`};
    box-shadow: ${({ $variant }) =>
      $variant === 'cyberpunk'
        ? '0 0 10px rgba(192, 38, 211, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)'
        : 'none'};
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
  background: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? 'linear-gradient(135deg, #c026d3 0%, #06b6d4 50%, #7c3aed 100%)'
      : 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%)'};
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
  position: relative;

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
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

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  /* Glitch Keyframes */
  @keyframes glitch {
    2%,
    64% {
      transform: translate(2px, 0) skew(0deg);
    }
    4%,
    60% {
      transform: translate(-2px, 0) skew(0deg);
    }
    62% {
      transform: translate(0, 0) skew(5deg);
    }
  }

  @keyframes glitchTop {
    2%,
    64% {
      transform: translate(2px, -2px);
    }
    4%,
    60% {
      transform: translate(-2px, 2px);
    }
    62% {
      transform: translate(13px, -1px) skew(-13deg);
    }
  }

  @keyframes glitchBottom {
    2%,
    64% {
      transform: translate(-2px, 0);
    }
    4%,
    60% {
      transform: translate(-2px, 0);
    }
    62% {
      transform: translate(-22px, 5px) skew(21deg);
    }
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Extending GameTitle to accept $variant locally or we can modify the component definition
// But let's look at how GameTitle is defined. It is a styled.h2.
// I will modify the definition below to accept $variant.

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
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}80;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.surfaces.card.background}ee,
    ${({ theme }) => theme.surfaces.panel.background}cc
  );
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.2),
      rgba(236, 72, 153, 0.1)
    );
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-2px) scale(1.05);
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow:
      0 8px 20px rgba(99, 102, 241, 0.25),
      0 4px 8px rgba(0, 0, 0, 0.1);
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
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
