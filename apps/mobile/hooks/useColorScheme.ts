import { useColorScheme as useSystemColorScheme } from 'react-native';

import type { AppThemeName } from '@/constants/Colors';
import { useSettings } from '@/stores/settings';

const DARK_LIKE_SCHEMES = new Set<AppThemeName>([
  'dark',
  'neonDark',
  'neonLight',
]);

export interface UseColorSchemeResult {
  colorScheme: AppThemeName;
  isDarkLike: boolean;
}

export function useColorScheme(): UseColorSchemeResult {
  const { themePreference } = useSettings();
  const systemScheme = useSystemColorScheme();

  const colorScheme: AppThemeName =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  return {
    colorScheme,
    isDarkLike: DARK_LIKE_SCHEMES.has(colorScheme),
  };
}

export function isDarkLikeScheme(scheme: AppThemeName): boolean {
  return DARK_LIKE_SCHEMES.has(scheme);
}
