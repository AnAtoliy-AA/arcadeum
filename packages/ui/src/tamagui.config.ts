import { createAnimations } from '@tamagui/animations-css';
import { shorthands } from '@tamagui/shorthands';
import { createTamagui, createTokens } from 'tamagui';

// RSC safety: ensure animations are only created on the client/SSR passes
const getAnimations = () => {
  if (typeof window === 'undefined') {
    return {
      quick: 'ease-out 80ms',
      fast: 'ease-in 100ms',
      medium: 'ease-in 200ms',
      slow: 'ease-in 300ms',
      pulse: 'pulse 2s infinite',
    } as any;
  }
  return createAnimations({
    quick: 'ease-out 80ms',
    fast: 'ease-in 100ms',
    medium: 'ease-in 200ms',
    slow: 'ease-in 300ms',
    pulse: 'pulse 2s infinite',
  });
};

const font = {
  family: 'inherit',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    true: 16,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 24,
    5: 28,
    6: 30,
    7: 34,
    8: 38,
    9: 46,
    10: 54,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    tight: '1.1' as unknown as number,
    relaxed: '1.5' as unknown as number,
    true: 24,
  },
  weight: {
    4: '400',
    6: '600',
  },
  letterSpacing: {
    4: 0,
    6: 0,
  },
  face: {},
};

const tokens = createTokens({
  size: {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '7': 28,
    '8': 32,
    '9': 36,
    '10': 40,
    '11': 44,
    '12': 48,
    true: 16,
  },
  space: {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '7': 28,
    '8': 32,
    '9': 36,
    '10': 40,
    '11': 44,
    '12': 48,
    true: 16,
  },
  radius: {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    true: 8,
  },
  zIndex: {
    '0': 0,
    '1': 100,
    '2': 200,
    '3': 300,
    '4': 400,
    '5': 500,
  },
  color: {
    white: '#f5f7ff',
    black: '#000000',
    transparent: 'transparent',
    // Cyberpunk
    cyberpunkBg: '#0f0518',
    cyberpunkBgEnd: '#1a0520',
    cyberpunkPrimary: '#06b6d4',
    cyberpunkSecondary: '#c026d3',
    cyberpunkAccent: '#e879f9',
    // Underwater
    underwaterBg: '#040b15',
    underwaterBgEnd: '#0c1a2e',
    underwaterPrimary: '#22d3ee',
    underwaterAccent: '#ec4899',
    // Crime
    crimeBg: '#18181b',
    crimeBgEnd: '#27272a',
    crimePrimary: '#dc2626',
    crimeSecondary: '#ef4444',
    crimeAccent: '#fca5a5',
    // Horror
    horrorBg: '#020617',
    horrorBgEnd: '#0f172a',
    horrorPrimary: '#10b981',
    horrorSecondary: '#34d399',
    horrorAccent: '#6ee7b7',
    // Adventure
    adventureBg: '#451a03',
    adventureBgEnd: '#78350f',
    adventurePrimary: '#f59e0b',
    adventureSecondary: '#fbbf24',
    adventureAccent: '#fcd34d',
    // High Altitude Hike
    hikeBg: '#020617',
    hikeBgEnd: '#1e3a8a',
    hikePrimary: '#38bdf8',
    hikeSecondary: '#7dd3fc',
    // Role badge colors
    rolePremium: '#fbbf24',        // text + glow base
    rolePremiumShade: '#f59e0b',   // bg gradient end
    roleVip: '#e879f9',            // text
    roleVipFrom: '#a855f7',        // bg gradient start
    roleVipTo: '#db2777',          // bg gradient end
    roleSupporter: '#f472b6',      // text + bg gradient end
    roleSupporterFrom: '#ec4899',  // bg gradient start + glow base
    roleDeveloper: '#818cf8',      // text
    roleDeveloperShade: '#6366f1', // bg
  },
});

