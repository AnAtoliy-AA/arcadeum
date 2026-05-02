import { shorthands } from '@tamagui/shorthands';
import { createTamagui, createTokens, createFont } from '@tamagui/web';

const font = createFont({
  family: 'inherit',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 28, 8: 32, 9: 40, 10: 48, sm: 14, md: 16, lg: 18, xl: 20, true: 16 },
  lineHeight: { 1: 16, 2: 18, 3: 20, 4: 24, 5: 28, 6: 30, 7: 34, 8: 38, 9: 46, 10: 54, sm: 18, md: 20, lg: 24, xl: 28, tight: 1.1, relaxed: 24, none: 1, normal: 22, multiplier16: 32, multiplier17: 48, 13: 13, 48: 48, true: 24 },
  weight: { 4: '400', 5: '500', 6: '600', 7: '700', 8: '800', 9: '900' },
  letterSpacing: { 4: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  face: {},
});

const tokens = createTokens({
  size: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, true: 16 },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, true: 16 },
  radius: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 8 },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
  color: {
    white: '#f5f7ff',
    black: '#000000',
    transparent: 'transparent',
    cyberpunkBg: '#0f0518',
    cyberpunkPrimary: '#06b6d4',
    underwaterBg: '#040b15',
    underwaterPrimary: '#22d3ee',
    crimeBg: '#18181b',
    crimePrimary: '#dc2626',
    horrorBg: '#020617',
    horrorPrimary: '#10b981',
    adventureBg: '#451a03',
    adventurePrimary: '#f59e0b',
    hikeBg: '#020617',
    hikePrimary: '#38bdf8',
    rolePremium: '#fbbf24',
    roleVip: '#e879f9',
    roleSupporter: '#f472b6',
    roleDeveloper: '#818cf8',
    borderColor: '#32353d',
    borderColorHover: '#3d404a',
    borderColorPress: '#4a4d59',
    borderColorFocus: '#4a4d59',
    outlineColor: '#32353d',
    backgroundFocus: 'rgba(255, 255, 255, 0.1)',
    colorHover: '#ffffff',
    colorPress: '#ecefee',
    colorFocus: '#ffffff',
    placeholderColor: '#8e9196',
    neutral: '#8e9196',
    red10: '#dc2626',
    blue10: '#0284c7',
    purple10: '#7c3aed',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    gold: '#FFD700',
    goldLight: '#ffe866',
    goldDark: '#ff9500',
    goldHover: '#fff07a',
    goldPress: '#ffb500',
    successBorder: 'rgba(4, 120, 87, 0.4)',
    successBgSoft: 'rgba(4, 120, 87, 0.1)',
    warningBorder: 'rgba(146, 64, 14, 0.4)',
    warningBgSoft: 'rgba(146, 64, 14, 0.1)',
    dangerBorder: 'rgba(185, 28, 28, 0.4)',
    dangerBgSoft: 'rgba(185, 28, 28, 0.1)',
    infoBorder: 'rgba(37, 99, 235, 0.4)',
    infoBgSoft: 'rgba(37, 99, 235, 0.1)',
    neutralBorder: 'rgba(142, 145, 150, 0.4)',
    neutralBgSoft: 'rgba(142, 145, 150, 0.1)',
    cyberpunkAccent: '#c026d3',
    underwaterAccent: '#0ea5e9',
    crimeAccent: '#991b1b',
    horrorAccent: '#065f46',
    adventureAccent: '#b45309',
    hikeSecondary: '#0ea5e9',
  },
});

const themeBase = {
  background: '#151718',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundPress: 'rgba(255, 255, 255, 0.12)',
  backgroundFocus: 'rgba(255, 255, 255, 0.1)',
  backgroundColor: '#151718',
  color: '#ecefee',
  colorHover: '#ffffff',
  colorPress: '#ecefee',
  colorFocus: '#ffffff',
  borderColor: '#32353d',
  borderColorHover: '#3d404a',
  borderColorPress: '#4a4d59',
  borderColorFocus: '#4a4d59',
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  overlayBg: 'rgba(0, 0, 0, 0.5)',
  primary: '#0284c7',
  primaryText: '#ffffff',
  secondary: '#4338ca',
  danger: '#b91c1c',
  success: '#047857',
  warning: '#92400e',
  info: '#2563eb',
  accent: '#38bdf8',
  backgroundTransparent: 'transparent',
  glassBg: 'rgba(15, 17, 18, 0.8)',
  glassBgHover: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassBorderHover: 'rgba(255, 255, 255, 0.16)',
  primaryGradientStart: '#0384c4',
  primaryGradientEnd: '#0284c7',
  secondaryGradientStart: '#4f46e5',
  secondaryGradientEnd: '#4338ca',
  dangerGradientStart: '#dc2626',
  dangerGradientEnd: '#b91c1c',
  secondaryText: '#ffffff',
  dangerText: '#ffffff',
  successText: '#ffffff',
  warningText: '#ffffff',
  infoText: '#ffffff',
  victoryText: '#1a1a1a',
  victoryGradientStart: '#ffe866',
  victoryGradientEnd: '#ff9500',
  backgroundRadialStart: 'rgba(59, 130, 246, 0.18)',
  backgroundRadialEnd: 'rgba(126, 58, 242, 0.16)',
};

