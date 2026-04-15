import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.adventure;

export const tableStyles = {
  getBackground: () =>
    `linear-gradient(180deg, #1c1917 0%, ${C.secondary} 50%, #1c1917 100%)`,
  getBorder: () => `1px solid ${C.primary}33`,
  getShadow: () =>
    `0 20px 80px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(245, 158, 11, 0.05)`,
  center: {
    getBackground: () => `linear-gradient(145deg, ${C.secondary}, #57534e33)`,
    getBorder: () => `1px solid ${C.primary}4d`,
    getShadow: () =>
      `0 12px 40px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(245, 158, 11, 0.05)`,
    getGlow: () => `conic-gradient(
      from 0deg,
      ${C.primary}80 0deg,
      ${C.accent}40 90deg,
      ${C.primary}60 180deg,
      transparent 270deg,
      ${C.primary}80 360deg
    )`,
  },
};
