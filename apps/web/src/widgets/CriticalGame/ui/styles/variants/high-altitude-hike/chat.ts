import { VARIANT_COLORS } from '../../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const chatStyles = {
  getBackground: () => 'rgba(2, 6, 23, 0.75)',
  getBorder: () => `1px solid ${COLORS.primary}1a`,
  getShadow: () => 'none',
  getInputBackground: () => 'rgba(15, 23, 42, 0.5)',
  getInputBorder: () => `1px solid ${COLORS.primary}26`,
  getInputFocusBorder: () => COLORS.primary,
  getInputFocusShadow: () => `0 0 15px ${COLORS.primary}40`,
  getInputStyles: () => ({
    borderRadius: 8,
  }),
  getTurnStatusStyles: () => ({
    background: `linear-gradient(90deg, ${COLORS.secondary}cc, transparent)`,
    borderLeft: `4px solid ${COLORS.primary}`,
    padding: '0.75rem 1.25rem',
    borderRadius: '4px 12px 12px 4px',
  }),
};
