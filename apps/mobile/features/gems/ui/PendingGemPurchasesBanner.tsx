import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { usePendingPurchases } from '../api/usePendingPurchases';
import { useFinalizeGemPurchase } from '../api/useFinalizeGemPurchase';
import type { PendingGemPurchase } from '../api/usePendingPurchases';

interface PendingItemProps {
  item: PendingGemPurchase;
  isPending: boolean;
  onVerify: (orderId: string) => void;
  labels: { verify: string; verifying: string };
  palette: Palette;
  styles: ReturnType<typeof createStyles>;
}

function PendingItem({
  item,
  isPending,
  onVerify,
  labels,
  styles,
}: PendingItemProps) {
  return (
    <View
      style={styles.row}
      testID={`pending-purchase-row-${item.paypalOrderId}`}
    >
      <ThemedText style={styles.itemName}>{item.packageName}</ThemedText>
      <Pressable
        style={[styles.verifyBtn, isPending && styles.verifyBtnDisabled]}
        onPress={() => !isPending && onVerify(item.paypalOrderId)}
        disabled={isPending}
        testID={`pending-purchase-verify-${item.paypalOrderId}`}
        accessibilityRole="button"
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText style={styles.verifyText}>{labels.verify}</ThemedText>
        )}
      </Pressable>
    </View>
  );
}

export function PendingGemPurchasesBanner() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { data: pending, isLoading } = usePendingPurchases();
  const finalize = useFinalizeGemPurchase();

  const handleVerify = useCallback(
    (orderId: string) => {
      finalize.mutate(orderId);
    },
    [finalize],
  );

  if (isLoading || !pending || pending.length === 0) {
    return null;
  }

  return (
    <View style={styles.banner} testID="pending-gem-purchases-banner">
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t('gems.pending.title')}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t('gems.pending.subtitle')}
        </ThemedText>
      </View>
      {pending.map((item) => (
        <PendingItem
          key={item.paypalOrderId}
          item={item}
          isPending={
            finalize.isPending && finalize.variables === item.paypalOrderId
          }
          onVerify={handleVerify}
          labels={{
            verify: t('gems.pending.verify'),
            verifying: t('gems.pending.verifying'),
          }}
          styles={styles}
          palette={{} as Palette}
        />
      ))}
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    banner: {
      margin: 16,
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#1E3A5F',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#2563eb',
      gap: 8,
    },
    header: {
      gap: 2,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: '#bfdbfe',
    },
    subtitle: {
      fontSize: 12,
      color: '#93c5fd',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    itemName: {
      fontSize: 13,
      color: palette.text ?? '#e2e8f0',
      flex: 1,
    },
    verifyBtn: {
      backgroundColor: '#2563eb',
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
      minWidth: 72,
      alignItems: 'center',
    },
    verifyBtnDisabled: {
      opacity: 0.6,
    },
    verifyText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
    },
  });
}
