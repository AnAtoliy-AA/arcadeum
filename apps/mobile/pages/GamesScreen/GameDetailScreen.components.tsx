import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { createStyles } from './GameDetailScreen.styles';
import {
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from './roomUtils';
import type { GameRoomSummary } from './api/gamesApi';

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <ThemedView style={styles.sectionCard}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText style={styles.sectionDescription}>{description}</ThemedText>
      ) : null}
      <View style={styles.sectionContent}>{children}</View>
    </ThemedView>
  );
}

export function MetaChip({
  label,
  icon,
}: {
  label: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaChip}>
      <IconSymbol
        name={icon}
        size={16}
        color={styles.metaChipIcon.color as string}
      />
      <ThemedText style={styles.metaChipText}>{label}</ThemedText>
    </View>
  );
}

interface RoomCardProps {
  room: GameRoomSummary;
  joiningRoomId: string | null;
  onJoinRoom: (room: GameRoomSummary) => void;
}

export function RoomCard({ room, joiningRoomId, onJoinRoom }: RoomCardProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const statusStyle =
    room.status === 'lobby'
      ? styles.roomStatusLobby
      : room.status === 'in_progress'
        ? styles.roomStatusInProgress
        : styles.roomStatusCompleted;

  const statusLabel = t(getRoomStatusLabel(room.status));
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
  const createdLabelRaw = formatRoomTimestamp(room.createdAt);
  const createdLabel =
    createdLabelRaw === 'Just created'
      ? t('games.rooms.justCreated')
      : createdLabelRaw;
  const hostRaw =
    room.host?.displayName ?? formatRoomHost(room.hostId);
  const hostDisplay =
    hostRaw === 'mystery captain'
      ? t('games.rooms.mysteryHost')
      : hostRaw;
  const isJoining = joiningRoomId === room.id;
  const isPrivate = room.visibility === 'private';

  return (
    <ThemedView style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <ThemedText type="defaultSemiBold" style={styles.roomTitle}>
          {room.name}
        </ThemedText>
        <View style={[styles.roomStatusPill, statusStyle]}>
          <ThemedText style={styles.roomStatusText}>
            {statusLabel}
          </ThemedText>
        </View>
      </View>
      <View style={styles.roomMetaRow}>
        <IconSymbol
          name="person.crop.circle"
          size={16}
          color={styles.roomMetaIcon.color as string}
        />
        <ThemedText style={styles.roomMetaText}>
          {t('games.rooms.hostedBy', { host: hostDisplay })}
        </ThemedText>
      </View>
      <View style={styles.roomMetaRow}>
        <IconSymbol
          name="person.3.fill"
          size={16}
          color={styles.roomMetaIcon.color as string}
        />
        <ThemedText style={styles.roomMetaText}>
          {capacityDetail}
        </ThemedText>
      </View>
      <View style={styles.roomFooter}>
        <View style={styles.roomBadgeRow}>
          <View
            style={[
              styles.roomVisibilityChip,
              isPrivate
                ? styles.roomVisibilityChipPrivate
                : styles.roomVisibilityChipPublic,
            ]}
          >
            <IconSymbol
              name={isPrivate ? 'lock.fill' : 'sparkles'}
              size={14}
              color={styles.roomVisibilityChipIcon.color as string}
            />
            <ThemedText style={styles.roomVisibilityChipText}>
              {isPrivate
                ? t('games.rooms.visibility.private')
                : t('games.rooms.visibility.public')}
            </ThemedText>
          </View>
          <ThemedText style={styles.roomTimestamp}>
            {t('games.rooms.created', { timestamp: createdLabel })}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[
            styles.roomJoinButton,
            isJoining && styles.roomJoinButtonDisabled,
          ]}
          onPress={() => onJoinRoom(room)}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator
              size="small"
              color={styles.roomJoinButtonText.color as string}
            />
          ) : (
            <>
              <IconSymbol
                name="arrow.right.circle.fill"
                size={18}
                color={styles.roomJoinButtonText.color as string}
              />
              <ThemedText style={styles.roomJoinButtonText}>
                {t('games.common.joinRoom')}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
