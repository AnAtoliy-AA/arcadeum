import { css, RuleSet } from 'styled-components';
import { VARIANT_COLORS } from '../../variant-palette';

export const headerStyles = {
  getBackground: (): string =>
    `linear-gradient(135deg, ${VARIANT_COLORS.cyberpunk.background}f2, ${VARIANT_COLORS.cyberpunk.cardBack}e6)`,
  getBorder: (): string => `${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getLineBackground: (): string =>
    `linear-gradient(90deg, transparent 0%, ${VARIANT_COLORS.cyberpunk.secondary}99 25%, ${VARIANT_COLORS.cyberpunk.primary}99 50%, ${VARIANT_COLORS.cyberpunk.secondary}99 75%, transparent 100%)`,
  getLineShadow: (): string =>
    `0 0 10px ${VARIANT_COLORS.cyberpunk.secondary}80, 0 0 20px ${VARIANT_COLORS.cyberpunk.primary}4d`,
  getTitleBackground: (): string =>
    `linear-gradient(135deg, ${VARIANT_COLORS.cyberpunk.secondary} 0%, ${VARIANT_COLORS.cyberpunk.primary} 50%, #7c3aed 100%)`,
  getTitleTextStyles: (): RuleSet<object> => css`
    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${VARIANT_COLORS.cyberpunk.cardBack};
    }
    &::before {
      left: 2px;
      text-shadow: -1px 0 ${VARIANT_COLORS.cyberpunk.primary};
      background: ${VARIANT_COLORS.cyberpunk.cardBack};
      animation: glitchTop 1s infinite linear alternate-reverse;
    }
    &::after {
      left: -2px;
      text-shadow: -1px 0 ${VARIANT_COLORS.cyberpunk.secondary};
      background: ${VARIANT_COLORS.cyberpunk.cardBack};
      animation: glitchBottom 1.5s infinite linear alternate-reverse;
    }
  `,
};
