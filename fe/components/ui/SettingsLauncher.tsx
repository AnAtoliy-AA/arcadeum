import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/lib/i18n';

const HIDDEN_ROUTE_PREFIXES = ['/auth', '/settings'];

export function SettingsLauncher() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { t } = useTranslation();

  const shouldHide = useMemo(() => {
    if (!pathname) {
      return false;
    }
    return HIDDEN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }, [pathname]);

  const handlePress = useCallback(() => {
    router.push('/settings' as never);
  }, [router]);

  if (shouldHide) {
    return null;
  }

  const topOffset = Math.max(insets.top, 10) + 8;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        accessibilityLabel={t('navigation.settingsTitle')}
        accessibilityHint={t('navigation.openSettingsHint')}
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            top: topOffset,
            right: 16,
            backgroundColor: palette.background,
            borderColor: palette.icon,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <IconSymbol name="gearshape.fill" size={18} color={palette.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: 'rgba(15, 23, 42, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
});
