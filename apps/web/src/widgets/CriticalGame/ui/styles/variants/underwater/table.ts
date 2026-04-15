import { VARIANT_COLORS } from '../../variant-palette';

export const tableStyles = {
  getBackground: () =>
    `linear-gradient(180deg, ${VARIANT_COLORS.underwater.background} 0%, ${VARIANT_COLORS.underwater.secondary} 50%, ${VARIANT_COLORS.underwater.background} 100%)`,
  getBorder: () => 'none',
  getShadow: () => `0 20px 80px rgba(0, 0, 0, 0.9),
         0 0 60px ${VARIANT_COLORS.underwater.primary}1a,
         inset 0 0 120px ${VARIANT_COLORS.underwater.primary}0d`,
  center: {
    getBackground: () =>
      `linear-gradient(145deg, ${VARIANT_COLORS.underwater.secondary}cc, #0e749033)`,
    getBorder: () => `1px solid ${VARIANT_COLORS.underwater.primary}4d`,
    getShadow: () => `0 12px 40px rgba(0, 0, 0, 0.6),
         inset 0 2px 4px ${VARIANT_COLORS.underwater.primary}1a,
         0 0 25px ${VARIANT_COLORS.underwater.primary}22`,
    getGlow: () => `conic-gradient(
            from 0deg,
            ${VARIANT_COLORS.underwater.primary}80 0deg,
            transparent 60deg,
            ${VARIANT_COLORS.underwater.primary}40 120deg,
            transparent 180deg,
            ${VARIANT_COLORS.underwater.primary}60 240deg,
            transparent 300deg,
            ${VARIANT_COLORS.underwater.primary}80 360deg
          )`,
  },
};
