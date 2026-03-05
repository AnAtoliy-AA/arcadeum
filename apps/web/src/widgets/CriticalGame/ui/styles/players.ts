import styled, { css } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';
import { getVariantStyles } from './variants';

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
  justify-content: center;
  gap: ${({ $variant }) => getVariantStyles($variant).players.getCardGap()};
  padding: ${({ $variant }) => getVariantStyles($variant).players.getCardPadding()};
  border-radius: ${({ $variant }) => getVariantStyles($variant).players.getCardBorderRadius()};
  clip-path: ${({ $variant }) => getVariantStyles($variant).players.getCardClipPath()};
  background: ${({
    $isCurrentTurn,
    $isCurrentUser,
    $isAlive,
    $variant,
    theme,
  }) =>
    getVariantStyles($variant).players.getCardBackground(
      $isCurrentTurn,
      $isCurrentUser,
      $isAlive,
      theme,
    )};
  color: #fff;
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.7)};
  filter: ${({ $isAlive }) => ($isAlive ? 'none' : 'grayscale(70%)')};
  border: 2px solid
      getVariantStyles($variant).players.getCardBorder($isCurrentTurn, $isCurrentUser)};
    getVariantStyles($variant).players.getCardShadow($isCurrentTurn, $isCurrentUser)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: ${({ $variant }) => getVariantStyles($variant).players.getCardDimensions().minWidth};
  max-width: ${({ $variant }) => getVariantStyles($variant).players.getCardDimensions().maxWidth};
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

  /* VARIANT STYLES */
  ${({ $variant }) => getVariantStyles($variant).players.getStyles?.()}

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
  background: ${({ $variant, $isCurrentTurn, theme }) =>
    getVariantStyles($variant).players.getAvatarBackground(
      $isCurrentTurn,
      theme,
    )};
  ${({ $variant, $isCurrentTurn, theme }) =>
    getVariantStyles($variant).players.getAvatarBorder($isCurrentTurn, theme)};
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

  ${({ $variant }) => getVariantStyles($variant).players.getAvatarStyles?.()}
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
  text-shadow: ${({ $variant, $isCurrentTurn }) =>
    getVariantStyles($variant).players.getNameShadow($isCurrentTurn)};

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }

  ${({ $variant }) => getVariantStyles($variant).players.getNameStyles?.()}
`;
