import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import type { ExplodingCatsTableStyles } from '../styles';

interface GameHeaderProps {
  statusLabel: string;
  isCompleted: boolean;
  styles: ExplodingCatsTableStyles;
  roomName?: string;
}

export function GameHeader({
  statusLabel,
  isCompleted,
  styles,
  roomName,
}: GameHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerTitle}>
          <IconSymbol
            name="rectangle.grid.2x2"
            size={18}
            color={styles.headerIcon.color as string}
          />
          <ThemedText style={styles.headerText}>
            {roomName || t('games.table.headerTitle')}
          </ThemedText>
        </View>
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
        </View>
      </View>
      {isCompleted ? (
        <View style={styles.messageCard}>
          <IconSymbol
            name="crown.fill"
            size={18}
            color={styles.messageText.color as string}
          />
          <ThemedText style={styles.messageText}>
            {t('games.table.messageCompleted')}
          </ThemedText>
        </View>
      ) : null}
    </>
  );
}
