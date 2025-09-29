import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Generic helper: pass a factory receiving the active palette, returns a memoized StyleSheet.
export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: (palette: typeof Colors.light | typeof Colors.dark) => T): T {
  const scheme = useColorScheme() || 'light';
  const palette = Colors[scheme];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => factory(palette), [palette]);
}

export type Palette = typeof Colors.light | typeof Colors.dark;
