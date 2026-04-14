import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.crime;

export const tableStyles = {
  getBackground: () =>
    `linear-gradient(180deg, #09090b 0%, ${C.secondary} 50%, #09090b 100%)`,
  getBorder: () => `1px solid ${C.primary}33`,
  getShadow: () =>
    `0 20px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.02), inset 0 -1px 0 rgba(0,0,0,0.4)`,
  center: {
    getBackground: () => `linear-gradient(145deg, #111111, ${C.secondary})`,
    getBorder: () => `1px solid ${C.primary}66`,
    getShadow: () =>
      `0 12px 40px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.02), inset 0 -2px 8px rgba(0,0,0,0.5)`,
    getGlow: () => `conic-gradient(
      from 0deg,
      ${C.primary}66 0deg,
      ${C.accent}33 60deg,
      ${C.primary}4d 120deg,
      transparent 180deg,
      ${C.primary}4d 240deg,
      ${C.accent}33 300deg,
      ${C.primary}66 360deg
    )`,
  },
};
