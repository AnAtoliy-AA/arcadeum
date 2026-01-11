import styled, { css, keyframes } from 'styled-components';

// Animation for the turn border glow
const turnBorderPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 20px rgba(34, 197, 94, 0.4),
      0 0 40px rgba(34, 197, 94, 0.2),
      inset 0 0 20px rgba(34, 197, 94, 0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(34, 197, 94, 0.6),
      0 0 60px rgba(34, 197, 94, 0.3),
      inset 0 0 30px rgba(34, 197, 94, 0.15);
  }
`;

// Layout Components
export const GameContainer = styled.div<{ $isMyTurn?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem;
  border-radius: 24px;
  background: radial-gradient(
      ellipse at 20% 0%,
      rgba(99, 102, 241, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(236, 72, 153, 0.12) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      rgba(16, 185, 129, 0.08) 0%,
      transparent 60%
    ),
    linear-gradient(
      165deg,
      ${({ theme }) => theme.background.base} 0%,
      ${({ theme }) => theme.surfaces.card.background} 100%
    );
  border: ${({ $isMyTurn, theme }) =>
    $isMyTurn
      ? '3px solid rgba(34, 197, 94, 0.8)'
      : `1px solid ${theme.surfaces.card.border}`};
  min-height: 600px;
  box-shadow: ${({ $isMyTurn }) =>
    $isMyTurn
      ? `0 0 20px rgba(34, 197, 94, 0.4),
         0 0 40px rgba(34, 197, 94, 0.2),
         inset 0 0 20px rgba(34, 197, 94, 0.1)`
      : `0 25px 80px rgba(0, 0, 0, 0.4),
         0 10px 30px rgba(0, 0, 0, 0.2),
         inset 0 1px 0 rgba(255, 255, 255, 0.08),
         inset 0 -1px 0 rgba(0, 0, 0, 0.1)`};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  backdrop-filter: blur(20px);

  ${({ $isMyTurn }) =>
    $isMyTurn &&
    css`
      animation: ${turnBorderPulse} 2s ease-in-out infinite;
    `}

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    left: -60%;
    width: 220%;
    height: 220%;
    background: radial-gradient(
        circle at 30% 30%,
        rgba(99, 102, 241, 0.12) 0%,
        transparent 35%
      ),
      radial-gradient(
        circle at 70% 70%,
        rgba(236, 72, 153, 0.1) 0%,
        transparent 35%
      );
    animation: ambientGlow 12s ease-in-out infinite;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(99, 102, 241, 0.8) 15%,
      rgba(236, 72, 153, 0.8) 50%,
      rgba(16, 185, 129, 0.8) 85%,
      transparent 100%
    );
    box-shadow:
      0 0 30px rgba(99, 102, 241, 0.5),
      0 0 60px rgba(236, 72, 153, 0.3);
    animation: shimmer 6s ease-in-out infinite;
  }

  @keyframes ambientGlow {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 0.4;
    }
    33% {
      transform: translate(5%, -5%) rotate(5deg) scale(1.05);
      opacity: 0.6;
    }
    66% {
      transform: translate(-3%, 3%) rotate(-3deg) scale(1.02);
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.7;
      transform: scaleX(1);
    }
    50% {
      opacity: 1;
      transform: scaleX(1.02);
    }
  }

  &:fullscreen,
  &:-moz-full-screen,
  &:-webkit-full-screen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1rem 2rem;
    gap: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &::before {
      opacity: 0.3;
    }

    @media (max-width: 768px) {
      padding: 0.5rem 1rem;
      gap: 0.5rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
    gap: 1rem;
    border-width: 1px;
  }

  @media (max-height: 600px) {
    min-height: auto;
    padding: 0.75rem;
    gap: 0.5rem;
  }

  @media (max-height: 500px) {
    padding: 0.5rem;
    gap: 0.25rem;
  }
`;

export const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  flex: 1;
  min-height: 0;
  // overflow: hidden; Removed to allow bubbles to overflow
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 20;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const TableArea = styled.div<{ $showChat: boolean }>`
  display: grid;
  grid-template-columns: ${({ $showChat }) =>
    $showChat ? 'minmax(0, 2fr) minmax(260px, 1fr)' : 'minmax(0, 1fr)'};
  grid-template-rows: 1fr auto;
  grid-template-areas: ${({ $showChat }) =>
    $showChat ? `"table chat" "hand chat"` : `"table" "hand"`};
  gap: 1rem;
  width: 100%;
  align-items: stretch;
  align-items: stretch;
  min-height: 0;
  flex: 1;
  // overflow: hidden; Removed to allow bubbles to overflow

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: ${({ $showChat }) =>
      $showChat ? '1fr auto 1fr' : '1fr auto'};
    grid-template-areas: ${({ $showChat }) =>
      $showChat ? `"table" "hand" "chat"` : `"table" "hand"`};
  }

  @media (max-width: 768px) {
    gap: 0.75rem;
  }

  @media (max-height: 600px) {
    gap: 0.5rem;
  }
`;

export const HandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  grid-area: hand;
  min-width: 0;
`;

export const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
