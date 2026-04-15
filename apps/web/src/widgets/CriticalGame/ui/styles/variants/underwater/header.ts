import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

export const headerStyles = {
  getBackground: (_theme: TamaguiTheme) =>
    `linear-gradient(135deg, ${VARIANT_COLORS.underwater.secondary}f2, #083344cc)`,
  getBorder: (_theme: TamaguiTheme) => 'rgba(255, 255, 255, 0.08)',
  getLineBackground: () =>
    `linear-gradient(90deg, transparent 0%, ${VARIANT_COLORS.underwater.primary}66 50%, transparent 100%)`,
  getLineShadow: () => `0 0 15px ${VARIANT_COLORS.underwater.primary}40`,
  getTitleBackground: () =>
    `linear-gradient(135deg, ${VARIANT_COLORS.underwater.primary} 0%, #06b6d4 100%)`,
  getTitleTextStyles: () => ({
    textShadow: `0 0 10px ${VARIANT_COLORS.underwater.primary}80`,
    letterSpacing: '2px',
    fontWeight: '800',
  }),
};
