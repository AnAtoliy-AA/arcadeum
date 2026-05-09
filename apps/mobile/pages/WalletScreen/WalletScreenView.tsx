import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, type ThemePalette } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/lib/i18n';
import {
  useWalletBalance,
  useWalletTransactions,
} from '@/features/wallet/api/useWallet';
import type {
  WalletCurrency,
  WalletTransactionView,
} from '@/features/wallet/api/useWallet';

type CurrencyFilter = WalletCurrency | 'all';

interface TransactionItemProps {
  item: WalletTransactionView;
  palette: ThemePalette;
}

function TransactionItem({ item, palette }: TransactionItemProps) {
  const { t } = useTranslation();
  const isPositive = item.delta > 0;
  const currencyEmoji = item.currency === 'coins' ? '🪙' : '💎';

  return (
    <View
      style={[
        styles.transactionRow,
        { borderBottomColor: palette.cardBorder ?? 'rgba(148,163,184,0.2)' },
      ]}
    >
      <View style={styles.transactionLeft}>
        <Text style={[styles.transactionReason, { color: palette.text }]}>
          {currencyEmoji}{' '}
          {t(`wallet.reasons.${item.reason}` as Parameters<typeof t>[0]) ??
            item.reason}
        </Text>
        <Text style={[styles.transactionDate, { color: palette.icon }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionDelta,
            { color: isPositive ? '#22c55e' : '#ef4444' },
          ]}
        >
          {isPositive ? '+' : ''}
          {item.delta}
        </Text>
        <Text style={[styles.transactionBalance, { color: palette.icon }]}>
          {t('wallet.page.filters.all')}: {item.balanceAfter}
        </Text>
      </View>
    </View>
  );
}

export function WalletScreenView() {
  const { colorScheme } = useColorScheme();
  const palette: ThemePalette = Colors[colorScheme];
  const { t } = useTranslation();

  const [filter, setFilter] = useState<CurrencyFilter>('all');
  const currency = filter === 'all' ? undefined : filter;

  const { data: balance, isLoading: balanceLoading } = useWalletBalance();

  const {
    data: txData,
    isLoading: txLoading,
    isError: txError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWalletTransactions(currency);

  const transactions = txData?.pages.flatMap((page) => page.items) ?? [];

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: WalletTransactionView }) => (
      <TransactionItem item={item} palette={palette} />
    ),
    [palette],
  );

  const keyExtractor = useCallback(
    (item: WalletTransactionView) => item.id,
    [],
  );

  const filters: { key: CurrencyFilter; label: string }[] = [
    { key: 'all', label: t('wallet.page.filters.all') },
    { key: 'coins', label: t('wallet.page.filters.coins') },
    { key: 'gems', label: t('wallet.page.filters.gems') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Balance summary */}
      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: palette.cardBackground ?? palette.background,
            borderColor: palette.cardBorder ?? 'rgba(148,163,184,0.2)',
          },
        ]}
      >
        {balanceLoading ? (
          <ActivityIndicator color={palette.tint} />
        ) : (
          <View style={styles.balanceRow}>
            <View style={styles.balancePill}>
              <Text style={[styles.balanceEmoji]}>🪙</Text>
              <Text style={[styles.balanceValue, { color: palette.text }]}>
                {balance?.coins ?? 0}
              </Text>
              <Text style={[styles.balanceLabel, { color: palette.icon }]}>
                {t('wallet.chip.coinsLabel')}
              </Text>
            </View>
            <View style={styles.balancePill}>
              <Text style={[styles.balanceEmoji]}>💎</Text>
              <Text style={[styles.balanceValue, { color: palette.text }]}>
                {balance?.gems ?? 0}
              </Text>
              <Text style={[styles.balanceLabel, { color: palette.icon }]}>
                {t('wallet.chip.gemsLabel')}
              </Text>
            </View>
          </View>
        )}
        <Text style={[styles.summary, { color: palette.icon }]}>
          {t('wallet.page.summary')}
        </Text>
      </View>

      {/* Currency filter tabs */}
      <View
        style={[
          styles.filterRow,
          { borderBottomColor: palette.cardBorder ?? 'rgba(148,163,184,0.2)' },
        ]}
      >
        {filters.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[
              styles.filterTab,
              filter === key && {
                borderBottomColor: palette.tint,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setFilter(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === key }}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: filter === key ? palette.tint : palette.icon },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Transaction list */}
      {txError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: palette.text }]}>
            {t('wallet.page.error.title')}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={[styles.retryButton, { backgroundColor: palette.tint }]}
          >
            <Text style={[styles.retryText, { color: palette.background }]}>
              {t('wallet.page.error.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={txLoading && transactions.length === 0}
              onRefresh={onRefresh}
              tintColor={palette.tint}
            />
          }
          contentContainerStyle={
            transactions.length === 0
              ? styles.emptyContainer
              : styles.listContent
          }
          ListEmptyComponent={
            txLoading ? (
              <ActivityIndicator color={palette.tint} style={styles.loader} />
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {t('wallet.page.empty.title')}
                </Text>
                <Text
                  style={[styles.emptyDescription, { color: palette.icon }]}
                >
                  {t('wallet.page.empty.description')}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            hasNextPage ? (
              <TouchableOpacity
                style={[styles.loadMoreButton, { borderColor: palette.tint }]}
                onPress={onLoadMore}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={palette.tint} />
                ) : (
                  <Text style={[styles.loadMoreText, { color: palette.tint }]}>
                    {t('wallet.page.loadMore')}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 24,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceEmoji: {
    fontSize: 22,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transactionLeft: {
    flex: 1,
    gap: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  transactionReason: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionDelta: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionBalance: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loader: {
    marginTop: 48,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 15,
  },
  loadMoreButton: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  loadMoreText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
