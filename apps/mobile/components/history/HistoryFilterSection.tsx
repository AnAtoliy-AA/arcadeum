import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { Palette } from '@/hooks/useThemedStyles';
import type { HistoryStatus } from '@/pages/History/api/historyApi';
import type { TranslationKey } from '@/lib/i18n/messages';
import type { Replacements } from '@/lib/i18n/types';

type HistoryFilterSectionProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: HistoryStatus | 'all';
  setStatusFilter: (filter: HistoryStatus | 'all') => void;
  loading: boolean;
  refreshing: boolean;
  handleManualRefresh: () => void;
  totalCount: number;
  entriesLength: number;
  t: (key: TranslationKey, replacements?: Replacements) => string;
  mutedTextColor: string;
  tintColor: string;
};

export function HistoryFilterSection({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  loading,
  refreshing,
  handleManualRefresh,
  totalCount,
  entriesLength,
  t,
  mutedTextColor,
  tintColor,
}: HistoryFilterSectionProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchContainer}>
        <IconSymbol
          name="magnifyingglass"
          size={18}
          color={mutedTextColor}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t('history.search.placeholder')}
          placeholderTextColor={mutedTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterScroll}
        >
          {['all', 'lobby', 'in_progress', 'completed', 'waiting', 'active', 'abandoned'].map((filter) => {
            // Map filter value to translation key
            const getTranslationKey = (filterValue: string): TranslationKey => {
              if (filterValue === 'all') {
                return 'history.filter.all';
              }
              // Convert snake_case to camelCase for status keys
              const statusKey = filterValue.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
              return `history.status.${statusKey}` as TranslationKey;
            };

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  statusFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(filter as HistoryStatus | 'all')}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    statusFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {t(getTranslationKey(filter))}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.headerRefreshButton,
            (loading || refreshing) && styles.headerRefreshButtonDisabled,
          ]}
          onPress={handleManualRefresh}
          disabled={loading || refreshing}
        >
          <IconSymbol
            name="arrow.clockwise"
            size={16}
            color={tintColor}
          />
          <ThemedText style={styles.headerRefreshLabel}>
            {t('history.actions.refresh')}
          </ThemedText>
        </TouchableOpacity>
      </View>
      {totalCount > 0 && (
        <ThemedText style={styles.resultsInfo}>
          {t('history.pagination.showing', {
            count: entriesLength,
            total: totalCount || entriesLength,
          })}
        </ThemedText>
      )}
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    filterContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: palette.background,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: palette.text,
      padding: 0,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterScroll: {
      flexShrink: 1,
    },
    filterScrollContent: {
      gap: 8,
      paddingRight: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.background,
    },
    filterChipActive: {
      backgroundColor: palette.tint,
      borderColor: palette.tint,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
    },
    filterChipTextActive: {
      color: palette.background,
    },
    resultsInfo: {
      fontSize: 12,
      color: palette.icon,
    },
    headerRefreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexShrink: 0,
    },
    headerRefreshButtonDisabled: {
      opacity: 0.6,
    },
    headerRefreshLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
  });
}