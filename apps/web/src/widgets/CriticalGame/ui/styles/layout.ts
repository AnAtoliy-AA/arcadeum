import styled, { css, keyframes } from 'styled-components';
import { GAME_VARIANT } from '../../lib/constants';

const getVariantBackgroundEffects = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return css`
      perspective: 1000px;
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            transparent 0%,
            rgba(192, 38, 211, 0.2) 2%,
            transparent 3%
          ),
          linear-gradient(
            90deg,
            transparent 0%,
            rgba(6, 182, 212, 0.2) 2%,
            transparent 3%
          );
        background-size: 100px 100px;
        transform: rotateX(60deg);
        animation: gridMove 20s linear infinite;
        z-index: 0;
        pointer-events: none;
      }

      /* CRT Scanline Effect */
      &::after {
        content: ' ';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(
          rgba(18, 16, 16, 0) 50%,
          rgba(0, 0, 0, 0.1) 50%
        );
        background-size: 100% 4px;
        z-index: 2;
        pointer-events: none;
      }
    `;
  }
  if ($variant === GAME_VARIANT.UNDERWATER) {
    return css`
      /* Sunbeams / Caustics imitation */
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          105deg,
          transparent 40%,
          rgba(34, 211, 238, 0.03) 45%,
          transparent 50%,
          rgba(34, 211, 238, 0.02) 55%,
          transparent 60%
        );
        filter: blur(8px);
        transform-origin: top left;
        animation: sunbeamSway 10s ease-in-out infinite alternate;
        pointer-events: none;
      }
    `;
  }
  return css`
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
  `;
};

const getTableAreaGridStyles = ($showChat: boolean) => {
  return css`
    grid-template-columns: ${$showChat
      ? 'minmax(0, 2fr) minmax(260px, 1fr)'
      : 'minmax(0, 1fr)'};
    grid-template-areas: ${$showChat
      ? '"table chat" "hand chat"'
      : '"table" "hand"'};

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      grid-template-rows: ${$showChat ? '1fr auto 2fr' : '1fr auto'};
      grid-template-areas: ${$showChat
        ? '"table" "hand" "chat"'
        : '"table" "hand"'};
    }
  `;
};

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
// Helper function to get variant-specific room background
const getVariantRoomBackground = (
  variant: string | undefined,
  themeBase: string,
  themeCardBg: string,
) => {
  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `
      radial-gradient(
        ellipse at 20% 0%,
        rgba(192, 38, 211, 0.2) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 100%,
        rgba(6, 182, 212, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 50% 50%,
        rgba(168, 85, 247, 0.1) 0%,
        transparent 60%
      ),
      linear-gradient(
        165deg,
        #0a0a0f 0%,
        #1a0a20 100%
      )
    `;
  }
  if (variant === GAME_VARIANT.UNDERWATER) {
    return `
      radial-gradient(
        ellipse at 50% 100%,
        rgba(34, 211, 238, 0.15) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse at 50% 0%,
        rgba(8, 51, 68, 0.2) 0%,
        transparent 70%
      ),
      linear-gradient(
        180deg,
        #082f49 0%,
        #020617 100%
      )
    `;
  }
  return `
    radial-gradient(
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
      ${themeBase} 0%,
      ${themeCardBg} 100%
    )
  `;
};

// Helper function to get variant-specific border
const getVariantRoomBorder = (
  variant: string | undefined,
  isMyTurn: boolean,
  themeBorder: string,
) => {
  if (isMyTurn) {
    if (variant === GAME_VARIANT.CYBERPUNK)
      return '3px solid rgba(192, 38, 211, 0.8)';
    if (variant === GAME_VARIANT.UNDERWATER)
      return '3px solid rgba(34, 211, 238, 0.8)';
    return '3px solid rgba(34, 197, 94, 0.8)';
  }

  if (variant === GAME_VARIANT.CYBERPUNK)
    return '1px solid rgba(192, 38, 211, 0.3)';
  if (variant === GAME_VARIANT.UNDERWATER)
    return '1px solid rgba(34, 211, 238, 0.2)';
  return `1px solid ${themeBorder}`;
};

// Helper function to get variant-specific box shadow
const getVariantRoomShadow = (
  variant: string | undefined,
  isMyTurn: boolean,
) => {
  if (isMyTurn) {
    if (variant === GAME_VARIANT.CYBERPUNK) {
      return `0 0 20px rgba(192, 38, 211, 0.5),
              0 0 40px rgba(6, 182, 212, 0.3),
              inset 0 0 20px rgba(192, 38, 211, 0.15)`;
    }
    return `0 0 20px rgba(34, 197, 94, 0.4),
            0 0 40px rgba(34, 197, 94, 0.2),
            inset 0 0 20px rgba(34, 197, 94, 0.1)`;
  }

  if (variant === GAME_VARIANT.CYBERPUNK) {
    return `0 25px 80px rgba(0, 0, 0, 0.6),
            0 10px 30px rgba(192, 38, 211, 0.15),
            inset 0 1px 0 rgba(192, 38, 211, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2)`;
  }

  return `0 25px 80px rgba(0, 0, 0, 0.4),
          0 10px 30px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)`;
};

// Cyberpunk-specific turn border pulse
const cyberpunkTurnBorderPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 20px rgba(192, 38, 211, 0.5),
      0 0 40px rgba(6, 182, 212, 0.3),
      inset 0 0 20px rgba(192, 38, 211, 0.15);
  }
  50% {
    box-shadow:
      0 0 35px rgba(192, 38, 211, 0.7),
      0 0 70px rgba(6, 182, 212, 0.4),
      inset 0 0 35px rgba(192, 38, 211, 0.2);
  }
`;

export const GameContainer = styled.div<{
  $isMyTurn?: boolean;
  $variant?: string;
}>`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem;
  border-radius: 24px;
  background: ${({ $variant, theme }) =>
    getVariantRoomBackground(
      $variant,
      theme.background.base,
      theme.surfaces.card.background,
    )};
  border: ${({ $isMyTurn, $variant, theme }) =>
    getVariantRoomBorder($variant, !!$isMyTurn, theme.surfaces.card.border)};
  min-height: 600px;
  box-shadow: ${({ $isMyTurn, $variant }) =>
    getVariantRoomShadow($variant, !!$isMyTurn)};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  backdrop-filter: blur(20px);

  /* Background Effects */
  ${({ $variant }) => getVariantBackgroundEffects($variant)}

  @keyframes gridMove {
    0% {
      transform: rotateX(60deg) translateY(0);
    }
    100% {
      transform: rotateX(60deg) translateY(100px);
    }
  }

  ${({ $isMyTurn, $variant }) =>
    $isMyTurn &&
    css`
      animation: ${$variant === GAME_VARIANT.CYBERPUNK
          ? cyberpunkTurnBorderPulse
          : turnBorderPulse}
        2s ease-in-out infinite;
    `}

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

    @media (max-width: 768px) {
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding: 0.5rem 1rem;
      gap: 0.5rem;
    }

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
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
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
  flex: 1;
  ${({ $showChat }) => getTableAreaGridStyles($showChat)}
  grid-template-rows: 1fr auto;
  gap: 1rem;

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
