import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useWalletBalance } from '@/features/wallet/api/useWallet';
import { Colors, type ThemePalette } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/lib/i18n';

export function BalanceChip() {
  const { colorScheme } = useColorScheme();
  const palette: ThemePalette = Colors[colorScheme];
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWalletBalance();

  if (isError) {
    // Don't surface wallet errors in the header chip — fail silently
    console.warn('[BalanceChip] failed to fetch wallet balance');
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.row} accessibilityLabel={t('common.loading')}>
        <ActivityIndicator size="small" color={palette.tint} />
      </View>
    );
  }

  if (!data) {
    return null;
  }

  const { coins, gems } = data;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.pill,
          { backgroundColor: palette.cardBackground ?? palette.background },
        ]}
        accessibilityLabel={t('wallet.chip.coinsLabel')}
        accessibilityValue={{ text: String(coins) }}
      >
        <Text style={[styles.pillText, { color: palette.text }]}>
          {'🪙 '}
          {coins}
        </Text>
      </View>
      <View
        style={[
          styles.pill,
          { backgroundColor: palette.cardBackground ?? palette.background },
        ]}
        accessibilityLabel={t('wallet.chip.gemsLabel')}
        accessibilityValue={{ text: String(gems) }}
      >
        <Text style={[styles.pillText, { color: palette.text }]}>
          {'💎 '}
          {gems}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
