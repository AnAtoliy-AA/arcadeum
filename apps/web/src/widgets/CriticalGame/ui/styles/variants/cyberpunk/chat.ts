import { css, RuleSet } from 'styled-components';
import { VARIANT_COLORS } from '../../variant-palette';

export const chatStyles = {
  getBackground: (): string => 'rgba(20, 10, 35, 0.8)',
  getBorder: (): string => `1px solid ${VARIANT_COLORS.cyberpunk.secondary}40`,
  getShadow: (): string => 'none',
  getInputBackground: (): string => VARIANT_COLORS.cyberpunk.cardBack,
  getInputBorder: (): string => `${VARIANT_COLORS.cyberpunk.secondary}66`,
  getInputFocusBorder: (): string => VARIANT_COLORS.cyberpunk.secondary,
  getInputFocusShadow: (): string =>
    `0 0 12px ${VARIANT_COLORS.cyberpunk.secondary}66`,
  getInputStyles: (): RuleSet<object> => css`
    font-family: 'Courier New', monospace;
    border-radius: 4px;
    padding: 0.5rem;
  `,
  getTurnStatusStyles: (): RuleSet<object> => css`
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid ${VARIANT_COLORS.cyberpunk.primary}66;
    border-left: 3px solid ${VARIANT_COLORS.cyberpunk.primary};
    font-family: 'Courier New', monospace;
    color: ${VARIANT_COLORS.cyberpunk.primary};
    text-shadow: 0 0 5px ${VARIANT_COLORS.cyberpunk.primary}80;
    border-radius: 2px;
  `,
};
