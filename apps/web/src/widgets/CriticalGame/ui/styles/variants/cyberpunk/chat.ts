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
  getInputStyles: () => ({
    fontFamily: '"Courier New", monospace',
    borderRadius: 4,
    padding: '0.5rem',
  }),
  getTurnStatusStyles: () => ({
    background: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: `${VARIANT_COLORS.cyberpunk.primary}66`,
    borderLeftWidth: 3,
    borderLeftColor: VARIANT_COLORS.cyberpunk.primary,
    fontFamily: '"Courier New", monospace',
    color: VARIANT_COLORS.cyberpunk.primary,
    textShadow: `0 0 5px ${VARIANT_COLORS.cyberpunk.primary}80`,
    borderRadius: 2,
  }),
};
