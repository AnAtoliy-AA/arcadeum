import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import type { TranslationKey } from '@/lib/i18n/messages';

type HistoryEmptyStateProps = {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  entriesLength: number;
  styles: {
    emptyContainer: any;
    placeholderText: any;
    errorText: any;
    retryButton: any;
    retryText: any;
  };
  t: (key: TranslationKey) => string;
  onRetry: () => void;
};

export function HistoryEmptyState({
  loading,
  error,
  isAuthenticated,
  entriesLength,
  styles,
  t,
  onRetry,
}: HistoryEmptyStateProps) {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator />
        <ThemedText style={styles.placeholderText}>
          {t('common.loading')}
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <ThemedText style={styles.retryText}>
            {t('common.retry')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.placeholderText}>
          {t('history.list.emptySignedOut')}
        </ThemedText>
      </View>
    );
  }

  if (entriesLength === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.placeholderText}>
          {t('history.list.emptyNoEntries')}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.placeholderText}>
        {t('history.search.noResults')}
      </ThemedText>
    </View>
  );
}
