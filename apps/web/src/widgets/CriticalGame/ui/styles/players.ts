import styled, { css } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';
import {
  getPlayerCardBackground,
  getPlayerCardBorder,
  getPlayerCardShadow,
  getPlayerCardGap,
  getPlayerCardPadding,
  getPlayerCardBorderRadius,
  getPlayerCardClipPath,
  getPlayerCardDimensions,
  getPlayerAvatarBackground,
  getPlayerAvatarBorder,
  getPlayerNameShadow,
} from './players-helpers';

export * from './players-hand';

// Player Components
export const PlayerCard = styled.div<{
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
  $isCurrentUser?: boolean;
  $variant?: string;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $variant }) => getPlayerCardGap($variant)};
  padding: ${({ $variant }) => getPlayerCardPadding($variant)};
  border-radius: ${({ $variant }) => getPlayerCardBorderRadius($variant)};
  clip-path: ${({ $variant }) => getPlayerCardClipPath($variant)};
  background: ${({
    $isCurrentTurn,
    $isCurrentUser,
    $isAlive,
    $variant,
    theme,
  }) =>
    getPlayerCardBackground(
      $isCurrentTurn,
      $isCurrentUser,
      $isAlive,
      $variant,
      theme,
    )};
  color: #fff;
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.7)};
  filter: ${({ $isAlive }) => ($isAlive ? 'none' : 'grayscale(70%)')};
  border: 2px solid
    ${({ $isCurrentTurn, $isCurrentUser, $variant }) =>
      getPlayerCardBorder($isCurrentTurn, $isCurrentUser, $variant)};
  box-shadow: ${({ $isCurrentTurn, $isCurrentUser, $variant }) =>
    getPlayerCardShadow($isCurrentTurn, $isCurrentUser, $variant)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: ${({ $variant }) => getPlayerCardDimensions($variant).minWidth};
  max-width: ${({ $variant }) => getPlayerCardDimensions($variant).maxWidth};
  z-index: 10;

  ${({ $isCurrentTurn, $variant }) =>
    $isCurrentTurn &&
    css`
      animation: ${$variant === GAME_VARIANT.CYBERPUNK
          ? 'cyberpunkGlow'
          : 'glow'}
        2s ease-in-out infinite;
      @keyframes glow {
        0%,
        100% {
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.5),
            0 0 24px rgba(99, 102, 241, 0.5);
        }
        50% {
          box-shadow:
            0 10px 36px rgba(0, 0, 0, 0.55),
            0 0 32px rgba(99, 102, 241, 0.7);
        }
      }
      @keyframes cyberpunkGlow {
        0%,
        100% {
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.5),
            0 0 24px ${VARIANT_COLORS.cyberpunk.secondary}80;
        }
        50% {
          box-shadow:
            0 10px 36px rgba(0, 0, 0, 0.55),
            0 0 32px ${VARIANT_COLORS.cyberpunk.secondary}B3,
            0 0 16px ${VARIANT_COLORS.cyberpunk.primary}66;
        }
      }
    `}

  /* CYBERPUNK VARIANT OVERRIDES */
  ${({ $variant, $isCurrentTurn, $isAlive }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      background: ${!$isAlive ? 'rgba(0, 0, 0, 0.6)' : 'rgba(10, 5, 16, 0.6)'};
      border: none;
      border-radius: 0;
      clip-path: none;
      position: relative;
      overflow: visible;
      box-shadow: none;
      padding: 1rem 0.5rem;
      gap: 0.25rem;
      transition: all 0.2s ease-out;

      /* Tech Brackets (Corners) - Using pseudo-element for crisp pixel borders */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 1px solid transparent;
        background:
          linear-gradient(
              to right,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 0,
          linear-gradient(
              to bottom,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 0,
          linear-gradient(
              to left,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 0,
          linear-gradient(
              to bottom,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 0,
          linear-gradient(
              to right,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 100%,
          linear-gradient(
              to top,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 100%,
          linear-gradient(
              to left,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 100%,
          linear-gradient(
              to top,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 100%;
        background-repeat: no-repeat;
        background-size: 10px 10px;
        opacity: ${$isCurrentTurn ? 1 : 0.5};
        pointer-events: none;
        transition: all 0.3s ease;
        box-shadow: ${$isCurrentTurn
          ? `0 0 10px ${VARIANT_COLORS.cyberpunk.secondary}4D`
          : 'none'};
      }

      /* Tech Scanline Background */
      &::after {
        content: '';
        position: absolute;
        inset: 2px;
        background: repeating-linear-gradient(
          0deg,
          ${VARIANT_COLORS.cyberpunk.secondary}0D 0px,
          ${VARIANT_COLORS.cyberpunk.secondary}0D 1px,
          transparent 1px,
          transparent 3px
        );
        pointer-events: none;
        z-index: -1;
      }

      &:hover {
        transform: translateY(-2px);
        &::before {
          opacity: 1;
          box-shadow: 0 0 15px ${VARIANT_COLORS.cyberpunk.secondary}66;
          background-size: 12px 12px;
          border-color: ${VARIANT_COLORS.cyberpunk.secondary}1A;
        }
      }

      ${$isCurrentTurn &&
      css`
        &::before {
          box-shadow: 0 0 15px ${VARIANT_COLORS.cyberpunk.secondary}99;
          animation: bracketPulse 1.5s infinite alternate;
        }

        @keyframes bracketPulse {
          from {
            filter: drop-shadow(0 0 1px ${VARIANT_COLORS.cyberpunk.secondary});
            opacity: 0.8;
          }
          to {
            filter: drop-shadow(0 0 4px ${VARIANT_COLORS.cyberpunk.secondary});
            opacity: 1;
          }
        }
      `}
    `}

  @media (max-width: 768px) {
    min-width: 80px;
    max-width: 95px;
    padding: 0.5rem 0.5rem;
    gap: 0.3rem;
    border-radius: 10px;
  }
`;

export const PlayerAvatar = styled.div<{
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
  $variant?: string;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $isCurrentTurn, theme }) =>
    getPlayerAvatarBackground($isCurrentTurn, theme)};
  border: 2px solid
    ${({ $isCurrentTurn, theme, $variant }) =>
      getPlayerAvatarBorder($isCurrentTurn, theme, $variant)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  position: relative;

  ${({ $isAlive }) =>
    !$isAlive &&
    css`
      filter: grayscale(100%);
    `}

  /* Hexagon Clip for Cyberpunk */
  ${() => css`
    // Access theme if needed, or check a prop if we pass one.
    // Since we don't pass variant prop here yet, we will rely on Game styling context or pass it.
    // Ideally we should pass $variant to PlayerAvatar.
    // For now, let's assume we update TablePlayer to pass $variant.
    // For now, let's assume we update TablePlayer to pass $variant.
  `}
  
  /* Applying Cyberpunk Styles via class/prop if passed */
  
  ${(props) =>
    props.$variant === GAME_VARIANT.CYBERPUNK &&
    css`
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      border: none;
      border-radius: 0;
      background: #000;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid ${VARIANT_COLORS.cyberpunk.primary}CC;
        clip-path: polygon(
          50% 0%,
          100% 25%,
          100% 75%,
          50% 100%,
          0% 75%,
          0% 25%
        );
        pointer-events: none;
      }

      &::before {
        content: '';
        position: absolute;
        inset: -4px;
        border: 1px dashed ${VARIANT_COLORS.cyberpunk.primary}4D;
        border-radius: 50%; /* Outer ring */
        animation: spinAvatar 10s linear infinite;
      }

      @keyframes spinAvatar {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `}

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 1rem;
    border-width: 1.5px;
  }

  /* Underwater Square Avatar */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      border-radius: 4px;
      background: rgba(4, 11, 21, 0.4);
      border-color: rgba(34, 211, 238, 0.4);
      &::after {
        content: '+';
        position: absolute;
        top: -8px;
        right: -8px;
        width: 16px;
        height: 16px;
        background: #22d3ee;
        color: #040b15;
        border-radius: 50%;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
    `}
`;

export const PlayerName = styled.div<{
  $isCurrentTurn?: boolean;
  $variant?: string;
}>`
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  line-height: 1.2;
  text-shadow: ${({ $isCurrentTurn }) => getPlayerNameShadow($isCurrentTurn)};

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #a5f3fc;
      background: rgba(4, 11, 21, 0.4);
      padding: 2px 4px;
      border-radius: 2px;
    `}
`;
