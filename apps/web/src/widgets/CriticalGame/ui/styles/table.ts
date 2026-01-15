import styled, { css } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';

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
    $variant === 'cyberpunk'
      ? `linear-gradient(180deg, #0a0a0f 0%, ${VARIANT_COLORS.cyberpunk.cardBack} 50%, #0a0a0f 100%)`
      : 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'};
  border: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? `1px solid ${VARIANT_COLORS.cyberpunk.secondary}4D`
      : '1px solid rgba(99, 102, 241, 0.2)'};
  overflow: hidden;
  z-index: 0;
  box-shadow: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? `0 20px 60px rgba(0, 0, 0, 0.5),
         inset 0 1px 0 ${VARIANT_COLORS.cyberpunk.secondary}14,
         inset 0 -1px 0 rgba(0, 0, 0, 0.3)`
      : `0 20px 60px rgba(0, 0, 0, 0.4),
         inset 0 1px 0 rgba(255, 255, 255, 0.05),
         inset 0 -1px 0 rgba(0, 0, 0, 0.2)`};

  /* Subtle corner accents */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 150px;
    height: 150px;
    background: ${({ $variant }) =>
      $variant === 'cyberpunk'
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
    background: ${({ $variant }) =>
      $variant === 'cyberpunk'
        ? `radial-gradient(circle at bottom right, ${VARIANT_COLORS.cyberpunk.primary}26, transparent 70%)`
        : 'radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.12), transparent 70%)'};
    border-radius: 0 0 20px 0;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    border-radius: 14px;
    &::before,
    &::after {
      width: 100px;
      height: 100px;
    }
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
    $variant === 'cyberpunk'
      ? `linear-gradient(145deg, ${VARIANT_COLORS.cyberpunk.background}, ${VARIANT_COLORS.cyberpunk.cardBack})`
      : 'linear-gradient(145deg, #1e293b, #0f172a)'};
  border: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? `2px solid ${VARIANT_COLORS.cyberpunk.secondary}66`
      : '2px solid rgba(99, 102, 241, 0.3)'};
  width: 200px;
  height: 200px;
  position: relative;
  z-index: 1;
  box-shadow: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? `0 12px 40px rgba(0, 0, 0, 0.6),
         inset 0 2px 4px ${VARIANT_COLORS.cyberpunk.secondary}1A,
         inset 0 -2px 8px rgba(0, 0, 0, 0.4),
         0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}33`
      : `0 12px 40px rgba(0, 0, 0, 0.4),
         inset 0 2px 4px rgba(255, 255, 255, 0.05),
         inset 0 -2px 8px rgba(0, 0, 0, 0.3)`};

  /* Rotating glow border */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: ${({ $variant }) =>
      $variant === 'cyberpunk'
        ? `conic-gradient(
            from 0deg,
            ${VARIANT_COLORS.cyberpunk.secondary}99 0deg,
            ${VARIANT_COLORS.cyberpunk.primary}80 60deg,
            ${VARIANT_COLORS.cyberpunk.accent}66 120deg,
            ${VARIANT_COLORS.cyberpunk.secondary}4D 180deg,
            ${VARIANT_COLORS.cyberpunk.primary}66 240deg,
            ${VARIANT_COLORS.cyberpunk.accent}80 300deg,
            ${VARIANT_COLORS.cyberpunk.secondary}99 360deg
          )`
        : `conic-gradient(
            from 0deg,
            rgba(99, 102, 241, 0.6) 0deg,
            rgba(168, 85, 247, 0.5) 60deg,
            rgba(236, 72, 153, 0.4) 120deg,
            rgba(99, 102, 241, 0.3) 180deg,
            rgba(16, 185, 129, 0.4) 240deg,
            rgba(59, 130, 246, 0.5) 300deg,
            rgba(99, 102, 241, 0.6) 360deg
          )`};
    animation: rotate 20s linear infinite;
    z-index: -1;
  }

  /* Cyberpunk Second Ring */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
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
