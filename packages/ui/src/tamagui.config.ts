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
    red11: '#ef4444',
    blue10: '#0284c7',
    blue11: '#3b82f6',
    purple10: '#7c3aed',
    // Radix-style neutral scale used across the app for muted secondary
    // text (gray11), supporting surfaces (gray10), and high-contrast
    // foreground (gray12). Values follow the Tailwind slate scale —
    // slate-500/400/300 — to match the existing silverAccent
    // (#94a3b8) and neutral palette. Without these, 30+ components
    // that reference $gray11 et al. fell through to the default
    // off-white theme color, triggering Tamagui's missing-token warning.
    gray10: '#6b7280',
    gray11: '#94a3b8',
    gray12: '#cbd5e1',
    green11: '#10b981',
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
    textSecondary: '#8e9196',
    cyberpunkAccent: '#c026d3',
    underwaterAccent: '#0ea5e9',
    crimeAccent: '#991b1b',
    horrorAccent: '#065f46',
    adventureAccent: '#b45309',
    hikeSecondary: '#0ea5e9',
  },
});

import {
  themeBase,
  lightTheme,
  neonDarkTheme,
  neonLightTheme,
  violetDarkTheme,
  violetLightTheme,
  tealDarkTheme,
  tealLightTheme,
} from './themeDefinitions';

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
