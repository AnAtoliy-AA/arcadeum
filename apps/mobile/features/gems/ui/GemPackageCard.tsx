import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';
import type { GemPackage } from '../api/usePackages';

export interface GemPackageCardLabels {
  buy: string;
  bonus: string;
  buying: string;
}

export interface GemPackageCardProps {
  item: GemPackage;
  labels: GemPackageCardLabels;
  isPending?: boolean;
  onBuy: (packageId: string) => void;
}

export function GemPackageCard({
  item,
  labels,
  isPending,
  onBuy,
}: GemPackageCardProps) {
  const styles = useThemedStyles(createStyles);
  const totalGems = item.gems + item.bonusGems;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: item.currency,
  }).format(item.priceUsd);

  return (
    <ThemedView style={styles.card} testID={`gem-package-card-${item.id}`}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {item.name}
        </ThemedText>
        {item.bonusGems > 0 && (
          <View
            style={styles.bonusBadge}
            testID={`gem-package-bonus-${item.id}`}
          >
            <ThemedText style={styles.bonusText}>
              +{item.bonusGems} {labels.bonus}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.gemsRow}>
        <ThemedText style={styles.gemsEmoji}>💎</ThemedText>
        <ThemedText style={styles.gemsCount}>
          {totalGems.toLocaleString()}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.price}>{formattedPrice}</ThemedText>
        <Pressable
          style={[styles.buyButton, isPending && styles.buyButtonDisabled]}
          onPress={() => !isPending && onBuy(item.id)}
          disabled={isPending}
          testID={`gem-package-buy-${item.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${labels.buy} ${item.name}`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.buyText}>{labels.buy}</ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      padding: 16,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      ...platformShadow({
        color: '#000',
        opacity: 0.08,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 2,
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    name: {
      fontSize: 15,
      color: palette.text,
      flex: 1,
    },
    bonusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: '#14532D',
    },
    bonusText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#86efac',
    },
    gemsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    gemsEmoji: {
      fontSize: 22,
    },
    gemsCount: {
      fontSize: 22,
      fontWeight: '700',
      color: palette.text,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    price: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    buyButton: {
      backgroundColor: palette.tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      minWidth: 80,
      alignItems: 'center',
    },
    buyButtonDisabled: {
      opacity: 0.6,
    },
    buyText: {
      fontSize: 14,
      fontWeight: '700',
      color: palette.background,
    },
  });
}
