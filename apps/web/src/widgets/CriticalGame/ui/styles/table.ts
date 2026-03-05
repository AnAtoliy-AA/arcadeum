import styled, { css } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';
import { getVariantStyles } from './variants';

// Table Components
export const GameTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2.5rem;
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 420px;
  grid-area: table;
  // Previously overflow: hidden; Removed to allow bubbles to overflow

  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
    min-height: 360px;
  }
`;

export const TableBackground = styled.div<{ $variant?: string }>`
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: ${({ $variant }) =>
    getVariantStyles($variant).table.getBackground()};
  border: ${({ $variant }) => getVariantStyles($variant).table.getBorder()};
  border-image: ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER
      ? `linear-gradient(135deg, ${VARIANT_COLORS.underwater.accent}99 0%, ${VARIANT_COLORS.underwater.primary}80 25%, ${VARIANT_COLORS.underwater.primary}4D 50%, ${VARIANT_COLORS.underwater.primary}80 75%, ${VARIANT_COLORS.underwater.accent}99 100%) 1`
      : 'none'};
  overflow: hidden;
  z-index: 0;
  box-shadow: ${({ $variant }) => getVariantStyles($variant).table.getShadow()};

  /* Sonar Grid Pattern for Underwater */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          /* Crosshair lines */ linear-gradient(
            to right,
            transparent calc(50% - 1px),
            rgba(34, 211, 238, 0.3) calc(50% - 1px),
            rgba(34, 211, 238, 0.3) calc(50% + 1px),
            transparent calc(50% + 1px)
          ),
          linear-gradient(
            to bottom,
            transparent calc(50% - 1px),
            rgba(34, 211, 238, 0.3) calc(50% - 1px),
            rgba(34, 211, 238, 0.3) calc(50% + 1px),
            transparent calc(50% + 1px)
          );
        pointer-events: none;
        z-index: 1;
      }

      /* Multiple Thin Concentric Sonar Rings */
      &::after {
        content: '';
        position: absolute;
        inset: -100%;
        background: repeating-radial-gradient(
          circle at center,
          transparent 0px,
          transparent 60px,
          rgba(34, 211, 238, 0.15) 60px,
          rgba(34, 211, 238, 0.15) 61px,
          transparent 61px
        );
        pointer-events: none;
        z-index: 0;
        opacity: 0.6;
      }
    `}

  /* Subtle corner accents (non-underwater) */
  ${({ $variant }) =>
    $variant !== GAME_VARIANT.UNDERWATER &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 150px;
        height: 150px;
        background: ${$variant === GAME_VARIANT.CYBERPUNK
          ? `radial-gradient(circle at top left, ${VARIANT_COLORS.cyberpunk.secondary}33, transparent 70%)`
          : 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 70%)'};
        border-radius: 20px 0 0 0;
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 150px;
        height: 150px;
        background: ${$variant === GAME_VARIANT.CYBERPUNK
          ? `radial-gradient(circle at bottom right, ${VARIANT_COLORS.cyberpunk.primary}26, transparent 70%)`
          : 'radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.12), transparent 70%)'};
        border-radius: 0 0 20px 0;
        pointer-events: none;
      }
    `}

  @media (max-width: 768px) {
    border-radius: 14px;
  }
`;

export const PlayersRing = styled.div<{ $playerCount: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 280px;
  }
`;

export const PlayerPositionWrapper = styled.div<{
  $position: number;
  $total: number;
}>`
  position: absolute;
  z-index: 5;
  ${({ $position, $total }) => {
    const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
    // Smaller radius to keep players inside the container
    const radiusX = 38;
    const radiusY = 36;
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    return `left: ${x}%; top: ${y}%; transform: translate(-50%, -50%);`;
  }}

  @media (max-width: 768px) {
    ${({ $position, $total }) => {
      const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
      const radiusX = 36;
      const radiusY = 34;
      const x = 50 + radiusX * Math.cos(angle);
      const y = 50 + radiusY * Math.sin(angle);
      return `left: ${x}%; top: ${y}%;`;
    }}
  }
`;

export const CardSlot = styled.div`
  width: 75px;
  height: 112px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  @media (max-width: 768px) {
    width: 55px;
    height: 82px;
  }
`;

export const CenterTable = styled.div<{ $variant?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.25rem;
  border-radius: 50%;
  background: ${({ $variant }) =>
    getVariantStyles($variant).table.center.getBackground()};
  border: ${({ $variant }) =>
    getVariantStyles($variant).table.center.getBorder()};
  width: 200px;
  height: 200px;
  position: relative;
  z-index: 1;
  box-shadow: ${({ $variant }) =>
    getVariantStyles($variant).table.center.getShadow()};

  /* Rotating glow border */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: ${({ $variant }) =>
      getVariantStyles($variant).table.center.getGlow()};
    animation: rotate 20s linear infinite;
    z-index: -1;
  }

  /* Cyberpunk Second Ring */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 1px dashed ${VARIANT_COLORS.cyberpunk.primary}66;
        animation: rotateReverse 30s linear infinite;
        z-index: -2;
        pointer-events: none;
      }
    `}

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateReverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
    padding: 0.75rem;
    border-width: 2px;
    gap: 0.5rem;
  }
`;

export * from './table-decorations';
