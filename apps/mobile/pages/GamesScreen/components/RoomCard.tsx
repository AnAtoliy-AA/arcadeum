import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { platformShadow } from '@/lib/platformShadow';
import type { GameRoomSummary } from '../api/gamesApi';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from '../roomUtils';

type RoomCardProps = {
  room: GameRoomSummary;
  isJoining: boolean;
  onJoin: () => void;
  onWatch: () => void;
  canWatch: boolean;
  userId?: string;
};

export function RoomCard({
  room,
  isJoining,
  onJoin,
  onWatch,
  canWatch,
}: RoomCardProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const statusStyle =
    room.status === 'lobby'
      ? styles.statusLobby
      : room.status === 'in_progress'
        ? styles.statusInProgress
        : styles.statusCompleted;

  const statusKey = getRoomStatusLabel(room.status);
  const statusLabel = t(statusKey);

  const capacityLabel = room.maxPlayers
    ? t('games.rooms.capacityWithMax', {
        current: room.playerCount,
        max: room.maxPlayers,
      })
    : t('games.rooms.capacityWithoutMax', {
        count: room.playerCount,
      });

  const playerNames = room.members
    ?.map((member) => member.displayName)
    .filter(Boolean)
    .join(', ');

  const capacityDetail = playerNames
    ? `${capacityLabel} • ${playerNames}`
    : capacityLabel;

  const createdLabel = formatRoomTimestamp(room.createdAt);
  const createdTimestamp =
    createdLabel === 'Just created'
      ? t('games.rooms.justCreated')
      : createdLabel;

  const isPrivate = room.visibility === 'private';
  const isFastRoom = room.gameOptions?.idleTimerEnabled ?? false;

  const hostDisplay =
    room.host?.displayName ??
    (room.hostId ? formatRoomHost(room.hostId) : t('games.rooms.mysteryHost'));

  const gameName = formatRoomGame(room.gameId);
  const gameLabel =
    gameName === 'Unknown game' ? t('games.rooms.unknownGame') : gameName;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {room.name}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isFastRoom && (
            <IconSymbol name="bolt.fill" size={16} color="#eab308" />
          )}
          <View style={[styles.statusPill, statusStyle]}>
            <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
          </View>
        </View>
      </View>
      <ThemedText style={styles.gameLabel}>{gameLabel}</ThemedText>
      <View style={styles.metaRow}>
        <IconSymbol
          name="person.crop.circle"
          size={16}
          color={styles.metaIcon.color as string}
        />
        <ThemedText style={styles.metaText}>
          {t('games.rooms.hostedBy', { host: hostDisplay })}
        </ThemedText>
      </View>
      <View style={styles.metaRow}>
        <IconSymbol
          name="person.3.fill"
          size={16}
          color={styles.metaIcon.color as string}
        />
        <ThemedText style={styles.metaText}>{capacityDetail}</ThemedText>
      </View>
      <View style={styles.footer}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.visibilityChip,
              isPrivate
                ? styles.visibilityChipPrivate
                : styles.visibilityChipPublic,
            ]}
          >
            <IconSymbol
              name={isPrivate ? 'lock.fill' : 'sparkles'}
              size={14}
              color={styles.visibilityChipIcon.color as string}
            />
            <ThemedText style={styles.visibilityChipText}>
              {isPrivate
                ? t('games.rooms.visibility.private')
                : t('games.rooms.visibility.public')}
            </ThemedText>
          </View>
          <ThemedText style={styles.timestamp}>
            {t('games.rooms.created', {
              timestamp: createdTimestamp,
            })}
          </ThemedText>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.watchButton,
              !canWatch ? styles.watchButtonDisabled : null,
            ]}
            onPress={onWatch}
            disabled={!canWatch}
          >
            <IconSymbol
              name="eye.fill"
              size={16}
              color={styles.watchButtonText.color as string}
            />
            <ThemedText style={styles.watchButtonText}>
              {t('games.common.watchRoom')}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.joinButton, isJoining && styles.joinButtonDisabled]}
            onPress={onJoin}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator
                size="small"
                color={styles.joinButtonText.color as string}
              />
            ) : (
              <>
                <IconSymbol
                  name="arrow.right.circle.fill"
                  size={18}
                  color={styles.joinButtonText.color as string}
                />
                <ThemedText style={styles.joinButtonText}>
                  {t('games.common.joinRoom')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      padding: 20,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.gameRoom.border,
      ...platformShadow({
        color: palette.gameRoom.surfaceShadow,
        opacity: 0.8,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      color: palette.text,
      fontSize: 16,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusLobby: {
      backgroundColor: palette.gameRoom.statusLobby,
    },
    statusInProgress: {
      backgroundColor: palette.gameRoom.statusInProgress,
    },
    statusCompleted: {
      backgroundColor: palette.gameRoom.statusCompleted,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    gameLabel: {
      color: palette.icon,
      fontSize: 13,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaIcon: {
      color: palette.tint,
    },
    metaText: {
      color: palette.text,
      fontSize: 13,
    },
    footer: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    badgeRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    visibilityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    visibilityChipPrivate: {
      backgroundColor: '#bf5af233',
    },
    visibilityChipPublic: {
      backgroundColor: '#22c55e33',
    },
    visibilityChipIcon: {
      color: palette.tint,
    },
    visibilityChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    timestamp: {
      color: palette.icon,
      fontSize: 11,
    },
    watchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.tint,
      backgroundColor: 'transparent',
    },
    watchButtonDisabled: {
      opacity: 0.6,
    },
    watchButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    joinButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    joinButtonDisabled: {
      opacity: 0.7,
    },
    joinButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 13,
    },
    fastRoomChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: '#eab30833',
    },
    fastRoomChipIcon: {
      color: '#eab308',
    },
    fastRoomChipText: {
      color: '#eab308',
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
