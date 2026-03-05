import styled, { css } from 'styled-components';
import { GAME_VARIANT } from '../../lib/constants';
import { turnBorderPulse, cyberpunkTurnBorderPulse } from './layout-animations';
import { getVariantStyles } from './variants';

export { auroraWave } from './layout-animations';

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
    getVariantStyles($variant).layout.getRoomBackground(
      theme.background.base,
      theme.surfaces.card.background,
    )};
  border: ${({ $isMyTurn, $variant, theme }) =>
    getVariantStyles($variant).layout.getRoomBorder(
      !!$isMyTurn,
      theme.surfaces.card.border,
    )};
  min-height: 600px;
  box-shadow: ${({ $isMyTurn, $variant }) =>
    getVariantStyles($variant).layout.getRoomShadow(!!$isMyTurn)};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  backdrop-filter: blur(20px);

  /* Background Effects */
  ${({ $variant }) => getVariantStyles($variant).layout.getBackgroundEffects()}

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
    overflow-y: auto;
    overflow-x: hidden;
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

export const getTableAreaGridStyles = ($showChat: boolean) => {
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

export const FrostyVignette = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 45;
  background: radial-gradient(
    circle at center,
    transparent 50%,
    rgba(255, 255, 255, 0.02) 70%,
    rgba(125, 211, 252, 0.08) 100%
  );
  box-shadow: inset 0 0 120px rgba(186, 230, 253, 0.2);
  mix-blend-mode: screen;
  border-radius: 20px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.05) 0%,
        transparent 20%
      ),
      linear-gradient(225deg, rgba(255, 255, 255, 0.05) 0%, transparent 20%);
    opacity: 0.4;
  }
`;
