import styled, { css } from 'styled-components';
import { Card, CardEmoji } from './cards-base';
import { SPRITE_GRID_SIZE } from './card-sprites';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';
const getDeckCardHoverBorder = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.UNDERWATER) return '#67e8f9';
  if ($variant) return 'white';
  return 'rgba(99, 102, 241, 0.8)';
};

const getActionButtonCornerColor = (
  variant: 'primary' | 'secondary' | 'danger' | undefined,
) => {
  if (variant === 'danger') return VARIANT_COLORS.cyberpunk.danger;
  if (variant === 'secondary') return VARIANT_COLORS.cyberpunk.secondary;
  return VARIANT_COLORS.cyberpunk.primary;
};

export * from './cards-base';

export const LastPlayedCard = styled(Card)<{ $isAnimating?: boolean }>`
  position: absolute;
  width: 75px;
  max-width: 75px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%)
    ${({ $isAnimating }) =>
      $isAnimating ? 'rotateY(180deg) scale(1.1)' : 'rotateY(0deg)'};
  z-index: 10;
  animation: ${({ $isAnimating }) =>
    $isAnimating
      ? 'cardFlip 0.6s ease-out'
      : 'cardFloat 3s ease-in-out infinite'};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  cursor: default;

  @keyframes cardFlip {
    0% {
      transform: translate(-50%, -50%) rotateY(0deg) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) rotateY(90deg) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) rotateY(180deg) scale(1);
    }
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translate(-50%, -50%) translateY(0px);
    }
    50% {
      transform: translate(-50%, -50%) translateY(-8px);
    }
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }

  @media (max-width: 768px) {
    width: 55px;
    max-width: 55px;
    padding: 0.4rem 0.3rem;
    gap: 0.3rem;

    ${CardEmoji} {
      font-size: 1.25rem;
    }
    > div {
      font-size: 0.5rem;
    }
  }
`;

export const DeckCard = styled.div<{ $variant?: string }>`
  width: 75px;
  height: 112px; // aspect ratio 2/3 roughly
  border-radius: 12px;
  background: ${({ $variant }) => {
    if ($variant === GAME_VARIANT.CYBERPUNK) {
      const x = (0 % SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      const y =
        Math.floor(0 / SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      return `url('/images/cards/cyberpunk_sprites.png') ${x}% ${y}% / ${SPRITE_GRID_SIZE * 100}% ${SPRITE_GRID_SIZE * 100}%`;
    }
    if ($variant === GAME_VARIANT.UNDERWATER) {
      const x = (0 % SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      const y =
        Math.floor(0 / SPRITE_GRID_SIZE) * (100 / (SPRITE_GRID_SIZE - 1));
      return `url('/images/cards/underwater_sprites.png') ${x}% ${y}% / ${SPRITE_GRID_SIZE * 100}% ${SPRITE_GRID_SIZE * 100}%`;
    }
    if ($variant === GAME_VARIANT.CRIME)
      return `linear-gradient(135deg, ${VARIANT_COLORS.crime.background} 0%, #27272a 100%)`;
    if ($variant === GAME_VARIANT.HORROR)
      return `linear-gradient(135deg, ${VARIANT_COLORS.horror.background} 0%, #0f172a 100%)`;
    if ($variant === GAME_VARIANT.ADVENTURE)
      return `linear-gradient(135deg, ${VARIANT_COLORS.adventure.background} 0%, #78350f 100%)`;
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }};
  border: 2px solid
    ${({ $variant }) => {
      if ($variant === GAME_VARIANT.CYBERPUNK)
        return VARIANT_COLORS.cyberpunk.secondary;
      if ($variant === GAME_VARIANT.UNDERWATER)
        return VARIANT_COLORS.underwater.primary;
      if ($variant === GAME_VARIANT.CRIME) return VARIANT_COLORS.crime.primary;
      if ($variant === GAME_VARIANT.HORROR)
        return VARIANT_COLORS.horror.primary;
      if ($variant === GAME_VARIANT.ADVENTURE)
        return VARIANT_COLORS.adventure.primary;
      return 'rgba(99, 102, 241, 0.5)';
    }};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK ||
      $variant === GAME_VARIANT.UNDERWATER
        ? 'none'
        : 'block'};
  }

  &::after {
    content: '🎴';
    font-size: 2rem;
    opacity: 0.5;
    display: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK ||
      $variant === GAME_VARIANT.UNDERWATER
        ? 'none'
        : 'block'};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: ${({ $variant }) => getDeckCardHoverBorder($variant)};
    box-shadow: ${({ $variant }) =>
      $variant === GAME_VARIANT.UNDERWATER
        ? '0 0 15px rgba(34, 211, 238, 0.5)'
        : 'none'};
  }

  @media (max-width: 768px) {
    width: 55px;
    height: 82px;
    &::after {
      font-size: 1.5rem;
    }
  }
