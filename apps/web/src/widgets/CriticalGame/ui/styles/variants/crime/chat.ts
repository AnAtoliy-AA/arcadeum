import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.crime;

export const chatStyles = {
  getBackground: () => 'rgba(9, 9, 11, 0.75)',
  getBorder: () => `${C.primary}33`,
  getShadow: () => 'none',
  getInputBackground: () => 'rgba(24, 24, 27, 0.5)',
  getInputBorder: () => `${C.primary}26`,
  getInputFocusBorder: () => C.primary,
  getInputFocusShadow: () => `0 0 10px ${C.primary}40`,
  getInputStyles: () => ({
    borderRadius: 4,
    fontFamily: 'monospace',
  }),
  getTurnStatusStyles: () => ({
    background: `linear-gradient(90deg, #1a0a0a, transparent)`,
    borderLeft: `3px solid ${C.primary}`,
    padding: '0.5rem 1rem',
    borderRadius: '0 4px 4px 0',
    fontFamily: 'monospace',
  }),
};
