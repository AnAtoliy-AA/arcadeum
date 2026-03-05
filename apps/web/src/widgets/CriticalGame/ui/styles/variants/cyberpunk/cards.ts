import { css, RuleSet } from 'styled-components';
import { VARIANT_COLORS } from '../../variant-palette';

export const cardsStyles = {
  glowEffect: `0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}cc`,
  borderEffect: `2px solid ${VARIANT_COLORS.cyberpunk.secondary}`,
  getCardSpriteUrl: (): string => '/images/cards/cyberpunk_sprites.png',
  getDeckBackground: (): string =>
    "url('/images/cards/cyberpunk_card_back.png') center/cover no-repeat",
  getDeckBorder: (): string => VARIANT_COLORS.cyberpunk.secondary,
  getDecorationBackground: (): string =>
    `${VARIANT_COLORS.cyberpunk.background}e6`,
  getDecorationBorder: (): string =>
    `1px solid ${VARIANT_COLORS.cyberpunk.primary}80`,
  getDisabledOverlay: (): string => `${VARIANT_COLORS.cyberpunk.background}b3`,
  getCardNameStyles: (): RuleSet<object> => css`
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid ${VARIANT_COLORS.cyberpunk.secondary};
    border-radius: 4px;
    color: ${VARIANT_COLORS.cyberpunk.accent};
    text-shadow: 0 0 5px ${VARIANT_COLORS.cyberpunk.secondary}99;
    clip-path: polygon(
      10px 0,
      100% 0,
      100% calc(100% - 10px),
      calc(100% - 10px) 100%,
      0 100%,
      0 10px
    );
    padding: 0.3rem 0.6rem;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 8px;
      height: 8px;
      border-top: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
      border-left: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      border-bottom: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
      border-right: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
    }
  `,
  getCardDescriptionStyles: (): RuleSet<object> => css`
    font-family: 'Courier New', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 1);
  `,
};
