/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type LightPalette = typeof Colors.light;
type DarkPalette = typeof Colors.dark;
type SharedColorKey = keyof LightPalette & keyof DarkPalette;
type ResolvedColorKey = {
  [K in SharedColorKey]: LightPalette[K] extends string
    ? DarkPalette[K] extends string
      ? K
      : never
    : never;
}[SharedColorKey];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ResolvedColorKey,
): string {
  const theme = useColorScheme();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[resolvedTheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[resolvedTheme][colorName] as string;
}
