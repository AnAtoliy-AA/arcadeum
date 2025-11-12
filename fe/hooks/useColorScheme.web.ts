import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import type { AppThemeName } from '@/constants/Colors';
import { useSettings } from '@/stores/settings';

const DARK_LIKE_SCHEMES = new Set<AppThemeName>(['dark', 'neonDark', 'neonLight']);

export interface UseColorSchemeResult {
  colorScheme: AppThemeName;
  isDarkLike: boolean;
}

/**
 * Web needs a hydration guard to avoid React mismatches during SSR/static rendering.
 * Once the client hydrates we mirror the shared hook logic with settings awareness.
 */
export function useColorScheme(): UseColorSchemeResult {
  const { themePreference } = useSettings();
  const systemScheme = useSystemColorScheme();
  const [clientHydrated, setClientHydrated] = useState(false);

  useEffect(() => {
    setClientHydrated(true);
  }, []);

  let colorScheme: AppThemeName;

  if (themePreference === 'system') {
    if (!clientHydrated) {
      // Match the document's initial light background until hydration completes.
      colorScheme = 'light';
    } else {
      colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
    }
  } else {
    colorScheme = themePreference;
  }

  return {
    colorScheme,
    isDarkLike: DARK_LIKE_SCHEMES.has(colorScheme),
  };
}

export function isDarkLikeScheme(scheme: AppThemeName): boolean {
  return DARK_LIKE_SCHEMES.has(scheme);
}
