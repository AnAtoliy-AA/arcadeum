import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';

export function LoadingState() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="small" color={styles.spinner.color as string} />
      <ThemedText style={styles.text}>
        {t('games.lounge.loadingRooms')}
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
    },
    spinner: {
      color: palette.tint,
    },
    text: {
      color: palette.icon,
    },
  });
}
