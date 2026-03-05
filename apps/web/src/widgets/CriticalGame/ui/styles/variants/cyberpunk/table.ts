import { VARIANT_COLORS } from '../../variant-palette';

export const tableStyles = {
  getBackground: (): string =>
    `linear-gradient(180deg, ${VARIANT_COLORS.cyberpunk.background} 0%, ${VARIANT_COLORS.cyberpunk.cardBack} 50%, ${VARIANT_COLORS.cyberpunk.background} 100%)`,
  getBorder: (): string => `1px solid ${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getShadow: (): string => `0 20px 60px rgba(0, 0, 0, 0.5),
       inset 0 1px 0 ${VARIANT_COLORS.cyberpunk.secondary}14,
       inset 0 -1px 0 rgba(0, 0, 0, 0.3)`,
  center: {
    getBackground: (): string =>
      `linear-gradient(145deg, ${VARIANT_COLORS.cyberpunk.background}, ${VARIANT_COLORS.cyberpunk.cardBack})`,
    getBorder: (): string =>
      `2px solid ${VARIANT_COLORS.cyberpunk.secondary}66`,
    getShadow: (): string => `0 12px 40px rgba(0, 0, 0, 0.6),
       inset 0 2px 4px ${VARIANT_COLORS.cyberpunk.secondary}1a,
       inset 0 -2px 8px rgba(0, 0, 0, 0.4),
       0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}33`,
    getGlow: (): string => `conic-gradient(
          from 0deg,
          ${VARIANT_COLORS.cyberpunk.secondary}99 0deg,
          ${VARIANT_COLORS.cyberpunk.primary}80 60deg,
          ${VARIANT_COLORS.cyberpunk.accent}66 120deg,
          ${VARIANT_COLORS.cyberpunk.secondary}4d 180deg,
          ${VARIANT_COLORS.cyberpunk.primary}66 240deg,
          ${VARIANT_COLORS.cyberpunk.accent}80 300deg,
          ${VARIANT_COLORS.cyberpunk.secondary}99 360deg
        )`,
  },
};
