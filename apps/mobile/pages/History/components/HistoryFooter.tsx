import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import type { TranslationKey } from '@/lib/i18n/messages';

type HistoryFooterProps = {
  loadingMore: boolean;
  hasMore: boolean;
  entriesLength: number;
  styles: {
    footerLoading: ViewStyle;
    footerLoadingText: TextStyle;
    loadMoreButton: ViewStyle;
    loadMoreText: TextStyle;
  };
  t: (key: TranslationKey) => string;
  onLoadMore: () => void;
};

export function HistoryFooter({
  loadingMore,
  hasMore,
  entriesLength,
  styles,
  t,
  onLoadMore,
}: HistoryFooterProps) {
  if (loadingMore) {
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" />
        <ThemedText style={styles.footerLoadingText}>
          {t('history.pagination.loading')}
        </ThemedText>
      </View>
    );
  }

  if (hasMore && entriesLength > 0) {
    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
        <ThemedText style={styles.loadMoreText}>
          {t('history.pagination.loadMore')}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return null;
}
