/**
 * Resolve a legacy `$token` reference into a CSS value at runtime.
 *
 * Theme-dependent tokens (background, primary, glassBg, …) map to the CSS
 * variables minted on <html> by ThemeContext. Static tokens (genre palettes,
 * role colors, gold shades) and the Radix-style scales used by role badges
 * fall back to their literal values.
 */

/** Themed keys minted as CSS vars by ThemeContext (themeDefinitions). */
const THEMED_KEYS = new Set([
  'background',
  'backgroundHover',
  'backgroundPress',
  'backgroundFocus',
  'backgroundColor',
  'color',
  'colorHover',
  'colorPress',
  'colorFocus',
  'borderColor',
  'borderColorHover',
  'borderColorPress',
  'borderColorFocus',
  'shadowColor',
  'overlayBg',
  'primary',
  'primaryText',
  'secondary',
  'danger',
  'error',
  'errorText',
  'errorBg',
  'errorBgSoft',
  'errorBorder',
  'success',
  'warning',
  'info',
  'accent',
  'mythicAccent',
  'diamondAccent',
  'platinumAccent',
  'goldAccent',
  'silverAccent',
  'bronzeAccent',
  'neutral',
  'gridLine',
  'backgroundTransparent',
  'glassBg',
  'glassBgHover',
  'glassBorder',
  'glassBorderHover',
  'primaryGradientStart',
  'primaryGradientEnd',
  'secondaryGradientStart',
  'secondaryGradientEnd',
  'dangerGradientStart',
  'dangerGradientEnd',
  'infoText',
  'secondaryText',
  'textSecondary',
  'dangerText',
  'successText',
  'warningText',
  'victoryText',
  'victoryGradientStart',
  'victoryGradientEnd',
  'backgroundRadialStart',
  'backgroundRadialEnd',
]);

/** Static tokens → literal values. */
const STATIC_COLORS: Record<string, string> = {
  white: '#f5f7ff',
  black: '#000000',
  transparent: 'transparent',
  cyberpunkBg: '#0f0518',
  cyberpunkPrimary: '#06b6d4',
  cyberpunkAccent: '#c026d3',
  underwaterBg: '#040b15',
  underwaterPrimary: '#22d3ee',
  underwaterAccent: '#0ea5e9',
  crimeBg: '#18181b',
  crimePrimary: '#dc2626',
  crimeAccent: '#991b1b',
  horrorBg: '#020617',
  horrorPrimary: '#10b981',
  horrorAccent: '#065f46',
  adventureBg: '#451a03',
  adventurePrimary: '#f59e0b',
  adventureAccent: '#b45309',
  hikeBg: '#020617',
  hikePrimary: '#38bdf8',
  hikeSecondary: '#0ea5e9',
  rolePremium: '#fbbf24',
  roleVip: '#e879f9',
  roleSupporter: '#f472b6',
  roleDeveloper: '#818cf8',
  gold: '#FFD700',
  goldLight: '#ffe866',
  goldDark: '#ff9500',
  goldHover: '#fff07a',
  goldPress: '#ffb500',
  colorMuted: 'rgba(180, 180, 200, 0.7)',
  textMuted: 'rgba(180, 180, 200, 0.7)',
  warningBg: 'rgba(146, 64, 14, 0.1)',
  red3: '#4c1d1d',
  orange10: '#f76b15',
};

/** Radix dark scale used by role badges (legacy default dark theme). */
const RADIX_DARK: Record<string, string> = {
  red1: '#1c1316',
  red2: '#1a1414',
  red3: '#4c1d1d',
  red9: '#ff6369',
  violet1: '#17151f',
  violet2: '#1b1825',
  violet3: '#241c43',
  violet9: '#8767fb',
  orange1: '#1a1511',
  orange2: '#1b1712',
  orange3: '#3d1f0e',
  orange9: '#ff9e4a',
  yellow1: '#1a170e',
  yellow2: '#1b180f',
  yellow3: '#3a2d00',
  yellow9: '#ffd644',
  gray1: '#161618',
  gray2: '#1a1a1c',
  gray3: '#1c1d21',
  gray9: '#6e7683',
  green1: '#0e1815',
  green2: '#0f1a16',
  green3: '#11301f',
  green9: '#3dd68c',
  cyan1: '#0d1a1e',
  cyan2: '#0f1c21',
  cyan3: '#0b3445',
  cyan9: '#00b2d6',
};

/** Convert a `$token` (or plain CSS value) into a usable CSS color string. */
export function resolveThemeColor(value: string | undefined | null): string {
  if (!value) return 'transparent';
  const raw = String(value);
  if (!raw.startsWith('$')) return raw;
  const name = raw.slice(1);
  if (THEMED_KEYS.has(name)) return `var(--${name})`;
  if (name in STATIC_COLORS) return STATIC_COLORS[name];
  if (name in RADIX_DARK) return RADIX_DARK[name];
  // Unknown token — keep a var() so it degrades gracefully instead of breaking CSS
  return `var(--${name})`;
}
