import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.adventure;

export const chatStyles = {
  getBackground: () => 'rgba(28, 25, 23, 0.7)',
  getBorder: () => `${C.primary}26`,
  getShadow: () => 'none',
  getInputBackground: () => 'rgba(41, 37, 34, 0.5)',
  getInputBorder: () => `${C.primary}33`,
  getInputFocusBorder: () => C.primary,
  getInputFocusShadow: () => `0 0 15px ${C.primary}40`,
  getInputStyles: () => ({
    borderRadius: 8,
    fontFamily: 'serif',
  }),
  getTurnStatusStyles: () => ({
    background: `linear-gradient(90deg, #451a03cc, transparent)`,
    borderLeft: `4px solid ${C.primary}`,
    padding: '0.75rem 1.25rem',
    borderRadius: '4px 12px 12px 4px',
    fontFamily: 'serif',
  }),
};
