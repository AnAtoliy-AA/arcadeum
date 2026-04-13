import { shorthands } from '@tamagui/shorthands';
import { createTamagui, createTokens } from '@tamagui/web';

const font = {
  family: 'inherit',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 28, 8: 32, 9: 40, 10: 48, sm: 14, md: 16, lg: 18, xl: 20, true: 16 },
  lineHeight: { 1: 16, 2: 18, 3: 20, 4: 24, 5: 28, 6: 30, 7: 34, 8: 38, 9: 46, 10: 54, sm: 18, md: 20, lg: 24, xl: 28, tight: 1.1, relaxed: 1.5, true: 24 },
  weight: { 4: '400', 5: '500', 6: '600', 7: '700', 8: '800', 9: '900' },
  letterSpacing: { 4: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  face: {},
};

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
  },
});

const themeBase = {
  background: '#151718',
  color: '#ecefee',
  borderColor: '#32353d',
  primary: '#57c3ff',
  secondary: '#e11d48',
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  accent: '#81f1ff',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundPress: 'rgba(255, 255, 255, 0.12)',
  backgroundTransparent: 'transparent',
  glassBg: 'rgba(15, 17, 18, 0.72)',
  glassBgHover: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderHover: 'rgba(255, 255, 255, 0.16)',
  primaryGradientStart: '#38bdf8',
  primaryGradientEnd: '#06b6d4',
  secondaryGradientStart: '#fb7185',
  secondaryGradientEnd: '#e11d48',
  dangerGradientStart: '#f87171',
  dangerGradientEnd: '#dc2626',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  dangerText: '#ffffff',
  successText: '#ffffff',
  warningText: '#1a1a1a',
  infoText: '#ffffff',
};

const lightTheme = {
  ...themeBase,
  background: '#f8fafc',
  color: '#0f172a',
  borderColor: '#cbd5e1',
};

const neonDarkTheme = {
  ...themeBase,
  background: '#06011b',
  primary: '#81f1ff',
  accent: '#57c3ff',
  glassBg: 'rgba(6, 1, 27, 0.72)',
};

const neonLightTheme = {
  ...neonDarkTheme,
};

const violetDarkTheme = {
  ...themeBase,
  background: '#080510',
  primary: '#c4b5fd',
  accent: '#6d28d9',
  glassBg: 'rgba(13, 10, 24, 0.72)',
};

const violetLightTheme = {
  ...themeBase,
  background: '#faf5ff',
  color: '#1e1b4b',
  primary: '#7c3aed',
  accent: '#6d28d9',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  borderColor: 'rgba(167, 139, 250, 0.3)',
};

const tealDarkTheme = {
  ...themeBase,
  background: '#040f0f',
  primary: '#2dd4bf',
  accent: '#0d9488',
  glassBg: 'rgba(4, 15, 15, 0.72)',
};

const tealLightTheme = {
  ...themeBase,
  background: '#f0fdfa',
  color: '#042f2e',
  primary: '#0d9488',
  accent: '#0891b2',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  borderColor: 'rgba(45, 212, 191, 0.15)',
};

export const config = createTamagui({
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
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

declare global {
  var TamaguiConfig: AppConfig | undefined;
}

export const setupTamagui = () => {
  if (typeof globalThis !== 'undefined' && !globalThis.TamaguiConfig) {
    globalThis.TamaguiConfig = config;
  }
};

setupTamagui();

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig { }
}

export default config;
