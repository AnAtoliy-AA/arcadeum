import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { usePackages } from '../api/usePackages';
import { useBuyGems } from '../api/useBuyGems';
import { GemPackageCard } from './GemPackageCard';
import type { GemPackage } from '../api/usePackages';

export function GemStoreList() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { data: packages, isLoading, isError } = usePackages();
  const buyGems = useBuyGems();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuy = useCallback(
    (packageId: string) => {
      if (buyingId) return;
      setBuyingId(packageId);
      buyGems.mutate(packageId, {
        onSettled: () => setBuyingId(null),
      });
    },
    [buyGems, buyingId],
  );

  const renderItem = useCallback(
    ({ item }: { item: GemPackage }) => (
      <GemPackageCard
        item={item}
        labels={{
          buy: t('gems.store.buy'),
          bonus: t('gems.store.bonus'),
          buying: t('gems.store.buying'),
        }}
        isPending={buyingId === item.id}
        onBuy={handleBuy}
      />
    ),
    [handleBuy, buyingId, t],
  );

  const keyExtractor = useCallback((item: GemPackage) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.center} testID="gem-store-loading">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center} testID="gem-store-error">
        <ThemedText style={styles.errorText}>
          {t('gems.store.loadError')}
        </ThemedText>
      </View>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <View style={styles.center} testID="gem-store-empty">
        <ThemedText style={styles.emptyText}>
          {t('gems.store.empty')}
        </ThemedText>
      </View>
    );
  }

  return (
    <View testID="gem-store-list">
      <ThemedText style={styles.sectionTitle}>
        {t('gems.store.title')}
      </ThemedText>
      <FlatList
        data={packages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: palette.text,
      marginHorizontal: 16,
      marginBottom: 12,
      marginTop: 8,
    },
    listContent: {
      paddingHorizontal: 16,
    },
    separator: {
      height: 10,
    },
    errorText: {
      fontSize: 14,
      color: '#ef4444',
      textAlign: 'center',
      padding: 16,
    },
    emptyText: {
      fontSize: 14,
      color: palette.icon,
      textAlign: 'center',
      padding: 16,
    },
  });
}