`;
export const ActionButtons = styled.div<{ $variant?: string }>`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      gap: 0.6rem;
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      gap: 0.75rem;
      padding: 0.25rem 1rem 1rem 1rem;
    `}
`;

export const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
  $variant?: string;
}>`
  padding: 1rem 1.75rem;
  border-radius: 16px;
  border: none;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  color: #fff; /* Ensure text is white by default for variants */

  /* Default Styles (Original) */
  ${({ variant, $variant }) => {
    if (
      $variant === GAME_VARIANT.CYBERPUNK ||
      $variant === GAME_VARIANT.UNDERWATER
    )
      return ''; // Handle separately below
    if (variant === 'danger') {
      return css`
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        box-shadow:
          0 6px 20px rgba(220, 38, 38, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      `;
    }
    if (variant === 'secondary') {
      return css`
        background: linear-gradient(
          135deg,
          \${theme.buttons.secondary.background},
          \${theme.buttons.secondary.background}dd
        );
        color: \${theme.buttons.secondary.text};
        border: 2px solid \${theme.buttons.secondary.border};
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      `;
    }
    return css`
      background: linear-gradient(
        135deg,
        \${theme.buttons.primary.gradientStart},
        \${theme.buttons.primary.gradientEnd ||
      theme.buttons.primary.gradientStart}
      );
      color: \${theme.buttons.primary.text};
      box-shadow:
        0 6px 20px rgba(59, 130, 246, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    `;
  }}

  /* Cyberpunk Variant Styles */
  ${({ $variant, variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      background: transparent;
      border: 1px solid;
      box-shadow: none;
      clip-path: polygon(
        10px 0,
        100% 0,
        100% calc(100% - 10px),
        calc(100% - 10px) 100%,
        0 100%,
        0 10px
      );

      /* Primary Cyberpunk Action */
      ${(variant === 'primary' || !variant) &&
      css`
        border-color: ${VARIANT_COLORS.cyberpunk.primary}; /* Cyan */
        color: ${VARIANT_COLORS.cyberpunk.primary};
        background: rgba(6, 182, 212, 0.1);

        &:hover:not(:disabled) {
          background: rgba(6, 182, 212, 0.2);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
          text-shadow: 0 0 5px rgba(6, 182, 212, 0.8);
        }
      `}

      /* Secondary Cyberpunk Action */
      ${variant === 'secondary' &&
      css`
        border-color: ${VARIANT_COLORS.cyberpunk.secondary}; /* Magenta */
        color: ${VARIANT_COLORS.cyberpunk.secondary};
        background: rgba(192, 38, 211, 0.1);

        &:hover:not(:disabled) {
          background: rgba(192, 38, 211, 0.2);
          box-shadow: 0 0 15px rgba(192, 38, 211, 0.4);
          text-shadow: 0 0 5px rgba(192, 38, 211, 0.8);
        }
      `}

      /* Danger Cyberpunk Action */
      ${variant === 'danger' &&
      css`
        border-color: ${VARIANT_COLORS.cyberpunk.danger}; /* Red */
        color: ${VARIANT_COLORS.cyberpunk.danger};
        background: rgba(239, 68, 68, 0.1);

        &:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
          text-shadow: 0 0 5px rgba(239, 68, 68, 0.8);
        }
      `}
      
      /* Corner accent for tech feel */
      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: linear-gradient(
          135deg,
          transparent 50%,
          ${getActionButtonCornerColor(variant)} 50%
        );
      }
    `}

  /* Underwater Variant Styles */
  ${({ $variant, variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      border-radius: 999px; /* Pill shape */
      padding: 0.6rem 1.75rem;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.75px;
      background: rgba(4, 11, 21, 0.6);
      border: 1px solid rgba(34, 211, 238, 0.4);
      color: #22d3ee;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover:not(:disabled) {
        border-color: #22d3ee;
        box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
        transform: translateY(-1px);
      }

      /* Primary Underwater Action (DRAW CARD) */
      ${(variant === 'primary' || !variant) &&
      css`
        background: #22d3ee;
        border: 1px solid #22d3ee;
        color: #040b15;
        font-weight: 800;
        box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);

        &:hover:not(:disabled) {
          background: #67e8f9;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
        }
      `}

      /* Secondary Underwater Action */
      ${variant === 'secondary' &&
      css`
        background: rgba(22, 78, 99, 0.2);
        border: 1px solid rgba(165, 243, 252, 0.4);
        color: #a5f3fc;

        &:hover:not(:disabled) {
          background: rgba(22, 78, 99, 0.4);
          border-color: #a5f3fc;
        }
      `}

      /* Danger Underwater Action */
      ${variant === 'danger' &&
      css`
        background: rgba(127, 29, 29, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #fca5a5;

        &:hover:not(:disabled) {
          background: rgba(127, 29, 29, 0.3);
          border-color: #f87171;
        }
      `}
    `}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    &::before {
      opacity: 1;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(60%);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.825rem;
    border-radius: 14px;
  }
`;
