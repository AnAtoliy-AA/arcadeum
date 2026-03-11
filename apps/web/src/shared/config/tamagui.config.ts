import { createAnimations } from '@tamagui/animations-css';
import { shorthands } from '@tamagui/shorthands';
import { createTamagui, createTokens } from 'tamagui';

const animations = createAnimations({
  fast: 'ease-in 100ms',
  medium: 'ease-in 200ms',
  slow: 'ease-in 300ms',
});

const headingFont = {
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

const bodyFont = {
  ...headingFont,
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
    primary: '#57c3ff',
    secondary: '#8f9bff',
    accent: '#81f1ff',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    white: '#f5f7ff',
    black: '#000000',
    transparent: 'transparent',
  },
});

const darkTheme = {
  background: '#151718',
  backgroundHover: '#1e2326',
  color: '#ecefee',
  borderColor: '#32353d',
  shadowColor: 'rgba(0,0,0,0.5)',
};

const lightTheme = {
  background: '#f8fafc',
  backgroundHover: '#edf1f6',
  color: '#0f172a',
  borderColor: '#cbd5e1',
  shadowColor: 'rgba(0,0,0,0.1)',
};

const neonDarkTheme = {
  background: '#06011b',
  backgroundHover: '#100830',
  color: '#f5f7ff',
  borderColor: 'rgba(143, 155, 255, 0.35)',
  shadowColor: 'rgba(5, 0, 40, 0.35)',
};

const neonLightTheme = {
  background: '#06011b',
  backgroundHover: '#100830',
  color: '#f5f7ff',
  borderColor: 'rgba(102, 69, 182, 0.6)',
  shadowColor: 'rgba(8, 5, 24, 0.65)',
};

export const config = createTamagui({
  animations,
  defaultTheme: 'dark',
  shouldAddPrefersColorSelection: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    neonLight: neonLightTheme,
    neonDark: neonDarkTheme,
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    tablet: { maxWidth: 1024 },
    md: { maxWidth: 1150 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtTablet: { minWidth: 1024 + 1 },
    gtMd: { minWidth: 1150 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
