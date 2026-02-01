import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';

type EmptyStateProps = {
  filtersActive: boolean;
};

export function EmptyState({ filtersActive }: EmptyStateProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <IconSymbol
        name="sparkles"
        size={22}
        color={styles.icon.color as string}
      />
      <ThemedText style={styles.title}>
        {filtersActive
          ? t('games.lounge.filterEmptyTitle')
          : t('games.lounge.emptyTitle')}
      </ThemedText>
      <ThemedText style={styles.text}>
        {filtersActive
          ? t('games.lounge.filterEmptyDescription')
          : t('games.lounge.emptyDescription')}
      </ThemedText>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      marginTop: 32,
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
      borderStyle: 'dashed',
      gap: 10,
    },
    icon: {
      color: palette.tint,
    },
    title: {
      color: palette.text,
      fontWeight: '600',
    },
    text: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
