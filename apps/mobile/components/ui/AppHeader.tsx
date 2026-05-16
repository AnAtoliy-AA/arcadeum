import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Focusable } from '@/components/ui/Focusable';
import { Colors, type ThemePalette } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/lib/i18n';
import { platformShadow } from '@/lib/platformShadow';
import { BalanceChip } from '@/features/wallet/ui/BalanceChip';

interface AppHeaderProps {
  title: string;
  canGoBack: boolean;
  onBack?: () => void;
  onSettingsPress: () => void;
  settingsDisabled?: boolean;
  settingsActive?: boolean;
  showBalanceChip?: boolean;
}

export function AppHeader({
  title,
  canGoBack,
  onBack,
  onSettingsPress,
  settingsDisabled = false,
  settingsActive = false,
  showBalanceChip = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme, isDarkLike } = useColorScheme();
  const palette: ThemePalette = Colors[colorScheme];
  const { t } = useTranslation();

  const topPadding = useMemo(() => Math.max(insets.top, 12), [insets.top]);
  const borderColor = palette.cardBorder ?? 'rgba(148, 163, 184, 0.24)';
  const shadowColor = isDarkLike
    ? 'rgba(0, 0, 0, 0.45)'
    : 'rgba(15, 23, 42, 0.12)';

  const handleBackPress = () => {
    if (canGoBack && onBack) {
      onBack();
    }
  };

  const handleSettingsPress = () => {
    if (!settingsDisabled) {
      onSettingsPress();
    }
  };

  const settingsHint = t(
    settingsActive
      ? 'navigation.closeSettingsHint'
      : 'navigation.openSettingsHint',
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: topPadding,
          backgroundColor: palette.background,
          borderBottomColor: borderColor,
          shadowColor,
        },
      ]}
    >
      <View style={styles.content}>
        {canGoBack ? (
          <Focusable
            accessibilityHint={t('navigation.backButtonHint')}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            onPress={handleBackPress}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: palette.cardBackground ?? palette.background,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <IconSymbol name="chevron.left" size={18} color={palette.text} />
          </Focusable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[styles.title, { color: palette.text }]}
        >
          {title}
        </Text>

        <Pressable
          accessibilityHint={settingsHint}
          accessibilityLabel={t('navigation.settingsTitle')}
          accessibilityRole="button"
          disabled={settingsDisabled}
          onPress={handleSettingsPress}
          accessibilityState={{
            disabled: settingsDisabled,
            selected: settingsActive,
          }}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: palette.cardBackground ?? palette.background,
              opacity: settingsDisabled ? 0.5 : pressed ? 0.75 : 1,
            },
          ]}
        >
          <IconSymbol
            name={settingsActive ? 'xmark' : 'gearshape.fill'}
            size={18}
            color={palette.text}
          />
        </Pressable>
      </View>
      {showBalanceChip ? (
        <View style={styles.chipRow}>
          <BalanceChip />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...platformShadow({
      color: 'rgba(15, 23, 42, 0.12)',
      opacity: 0.12,
      radius: 10,
      offset: { width: 0, height: 2 },
      elevation: 2,
    }),
  },
  content: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