const lightTheme = {
  ...themeBase,
  background: '#f8fafc',
  color: '#0f172a',
  borderColor: '#cbd5e1',
  borderColorHover: '#b1bdcd',
  borderColorPress: '#94a3b8',
  primary: '#0284c7',
  primaryGradientStart: '#0ea5e9',
  primaryGradientEnd: '#0284c7',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  infoText: '#0f172a',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(0, 0, 0, 0.1)',
  backgroundRadialStart: 'rgba(96, 165, 250, 0.22)',
  backgroundRadialEnd: 'rgba(129, 140, 248, 0.18)',
};

const neonDarkTheme = {
  ...themeBase,
  background: '#06011b',
  primary: '#0369a1',
  primaryText: '#ffffff',
  victoryText: '#1a1a1a',
  accent: '#38bdf8',
  glassBg: 'rgba(6, 1, 27, 0.72)',
  backgroundRadialStart: 'rgba(87, 195, 255, 0.35)',
  backgroundRadialEnd: 'rgba(255, 106, 247, 0.35)',
};

const neonLightTheme = {
  ...lightTheme,
  primary: '#0891b2',
  accent: '#06b6d4',
  primaryText: '#0f172a',
};

const violetDarkTheme = {
  ...themeBase,
  background: '#080510',
  primary: '#6d28d9',
  primaryText: '#ffffff',
  victoryText: '#1a1a1a',
  accent: '#9333ea',
  glassBg: 'rgba(13, 10, 24, 0.72)',
  backgroundRadialStart: 'rgba(124, 58, 237, 0.22)',
  backgroundRadialEnd: 'rgba(192, 132, 252, 0.18)',
};

const violetLightTheme = {
  ...themeBase,
  background: '#faf5ff',
  color: '#1e1b4b',
  primary: '#7c3aed',
  accent: '#6d28d9',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  borderColor: 'rgba(167, 139, 250, 0.3)',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  victoryText: '#1a1a1a',
  backgroundRadialStart: 'rgba(167, 139, 250, 0.28)',
  backgroundRadialEnd: 'rgba(196, 181, 253, 0.24)',
};

const tealDarkTheme = {
  ...themeBase,
  background: '#040f0f',
  primary: '#0f766e',
  primaryText: '#ffffff',
  victoryText: '#1a1a1a',
  accent: '#2dd4bf',
  glassBg: 'rgba(4, 15, 15, 0.72)',
  backgroundRadialStart: 'rgba(13,148,136,0.22)',
  backgroundRadialEnd: 'rgba(6,182,212,0.18)',
};

const tealLightTheme = {
  ...themeBase,
  background: '#f0fdfa',
  color: '#042f2e',
  primary: '#0d9488',
  accent: '#0891b2',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  borderColor: 'rgba(45, 212, 191, 0.15)',
  primaryText: '#0f172a',
  secondaryText: '#ffffff',
  victoryText: '#1a1a1a',
  backgroundRadialStart: 'rgba(13,148,136,0.18)',
  backgroundRadialEnd: 'rgba(6,182,212,0.14)',
};

const animations = {
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 120,
  },
  slow: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 40,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 250,
  },
};

export const config = createTamagui({
  animations: animations as any,
  defaultTheme: 'dark',
  shouldAddPrefersColorSelection: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: font,
    body: font,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: themeBase,
    neonLight: neonLightTheme,
    neonDark: neonDarkTheme,
    violetDark: violetDarkTheme,
    violetLight: violetLightTheme,
    tealDark: tealDarkTheme,
    tealLight: tealLightTheme,
  },
  media: {
    xxl: { maxWidth: 1600 },
    xl: { maxWidth: 1420 },
    lg: { maxWidth: 1280 },
    md: { maxWidth: 1150 },
    tablet: { maxWidth: 1023 },
    sm: { maxWidth: 800 },
    xs: { maxWidth: 660 },
    gtXs: { minWidth: 661 },
    gtSm: { minWidth: 801 },
    gtTablet: { minWidth: 1024 },
    gtMd: { minWidth: 1151 },
    gtLg: { minWidth: 1281 },
    short: { maxHeight: 480 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

declare global {
  var TamaguiConfig: AppConfig | undefined;
}

export const setupTamagui = () => {
  if (typeof globalThis !== 'undefined') {
    // Avoid re-initialization if already set
    if (!globalThis.TamaguiConfig) {
      globalThis.TamaguiConfig = config;
    }
  }
};

// Prime config immediately on module evaluation to ensure availability for styled components
try {
  setupTamagui();
} catch (e) {
  // Safe ignore for environment-specific initialization edge cases
}

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig { }
}

export default config;
