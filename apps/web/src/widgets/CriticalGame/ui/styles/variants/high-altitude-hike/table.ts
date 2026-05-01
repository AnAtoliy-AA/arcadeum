import { VARIANT_COLORS } from '../../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const tableStyles = {
  getBackground: () =>
    `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.secondary} 100%)`,
  getBorder: () => `1px solid ${COLORS.primary}4d`,
  getShadow: () =>
    '0 20px 80px rgba(0, 0, 0, 0.7), inset 0 0 60px rgba(56, 189, 248, 0.05)',
  center: {
    getBackground: () =>
      `linear-gradient(145deg, ${COLORS.secondary}, ${COLORS.background})`,
    getBorder: () => `2px solid ${COLORS.primary}66`,
    getShadow: () =>
      `0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${COLORS.primary}22`,
    getGlow: () => `conic-gradient(
      from 0deg,
      ${COLORS.primary}cc 0deg,
      transparent 180deg,
      ${COLORS.primary}cc 360deg
    )`,
  },
};
