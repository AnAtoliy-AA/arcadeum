/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import {
  Colors,
  type AppThemeName,
  type ThemePalette,
} from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type PaletteStringKeys = {
  [K in keyof ThemePalette]: ThemePalette[K] extends string ? K : never;
}[keyof ThemePalette];

export function useThemeColor(
  props: Partial<Record<AppThemeName, string>>,
  colorName: PaletteStringKeys,
): string {
  const { colorScheme } = useColorScheme();
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[colorScheme][colorName];
}
