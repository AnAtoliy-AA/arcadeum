import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';

type ErrorStateProps = {
  error: string;
  onRetry: () => void;
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <IconSymbol
        name="exclamationmark.triangle.fill"
        size={20}
        color={styles.icon.color as string}
      />
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          {t('games.lounge.errorTitle')}
        </ThemedText>
        <ThemedText style={styles.text}>{error}</ThemedText>
      </View>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <IconSymbol
          name="arrow.clockwise"
          size={16}
          color={styles.buttonText.color as string}
        />
        <ThemedText style={styles.buttonText}>{t('common.retry')}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      marginTop: 32,
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.gameRoom.raisedBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      color: palette.text,
      fontWeight: '600',
    },
    icon: {
      color: '#F97316',
    },
    content: {
      flex: 1,
      gap: 4,
    },
    text: {
      color: palette.icon,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
      backgroundColor: palette.gameRoom.raisedBackground,
    },
    buttonText: {
      color: palette.tint,
      fontWeight: '600',
    },
  });
}
