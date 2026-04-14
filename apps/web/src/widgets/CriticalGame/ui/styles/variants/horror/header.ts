import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const C = VARIANT_COLORS.horror;

export const headerStyles = {
  getBackground: (_theme: TamaguiTheme) =>
    `linear-gradient(135deg, ${C.background}f8, #000000cc)`,
  getBorder: (_theme: TamaguiTheme) => 'rgba(16, 185, 129, 0.1)',
  getLineBackground: () =>
    `linear-gradient(90deg, transparent 0%, ${C.primary} 50%, transparent 100%)`,
  getLineShadow: () => `0 0 15px ${C.primary}80`,
  getTitleBackground: () =>
    `linear-gradient(135deg, ${C.primary} 0%, #064e3b 100%)`,
  getTitleTextStyles: () => ({
    textShadow: `0 0 20px ${C.primary}80`,
    letterSpacing: '4px',
    fontWeight: '900',
    fontStyle: 'italic',
  }),
};
