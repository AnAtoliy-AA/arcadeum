import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const C = VARIANT_COLORS.adventure;

export const headerStyles = {
  getBackground: (_theme: TamaguiTheme) =>
    `linear-gradient(135deg, ${C.background}f8, #1c1917cc)`,
  getBorder: (_theme: TamaguiTheme) => 'rgba(245, 158, 11, 0.1)',
  getLineBackground: () =>
    `linear-gradient(90deg, transparent 0%, ${C.primary} 50%, transparent 100%)`,
  getLineShadow: () => `0 0 15px ${C.primary}66`,
  getTitleBackground: () =>
    `linear-gradient(135deg, ${C.primary} 0%, #b45309 100%)`,
  getTitleTextStyles: () => ({
    textShadow: `0 0 20px ${C.primary}66`,
    letterSpacing: '2px',
    fontWeight: '800',
    fontFamily: 'serif',
  }),
};