const darkTheme = {
  background: '#151718',
  backgroundHover: '#1e2326',
  backgroundPress: '#252a2e',
  backgroundFocus: '#1e2326',
  outlineColor: 'transparent',
  color: '#ecefee',
  borderColor: '#32353d',
  borderColorPress: '#4a4f5a',
  borderColorFocus: '#57c3ff',
  borderColorHover: 'rgba(255, 255, 255, 0.2)',
  shadowColor: 'rgba(0,0,0,0.5)',
  // Brand Colors
  primary: '#57c3ff',
  primaryGradientStart: '#7ad7ff',
  primaryGradientEnd: '#57c3ff',
  secondary: '#8f9bff',
  secondaryGradientStart: '#a8b1ff',
  secondaryGradientEnd: '#8f9bff',
  primaryText: '#151718',
  secondaryText: '#151718',
  dangerText: '#151718',
  successText: '#151718',
  warningText: '#151718',
  infoText: '#ffffff',
  danger: '#ef4444',
  dangerGradientStart: '#f87171',
  dangerGradientEnd: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  accent: '#81f1ff',
  // Status Colors
  successBorder: 'rgba(16, 185, 129, 0.4)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',
  dangerBorder: 'rgba(239, 68, 68, 0.4)',
  infoBorder: 'rgba(87, 195, 255, 0.4)',
  neutral: '#6b7280',
  neutralBorder: 'rgba(107, 114, 128, 0.4)',
  // Status Soft Variants
  successBgSoft: 'rgba(16, 185, 129, 0.2)',
  warningBgSoft: 'rgba(251, 191, 36, 0.2)',
  dangerBgSoft: 'rgba(239, 68, 68, 0.25)',
  infoBgSoft: 'rgba(99, 102, 241, 0.1)',
  // Gradients
  successGradient: 'linear-gradient(135deg, #10b981, #059669)',
  warningGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  infoGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  goldGradient: 'linear-gradient(135deg, #fceabb 0%, #f8b500 50%, #fceabb 100%)',
  silverGradient: 'linear-gradient(135deg, #eef2f3 0%, #8e9eab 100%)',
  // Overlay & Specials
  overlayBg: 'rgba(0, 0, 0, 0.6)',
  // Glass Tokens
  glassBg: 'rgba(15, 17, 18, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBgHover: 'rgba(255, 255, 255, 0.08)',
  glassBorderHover: 'rgba(255, 255, 255, 0.3)',
  // Background Radials
  backgroundRadialStart: 'rgba(87, 195, 255, 0.35)',
  backgroundRadialEnd: 'rgba(255, 106, 247, 0.35)',
};

const lightTheme = {
  background: '#f8fafc',
  backgroundHover: '#edf1f6',
  backgroundPress: '#dde4ed',
  backgroundFocus: '#edf1f6',
  outlineColor: 'transparent',
  color: '#0f172a',
  borderColor: '#cbd5e1',
  borderColorPress: '#94a3b8',
  borderColorFocus: '#3b82f6',
  borderColorHover: 'rgba(0, 0, 0, 0.15)',
  shadowColor: 'rgba(0,0,0,0.1)',
  // Brand Colors
  primary: '#1d4ed8',
  primaryGradientStart: '#2563eb',
  primaryGradientEnd: '#1d4ed8',
  secondary: '#4338ca',
  secondaryGradientStart: '#4f46e5',
  secondaryGradientEnd: '#4338ca',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  dangerText: '#ffffff',
  successText: '#ffffff',
  warningText: '#0f172a',
  infoText: '#ffffff',
  danger: '#dc2626',
  dangerGradientStart: '#ef4444',
  dangerGradientEnd: '#dc2626',
  success: '#059669',
  warning: '#d97706',
  info: '#2563eb',
  accent: '#06b6d4',
  // Status Colors
  successBorder: 'rgba(5, 150, 105, 0.2)',
  warningBorder: 'rgba(217, 119, 6, 0.2)',
  dangerBorder: 'rgba(220, 38, 38, 0.2)',
  infoBorder: 'rgba(37, 99, 235, 0.2)',
  neutral: '#94a3b8',
  neutralBorder: 'rgba(148, 163, 184, 0.3)',
  // Status Soft Variants
  successBgSoft: 'rgba(16, 185, 129, 0.1)',
  warningBgSoft: 'rgba(251, 191, 36, 0.1)',
  dangerBgSoft: 'rgba(239, 68, 68, 0.1)',
  infoBgSoft: 'rgba(99, 102, 241, 0.05)',
  // Gradients
  successGradient: 'linear-gradient(135deg, #10b981, #059669)',
  warningGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  infoGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  goldGradient: 'linear-gradient(135deg, #fceabb 0%, #f8b500 50%, #fceabb 100%)',
  silverGradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
  // Overlay & Specials
  overlayBg: 'rgba(0, 0, 0, 0.4)',
  // Glass Tokens
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
  glassBgHover: 'rgba(0, 0, 0, 0.06)',
  glassBorderHover: 'rgba(0, 0, 0, 0.2)',
  // Background Radials
  backgroundRadialStart: 'rgba(87, 195, 255, 0.15)',
  backgroundRadialEnd: 'rgba(255, 106, 247, 0.15)',
};

