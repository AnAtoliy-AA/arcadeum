import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const headerStyles = {
  getBackground: (_theme: TamaguiTheme) =>
    `linear-gradient(135deg, ${COLORS.background}f2, ${COLORS.secondary}e6)`,
  getBorder: (_theme: TamaguiTheme) => `${COLORS.primary}33`,
  getLineBackground: () =>
    `linear-gradient(90deg, transparent 0%, ${COLORS.primary}80 50%, transparent 100%)`,
  getLineShadow: () => `0 0 15px ${COLORS.primary}40`,
  getTitleBackground: () =>
    `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
  getTitleTextStyles: () => ({
    textShadow: `0 0 15px ${COLORS.primary}80`,
    letterSpacing: '2px',
    fontWeight: '900',
  }),
};
