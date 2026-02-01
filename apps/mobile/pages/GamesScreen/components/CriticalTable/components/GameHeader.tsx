import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import type { CriticalTableStyles } from '../styles';

interface GameHeaderProps {
  statusLabel: string;
  isCompleted: boolean;
  styles: CriticalTableStyles;
  roomName?: string;
  idleTimerEnabled?: boolean;
}

export function GameHeader({
  statusLabel,
  isCompleted,
  styles,
  roomName,
  idleTimerEnabled,
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {idleTimerEnabled && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 999,
                backgroundColor: '#eab30833',
              }}
            >
              <IconSymbol name="bolt.fill" size={14} color="#eab308" />
              <ThemedText
                style={{
                  color: '#eab308',
                  fontSize: 10,
                  fontWeight: '700',
                }}
              >
                {t('games.rooms.fastRoom')}
              </ThemedText>
            </View>
          )}
          <View style={styles.statusBadge}>
            <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
          </View>
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