const neonDarkTheme = {
  ...darkTheme,
  background: '#06011b',
  backgroundHover: '#100830',
  backgroundPress: '#1a0f3d',
  color: '#f5f7ff',
  borderColor: 'rgba(143, 155, 255, 0.35)',
  borderColorPress: 'rgba(143, 155, 255, 0.6)',
  borderColorFocus: 'rgba(143, 155, 255, 0.8)',
  shadowColor: 'rgba(5, 0, 40, 0.35)',
  // Status Border Overrides for Neon
  successBorder: 'rgba(16, 185, 129, 0.6)',
  warningBorder: 'rgba(245, 158, 11, 0.6)',
  dangerBorder: 'rgba(239, 68, 68, 0.6)',
  infoBorder: 'rgba(87, 195, 255, 0.6)',
  neutralBorder: 'rgba(143, 155, 255, 0.5)',
  overlayBg: 'rgba(0, 0, 0, 0.8)',
  // Glass Tokens
  glassBg: 'rgba(6, 1, 27, 0.72)',
  glassBorder: 'rgba(245, 247, 255, 0.08)',
};

const neonLightTheme = {
  ...darkTheme, // Neon light still uses a dark background base in the app config
  background: '#06011b',
  backgroundHover: '#100830',
  backgroundPress: '#1a0f3d',
  color: '#f5f7ff',
  borderColor: 'rgba(102, 69, 182, 0.6)',
  borderColorPress: 'rgba(102, 69, 182, 0.9)',
  borderColorFocus: 'rgba(102, 69, 182, 1)',
  shadowColor: 'rgba(8, 5, 24, 0.65)',
  // Status Border Overrides for Neon
  successBorder: 'rgba(16, 185, 129, 0.7)',
  warningBorder: 'rgba(245, 158, 11, 0.7)',
  dangerBorder: 'rgba(239, 68, 68, 0.7)',
  infoBorder: 'rgba(87, 195, 255, 0.7)',
  neutralBorder: 'rgba(102, 69, 182, 0.7)',
  overlayBg: 'rgba(0, 0, 0, 0.8)',
  // Glass Tokens
  glassBg: 'rgba(18, 4, 46, 0.85)',
  glassBorder: 'rgba(102, 69, 182, 0.3)',
};

const violetDarkTheme = {
  ...darkTheme,
  background: '#080510',
  backgroundHover: '#110820',
  backgroundPress: '#1a1030',
  color: '#f5f3ff',
  borderColor: 'rgba(167,139,250,0.3)',
  borderColorPress: 'rgba(196,181,253,0.6)',
  borderColorFocus: 'rgba(196,181,253,0.85)',
  shadowColor: 'rgba(5,0,30,0.4)',
  primary: '#a78bfa',
  primaryGradientStart: '#c4b5fd',
  primaryGradientEnd: '#a78bfa',
  secondary: '#818cf8',
  overlayBg: 'rgba(0,0,0,0.75)',
  glassBg: 'rgba(13, 10, 24, 0.72)',
  glassBorder: 'rgba(167, 139, 250, 0.12)',
  glassBgHover: 'rgba(139,92,246,0.14)',
  glassBorderHover: 'rgba(196,181,253,0.38)',
};

