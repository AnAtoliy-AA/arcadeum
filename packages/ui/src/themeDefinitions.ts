/**
 * Plain theme token maps (no Tamagui imports) — shared between the Tamagui
 * config (packages/ui) and the web theme provider, which mints these values
 * as CSS variables on <html>. Keeping this module Tamagui-free lets the
 * Tailwind home page theme without loading the Tamagui runtime.
 */

export const themeBase = {
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
  // primary darkened from #0284c7 (sky-600) to #0369a1 (sky-700) so that
  // white-on-primary buttons (e.g. Header desktop login LinkButton) reach
  // WCAG AA 4.5:1 contrast — was 4.09:1, fails. Phase 2 audit ARC-570.
  primary: '#0369a1',
  primaryText: '#ffffff',
  secondary: '#4338ca',
  danger: '#b91c1c',
  // Alias the danger palette under the `$error*` namespace so components
  // that follow the standard form-validation naming (Input, FormGroup,
  // TextArea, Select, admin/tournaments error banners) resolve their
  // tokens at SSR. A missing token here causes Tamagui to emit inline
  // style fallbacks server-side and atomic classes client-side, which
  // triggers hydration mismatches on any page using these components.
  error: '#b91c1c',
  errorText: '#ffffff',
  errorBg: 'rgba(220, 38, 38, 0.15)',
  errorBgSoft: 'rgba(185, 28, 28, 0.1)',
  errorBorder: 'rgba(185, 28, 28, 0.4)',
  success: '#047857',
  warning: '#92400e',
  info: '#2563eb',
  accent: '#38bdf8',
  mythicAccent: '#ec4899',
  diamondAccent: '#22d3ee',
  platinumAccent: '#a78bfa',
  goldAccent: '#facc15',
  silverAccent: '#94a3b8',
  bronzeAccent: '#b45309',
  neutral: '#8e9196',
  gridLine: 'rgba(255,255,255,0.04)',
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
  infoText: '#ffffff',
  secondaryText: '#ffffff',
  textSecondary: '#8e9196',
  dangerText: '#ffffff',
  successText: '#ffffff',
  warningText: '#ffffff',
  victoryText: '#1a1a1a',
  victoryGradientStart: '#ffe866',
  victoryGradientEnd: '#ff9500',
  backgroundRadialStart: 'rgba(59, 130, 246, 0.18)',
  backgroundRadialEnd: 'rgba(126, 58, 242, 0.16)',
};

export const lightTheme = {
  ...themeBase,
  background: '#f8fafc',
  color: '#0f172a',
  borderColor: '#cbd5e1',
  borderColorHover: '#b1bdcd',
  borderColorPress: '#94a3b8',
  primary: '#0369a1',
  primaryGradientStart: '#1d4ed8',
  primaryGradientEnd: '#1e40af',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  textSecondary: '#64748b',
  neutral: '#64748b',
  infoText: '#0f172a',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(0, 0, 0, 0.1)',
  backgroundRadialStart: 'rgba(96, 165, 250, 0.22)',
  backgroundRadialEnd: 'rgba(129, 140, 248, 0.18)',
};

export const neonDarkTheme = {
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

export const neonLightTheme = {
  ...lightTheme,
  primary: '#0891b2',
  primaryGradientStart: '#22d3ee',
  primaryGradientEnd: '#06b6d4',
  accent: '#06b6d4',
  primaryText: '#0f172a',
};

export const violetDarkTheme = {
  ...themeBase,
  background: '#080510',
  primary: '#5b21b6',
  primaryText: '#ffffff',
  victoryText: '#1a1a1a',
  accent: '#9333ea',
  glassBg: 'rgba(13, 10, 24, 0.72)',
  backgroundRadialStart: 'rgba(124, 58, 237, 0.22)',
  backgroundRadialEnd: 'rgba(192, 132, 252, 0.18)',
};

export const violetLightTheme = {
  ...themeBase,
  background: '#faf5ff',
  color: '#1e1b4b',
  primary: '#5b21b6',
  primaryGradientStart: '#4c1d95',
  primaryGradientEnd: '#5b21b6',
  accent: '#6d28d9',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  borderColor: 'rgba(167, 139, 250, 0.3)',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  victoryText: '#1a1a1a',
  backgroundRadialStart: 'rgba(167, 139, 250, 0.28)',
  backgroundRadialEnd: 'rgba(196, 181, 253, 0.24)',
};

export const tealDarkTheme = {
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

export const tealLightTheme = {
  ...themeBase,
  background: '#f0fdfa',
  color: '#042f2e',
  primary: '#0f766e',
  primaryGradientStart: '#115e59',
  primaryGradientEnd: '#0f766e',
  accent: '#0891b2',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  borderColor: 'rgba(45, 212, 191, 0.15)',
  primaryText: '#ffffff',
  secondaryText: '#ffffff',
  victoryText: '#1a1a1a',
  backgroundRadialStart: 'rgba(13,148,136,0.18)',
  backgroundRadialEnd: 'rgba(6,182,212,0.14)',
};

export const themeDefinitions: Record<string, Record<string, string>> = {
  light: lightTheme,
  dark: themeBase,
  neonLight: neonLightTheme,
  neonDark: neonDarkTheme,
  violetDark: violetDarkTheme,
  violetLight: violetLightTheme,
  tealDark: tealDarkTheme,
  tealLight: tealLightTheme,
};
