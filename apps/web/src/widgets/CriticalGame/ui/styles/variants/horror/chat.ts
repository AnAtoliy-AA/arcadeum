import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.horror;

export const chatStyles = {
  getBackground: () => 'rgba(2, 6, 23, 0.8)',
  getBorder: () => `1px solid ${C.primary}1a`,
  getShadow: () => 'none',
  getInputBackground: () => 'rgba(0, 0, 0, 0.5)',
  getInputBorder: () => `1px solid ${C.primary}1a`,
  getInputFocusBorder: () => C.primary,
  getInputFocusShadow: () => `0 0 20px ${C.primary}33`,
  getInputStyles: () => ({
    borderRadius: 0,
    fontFamily: 'serif',
  }),
  getTurnStatusStyles: () => ({
    background: `linear-gradient(90deg, #062016, transparent)`,
    borderLeft: `2px solid ${C.primary}`,
    padding: '0.8rem 1.2rem',
    fontFamily: 'serif',
    fontStyle: 'italic',
  }),
};
