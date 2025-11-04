import { Platform, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  webRole?: 'main' | 'banner' | 'contentinfo' | 'region';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  webRole,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  );

  const resolvedProps: ViewProps = { ...otherProps };

  if (Platform.OS === 'web' && webRole) {
    (resolvedProps as Record<string, unknown>).role = webRole;
  }

  return <View style={[{ backgroundColor }, style]} {...resolvedProps} />;
}
