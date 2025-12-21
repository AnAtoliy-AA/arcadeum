import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { HistorySummary } from '@/pages/History/api/historyApi';
import type { TranslationKey } from '@/lib/i18n/messages';
import { formatParticipantDisplayName } from '@/utils/historyUtils';
import { gamesCatalog } from '@/pages/GamesScreen/catalog';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { Palette } from '@/hooks/useThemedStyles';

const STATUS_TRANSLATION_KEYS = {
  lobby: 'history.status.lobby',
  in_progress: 'history.status.inProgress',
  completed: 'history.status.completed',
  waiting: 'history.status.waiting',
  active: 'history.status.active',
} as const;

const gameNameLookup = new Map(
  gamesCatalog.map((game) => [game.id, game.name]),
);

function resolveGameName(gameId: string): string | undefined {
  return gameNameLookup.get(gameId.trim());
}

type HistoryListItemProps = {
  item: HistorySummary;
  onSelect: (item: HistorySummary) => void;
  currentUserId: string;
  mutedTextColor: string;
  tintColor: string;
  t: (key: TranslationKey) => string;
};

export function HistoryListItem({
  item,
  onSelect,
  currentUserId,
  mutedTextColor,
  tintColor,
  t,
}: HistoryListItemProps) {
  const styles = useThemedStyles(createStyles);
  const statusKey = STATUS_TRANSLATION_KEYS[item.status];
  const statusLabel = statusKey ? t(statusKey) : item.status;
  const displayName =
    t(`games.${item.gameId}.name` as any) ||
    item.gameId ||
    resolveGameName(item.gameId) ||
    t('history.unknownGame');
  const others = item.participants
    .map(
      (participant) =>
        `${formatParticipantDisplayName(
          participant.id,
          participant.username,
          participant.email,
        )}${participant.isHost ? ' 👑' : ''}`,
    )
    .join(', ');

  // Parse and validate date
  const lastActivityDate = item.lastActivityAt
    ? new Date(item.lastActivityAt)
    : null;
  const isValidDate = lastActivityDate && !isNaN(lastActivityDate.getTime());
  const lastActivity = isValidDate ? lastActivityDate.toLocaleString() : '-';

  return (
    <TouchableOpacity style={styles.entry} onPress={() => onSelect(item)}>
      <View style={styles.entryHeader}>
        <ThemedText style={styles.entryGameName} numberOfLines={1}>
          {displayName}
        </ThemedText>
        <ThemedText style={styles.entryStatus}>{statusLabel}</ThemedText>
      </View>
      <ThemedText style={styles.entryRoomName} numberOfLines={1}>
        {item.roomName}
      </ThemedText>
      <ThemedText style={styles.entryParticipants} numberOfLines={1}>
        {others ||
          (item.host
            ? formatParticipantDisplayName(
                item.host.id,
                item.host.username,
                item.host.email,
              )
            : t('history.unknownHost'))}
      </ThemedText>
      <View style={styles.entryFooter}>
        <IconSymbol name="clock" size={14} color={mutedTextColor} />
        <ThemedText style={styles.entryTimestamp}>{lastActivity}</ThemedText>
      </View>
      <View style={styles.entryCTA}>
        <ThemedText style={styles.entryCTAtext}>
          {t('history.actions.viewDetails')}
        </ThemedText>
        <IconSymbol name="chevron.right" size={14} color={tintColor} />
      </View>
    </TouchableOpacity>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    entry: {
      marginHorizontal: 16,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.background,
      gap: 6,
    },
    entryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    entryGameName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    entryStatus: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.tint,
    },
    entryRoomName: {
      fontSize: 14,
      color: palette.text,
    },
    entryParticipants: {
      fontSize: 13,
      color: palette.icon,
    },
    entryFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    entryTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    entryCTA: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
      marginTop: 8,
    },
    entryCTAtext: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.tint,
    },
  });
}
