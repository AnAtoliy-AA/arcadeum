import { VARIANT_COLORS } from '../../variant-palette';

export const chatStyles = {
  getBackground: () => 'rgba(2, 6, 23, 0.65)',
  getBorder: () => `${VARIANT_COLORS.underwater.primary}26`,
  getShadow: () => 'none',
  getInputBackground: () => 'rgba(15, 23, 42, 0.4)',
  getInputBorder: () => `${VARIANT_COLORS.underwater.primary}33`,
  getInputFocusBorder: () => VARIANT_COLORS.underwater.primary,
  getInputFocusShadow: () => `0 0 15px ${VARIANT_COLORS.underwater.primary}40`,
  getInputStyles: () => ({
    borderRadius: '12px',
    backdropFilter: 'blur(8px)',
  }),
  getTurnStatusStyles: () => ({
    background: `linear-gradient(90deg, ${VARIANT_COLORS.underwater.secondary}cc, transparent)`,
    borderLeft: `4px solid ${VARIANT_COLORS.underwater.primary}`,
    padding: '0.75rem 1rem',
    borderRadius: '4px 12px 12px 4px',
  }),
};
