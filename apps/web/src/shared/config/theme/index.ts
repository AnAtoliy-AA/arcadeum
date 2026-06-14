export type {
  ThemeName,
  ThemePreference,
  SurfaceToken,
  OptionToken,
  PillToken,
  DownloadToken,
  PrimaryButtonToken,
  SecondaryButtonToken,
  ThemeTokens,
} from './types';

export { lightTokens, darkTokens } from './tokens.base';
export { neonDarkTokens, neonLightTokens } from './tokens.neon';
export { violetDarkTokens, violetLightTokens } from './tokens.violet';
export { tealDarkTokens, tealLightTokens } from './tokens.teal';

import { lightTokens, darkTokens } from './tokens.base';
import { neonDarkTokens, neonLightTokens } from './tokens.neon';
import { violetDarkTokens, violetLightTokens } from './tokens.violet';
import { tealDarkTokens, tealLightTokens } from './tokens.teal';
import type { ThemeName, ThemeTokens, ThemePreference } from './types';

export const DEFAULT_THEME_NAME: ThemeName = 'tealDark';

export const themeTokens: Record<ThemeName, ThemeTokens> = {
  light: lightTokens,
  dark: darkTokens,
  neonLight: neonLightTokens,
  neonDark: neonDarkTokens,
  violetDark: violetDarkTokens,
  violetLight: violetLightTokens,
  tealDark: tealDarkTokens,
  tealLight: tealLightTokens,
};

export function getThemeTokens(theme: ThemeName): ThemeTokens {
  return themeTokens[theme] || themeTokens[DEFAULT_THEME_NAME];
}

export function isThemeName(value: unknown): value is ThemeName {
  return (
    value === 'light' ||
    value === 'dark' ||
    value === 'neonLight' ||
    value === 'neonDark' ||
    value === 'violetDark' ||
    value === 'violetLight' ||
    value === 'tealDark' ||
    value === 'tealLight'
  );
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || isThemeName(value);
}

export const THEME_OPTIONS: ThemePreference[] = [
  'system',
  'light',
  'dark',
  'neonLight',
  'neonDark',
  'violetDark',
  'violetLight',
  'tealDark',
  'tealLight',
];
