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
