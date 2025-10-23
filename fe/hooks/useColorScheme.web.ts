import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettings } from '@/stores/settings';

/**
 * Web needs a hydration guard to avoid React mismatches during SSR/static rendering.
 * Once the client hydrates we mirror the shared hook logic with settings awareness.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { themePreference } = useSettings();
  const systemScheme = useSystemColorScheme();
  const [clientHydrated, setClientHydrated] = useState(false);

  useEffect(() => {
    setClientHydrated(true);
  }, []);

  if (themePreference === 'system') {
    if (!clientHydrated) {
      // Match the document's initial light background until hydration completes.
      return 'light';
    }
    return systemScheme === 'dark' ? 'dark' : 'light';
  }

  return themePreference;
}
