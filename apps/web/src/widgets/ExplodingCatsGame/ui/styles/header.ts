import styled, { keyframes } from 'styled-components';

// Header Components
export const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.75rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.surfaces.card.background}f5,
    ${({ theme }) => theme.surfaces.panel.background}e8
  );
  backdrop-filter: blur(16px);
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border}40;
  margin: -2rem -2rem 0 -2rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(99, 102, 241, 0.4) 25%,
      rgba(236, 72, 153, 0.4) 50%,
      rgba(16, 185, 129, 0.4) 75%,
      transparent 100%
    );
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

export const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const GameTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;

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

export const TurnStatus = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

export const ServerLoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  margin-top: 0.75rem;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08) 0%,
    rgba(139, 92, 246, 0.06) 50%,
    rgba(236, 72, 153, 0.05) 100%
  );
  backdrop-filter: blur(12px);
  border-radius: 14px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  max-width: 420px;
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 4px 20px rgba(99, 102, 241, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      #6366f1 0%,
      #8b5cf6 25%,
      #ec4899 50%,
      #8b5cf6 75%,
      #6366f1 100%
    );
    background-size: 200% 100%;
    animation: ${gradientShift} 3s ease infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s ease-in-out infinite;
    pointer-events: none;
  }
`;

export const ServerLoadingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ServerLoadingSpinner = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2.5px solid rgba(99, 102, 241, 0.15);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2.5px solid transparent;
    border-top-color: #6366f1;
    border-right-color: #8b5cf6;
    border-radius: 50%;
    animation: ${spinAnimation} 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
  }
`;

export const ServerLoadingTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  letter-spacing: -0.2px;
`;

export const ServerLoadingText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.5;
  padding-left: 36px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      to bottom,
      rgba(99, 102, 241, 0.4),
      rgba(236, 72, 153, 0.2),
      transparent
    );
  }
`;

export const ServerLoadingProgressBar = styled.div<{ $progress: number }>`
  position: relative;
  height: 6px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    width: ${({ $progress }) => $progress}%;
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    border-radius: 3px;
    transition: width 0.3s ease-out;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease-in-out infinite;
  }
`;

export const ServerLoadingFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
  padding-left: 36px;
`;

export const ServerLoadingPercentage = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  font-variant-numeric: tabular-nums;
`;

export const ServerLoadingTimer = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.text.secondary};
  opacity: 0.7;
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
