import { VARIANT_COLORS } from '../../variant-palette';
import { TamaguiTheme } from '../types';

const C = VARIANT_COLORS.crime;

export const headerStyles = {
  getBackground: (_theme: TamaguiTheme) =>
    `linear-gradient(135deg, ${C.background}f2, #09090bcc)`,
  getBorder: (_theme: TamaguiTheme) => 'rgba(255, 255, 255, 0.05)',
  getLineBackground: () =>
    `linear-gradient(90deg, transparent 0%, ${C.primary} 50%, transparent 100%)`,
  getLineShadow: () => `0 0 12px ${C.primary}80`,
  getTitleBackground: () =>
    `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
  getTitleTextStyles: () => ({
    textShadow: `0 0 15px ${C.primary}66`,
    letterSpacing: '3px',
    fontWeight: '900',
    fontFamily: 'unset',
  }),
};
