import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.horror;

export const tableStyles = {
  getBackground: () =>
    `linear-gradient(180deg, ${C.background} 0%, ${C.secondary} 50%, ${C.background} 100%)`,
  getBorder: () => `1px solid ${C.primary}33`,
  getShadow: () =>
    `0 20px 80px rgba(0,0,0,0.95), inset 0 0 60px ${C.primary}05`,
  center: {
    getBackground: () => `linear-gradient(145deg, #020617, ${C.secondary})`,
    getBorder: () => `1px solid ${C.primary}4d`,
    getShadow: () =>
      `0 12px 40px rgba(0,0,0,0.8), inset 0 0 30px ${C.accent}0a`,
    getGlow: () => `conic-gradient(
      from 0deg,
      ${C.primary}66 0deg,
      transparent 90deg,
      ${C.accent}4d 180deg,
      transparent 270deg,
      ${C.primary}66 360deg
    )`,
  },
};
