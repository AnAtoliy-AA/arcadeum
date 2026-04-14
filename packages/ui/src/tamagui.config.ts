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
  },
});

const themeBase = {
  background: '#151718',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundPress: 'rgba(255, 255, 255, 0.12)',
  backgroundFocus: 'rgba(255, 255, 255, 0.1)',
  backgroundColor: '#151718', // Added explicit backgroundColor for components that expect it
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
  primary: '#0369a1',
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
  primaryGradientStart: '#0284c7',
  primaryGradientEnd: '#0369a1',
  secondaryGradientStart: '#4f46e5',
  secondaryGradientEnd: '#4338ca',
  dangerGradientStart: '#f87171',
  dangerGradientEnd: '#dc2626',
  secondaryText: '#ffffff',
  dangerText: '#ffffff',
  successText: '#ffffff',
  warningText: '#0f172a',
  infoText: '#0f172a',
};

const lightTheme = {
  ...themeBase,
  background: '#f8fafc',
  color: '#0f172a',
  borderColor: '#cbd5e1',
  borderColorHover: '#b1bdcd',
  borderColorPress: '#94a3b8',
  primary: '#0369a1',           // Darker blue for light mode primary button
  primaryGradientStart: '#0ea5e9',
  primaryGradientEnd: '#0369a1',
  primaryText: '#ffffff',       // White text for dark blue primary button
  secondaryText: '#0f172a',     // Dark text for light mode secondary/ghost
  infoText: '#0f172a',          // Darker text for info
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(0, 0, 0, 0.1)',
};

const neonDarkTheme = {
  ...themeBase,
  background: '#06011b',
  primary: '#0369a1',
  accent: '#38bdf8',
  glassBg: 'rgba(6, 1, 27, 0.72)',
};

const neonLightTheme = {
  ...lightTheme,
  primary: '#0891b2',
  accent: '#06b6d4',
};

const violetDarkTheme = {
  ...themeBase,
  background: '#080510',
  primary: '#6d28d9',
  accent: '#9333ea',
  glassBg: 'rgba(13, 10, 24, 0.72)',
};

const violetLightTheme = {
  ...themeBase,
  background: '#faf5ff',
  color: '#1e1b4b',
  primary: '#7c3aed',
  accent: '#6d28d9',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  borderColor: 'rgba(167, 139, 250, 0.3)',
  primaryText: '#ffffff',   // White text for vibrant primary button
  secondaryText: '#0f172a', // Dark text for light mode secondary/ghost
};

const tealDarkTheme = {
  ...themeBase,
  background: '#040f0f',
  primary: '#0f766e',
  accent: '#2dd4bf',
  glassBg: 'rgba(4, 15, 15, 0.72)',
};

const tealLightTheme = {
  ...themeBase,
  background: '#f0fdfa',
  color: '#042f2e',
  primary: '#0d9488',
  accent: '#0891b2',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  borderColor: 'rgba(45, 212, 191, 0.15)',
  primaryText: '#ffffff',   // White text for vibrant primary button
  secondaryText: '#0f172a', // Dark text for light mode secondary/ghost
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
  if (typeof globalThis !== 'undefined') {
    // Avoid re-initialization if already set
    if (!globalThis.TamaguiConfig) {
      globalThis.TamaguiConfig = config;
    }
  }
};

// Initialize immediately to ensure config is available to any early imports
setupTamagui();

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig { }
}

export default config;
