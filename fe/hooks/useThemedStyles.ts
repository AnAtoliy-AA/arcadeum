import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Colors, type ThemePalette } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Generic helper: pass a factory receiving the active palette, returns a memoized StyleSheet.
export function useThemedStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (palette: ThemePalette) => T): T {
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => factory(palette), [palette]);
}

export type Palette = ThemePalette;
