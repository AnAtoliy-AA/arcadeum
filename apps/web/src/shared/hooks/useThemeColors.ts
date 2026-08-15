'use client';

import { useEffect, useState } from 'react';

import { themeDefinitions } from '@arcadeum/ui/themeDefinitions';

/**
 * Returns the resolved theme colors as plain CSS values (strings), keyed by
 * themeDefinitions keys (e.g. `colors.primary` → '#0369a1').
 *
 * Replaces the legacy Tamagui `useTheme()`; values are read from the CSS variables
 * minted on <html> by ThemeContext, so they stay in sync on theme switch.
 */
export function useThemeColors(): Record<string, string> {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const doc = document.documentElement;
      const computed = getComputedStyle(doc);
      const next: Record<string, string> = {};
      const keys = Object.keys(themeDefinitions.dark ?? {});
      for (const key of keys) {
        next[key] = computed.getPropertyValue(`--${key}`).trim();
      }
      next.background = computed.getPropertyValue('--background').trim();
      next.foreground = computed.getPropertyValue('--foreground').trim();
      next.primary = computed.getPropertyValue('--primary').trim();
      setColors(next);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