const violetLightTheme = {
  ...lightTheme,
  background: '#faf5ff',
  backgroundHover: '#f3e8ff',
  backgroundPress: '#e9d5ff',
  color: '#1e1b4b',
  borderColor: 'rgba(196,181,253,0.5)',
  borderColorPress: 'rgba(139,92,246,0.7)',
  borderColorFocus: 'rgba(109,40,217,0.75)',
  shadowColor: 'rgba(109,40,217,0.1)',
  primary: '#7c3aed',
  primaryGradientStart: '#8b5cf6',
  primaryGradientEnd: '#6d28d9',
  secondary: '#4f46e5',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(167, 139, 250, 0.15)',
  glassBgHover: 'rgba(109,40,217,0.1)',
  glassBorderHover: 'rgba(139,92,246,0.45)',
};

const tealDarkTheme = {
  ...darkTheme,
  background: '#040f0f',
  backgroundHover: '#081a1a',
  backgroundPress: '#0d2424',
  color: '#f0fdfa',
  borderColor: 'rgba(45,212,191,0.25)',
  borderColorPress: 'rgba(94,234,212,0.55)',
  borderColorFocus: 'rgba(45,212,191,0.8)',
  shadowColor: 'rgba(0,20,20,0.45)',
  primary: '#2dd4bf',
  primaryGradientStart: '#5eead4',
  primaryGradientEnd: '#2dd4bf',
  secondary: '#38bdf8',
  overlayBg: 'rgba(0,0,0,0.75)',
  glassBg: 'rgba(4, 15, 15, 0.72)',
  glassBorder: 'rgba(45, 212, 191, 0.12)',
  glassBgHover: 'rgba(13,148,136,0.14)',
  glassBorderHover: 'rgba(94,234,212,0.38)',
};

const tealLightTheme = {
  ...lightTheme,
  background: '#f0fdfa',
  backgroundHover: '#ccfbf1',
  backgroundPress: '#99f6e4',
  color: '#042f2e',
  borderColor: 'rgba(94,234,212,0.45)',
  borderColorPress: 'rgba(45,212,191,0.65)',
  borderColorFocus: 'rgba(13,148,136,0.75)',
  shadowColor: 'rgba(13,148,136,0.1)',
  primary: '#0d9488',
  primaryGradientStart: '#2dd4bf',
  primaryGradientEnd: '#0d9488',
  secondary: '#0891b2',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(45, 212, 191, 0.15)',
  glassBgHover: 'rgba(13,148,136,0.1)',
  glassBorderHover: 'rgba(45,212,191,0.48)',
};

export const config = (function () {
  const conf = createTamagui({
    animations: getAnimations(),
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
      dark: darkTheme,
      neonLight: neonLightTheme,
      neonDark: neonDarkTheme,
      violetDark: violetDarkTheme,
      violetLight: violetLightTheme,
      tealDark: tealDarkTheme,
      tealLight: tealLightTheme,
    },
    media: {
      // Desktop-first (maxWidth) - Order from largest to smallest so narrower ones override broader ones
      xxl: { maxWidth: 1600 },
      xl: { maxWidth: 1420 },
      lg: { maxWidth: 1280 },
      md: { maxWidth: 1150 },
      tablet: { maxWidth: 1023 },
      sm: { maxWidth: 800 },
      xs: { maxWidth: 660 },

      // Mobile-first (minWidth) - Order from smallest to largest so broader ones override narrower ones
      gtXs: { minWidth: 661 },
      gtSm: { minWidth: 801 },
      gtTablet: { minWidth: 1024 },
      gtMd: { minWidth: 1151 },
      gtLg: { minWidth: 1281 },

      // Height and interaction
      short: { maxHeight: 820 },
      tall: { minHeight: 820 },
      hoverNone: { hover: 'none' },
      pointerCoarse: { pointer: 'coarse' },
    },
  });

  return conf;
})();

/**
 * Ensures Tamagui is initialized globally.
 * This is safe to call multiple times and should be called early in the
 * render cycle of the root client component to stabilize SSR.
 */
export const setupTamagui = () => {
  if (typeof globalThis !== 'undefined' && !(globalThis as any).TamaguiConfig) {
    (globalThis as any).TamaguiConfig = config;
  }
};

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig { }
}

// Prime the global configuration immediately upon module evaluation
setupTamagui();

export default config;
