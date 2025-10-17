import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSessionTokens } from '@/stores/sessionTokens';
import { listGameRooms, type GameRoomSummary } from './api/gamesApi';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from './roomUtils';

function resolveParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function GameRoomScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string; gameId?: string; roomName?: string }>();
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();

  const roomId = useMemo(() => resolveParam(params?.id), [params]);
  const gameId = useMemo(() => resolveParam(params?.gameId), [params]);
  const fallbackName = useMemo(() => resolveParam(params?.roomName), [params]);

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!roomId || !tokens.accessToken) {
        setRoom(null);
        setError(
          roomId
            ? 'Sign in to load room details.'
            : 'Room not found. The invite link may be incomplete.',
        );
        return;
      }

      const setFlag = mode === 'initial' ? setLoading : setRefreshing;
      setFlag(true);

      try {
        const response = await listGameRooms(gameId, {
          accessToken: tokens.accessToken,
          refreshTokens,
        });
        const nextRoom = response.rooms.find((item) => item.id === roomId);
        if (nextRoom) {
          setRoom(nextRoom);
          setError(null);
        } else {
          setRoom(null);
          setError('This room is no longer active or you have left the lobby.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load room details.';
        setRoom(null);
        setError(message);
      } finally {
        setFlag(false);
      }
    },
    [gameId, refreshTokens, roomId, tokens.accessToken],
  );

  useEffect(() => {
    void fetchRoom();
  }, [fetchRoom]);

  useFocusEffect(
    useCallback(() => {
      void fetchRoom('refresh');
      return undefined;
    }, [fetchRoom]),
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/games');
    }
  }, [router]);

  const handleViewGame = useCallback(() => {
    const targetGameId = room?.gameId ?? gameId;
    if (!targetGameId) return;
    router.push({ pathname: '/games/[id]', params: { id: targetGameId } });
  }, [gameId, room?.gameId, router]);

  const statusStyle = useMemo(() => {
    if (!room) return styles.statusLobby;
    switch (room.status) {
      case 'in_progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusLobby;
    }
  }, [room, styles.statusCompleted, styles.statusInProgress, styles.statusLobby]);

  const displayName = room?.name ?? fallbackName ?? 'Game room';
  const displayGame = room ? formatRoomGame(room.gameId) : gameId ? formatRoomGame(gameId) : undefined;

  const isLoading = loading && !refreshing;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRoom('refresh')}
            tintColor={styles.refreshTint.color as string}
          />
        )}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={20} color={styles.backButtonText.color as string} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gameButton} onPress={handleViewGame} disabled={!room && !gameId}>
            <IconSymbol name="book" size={16} color={styles.gameButtonText.color as string} />
            <ThemedText style={styles.gameButtonText}>View game</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.nameBlock}>
              <ThemedText type="title" style={styles.roomTitle} numberOfLines={2}>{displayName}</ThemedText>
              {displayGame ? (
                <ThemedText style={styles.gameLabel}>{displayGame}</ThemedText>
              ) : null}
            </View>
            <View style={[styles.statusPill, statusStyle]}>
              <ThemedText style={styles.statusText}>{getRoomStatusLabel(room?.status ?? 'lobby')}</ThemedText>
            </View>
          </View>

          {room ? (
            <View style={styles.metaGrid}>
              <MetaItem
                icon="person.crop.circle"
                label="Host"
                value={formatRoomHost(room.hostId)}
              />
              <MetaItem
                icon="person.3.fill"
                label="Players"
                value={room.maxPlayers ? `${room.playerCount}/${room.maxPlayers}` : `${room.playerCount}`}
              />
              <MetaItem
                icon="clock.fill"
                label="Created"
                value={formatRoomTimestamp(room.createdAt)}
              />
              <MetaItem
                icon={room.visibility === 'private' ? 'lock.fill' : 'sparkles'}
                label="Access"
                value={room.visibility === 'private' ? 'Invite only' : 'Open lobby'}
              />
              {room.inviteCode ? (
                <MetaItem icon="number" label="Invite code" value={room.inviteCode} />
              ) : null}
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={styles.refreshTint.color as string} />
              <ThemedText style={styles.loadingText}>Syncing room details…</ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color={styles.errorText.color as string} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.bodyCard}>
          <View style={styles.bodyHeader}>
            <IconSymbol name="sparkles" size={18} color={styles.bodyHeaderText.color as string} />
            <ThemedText style={styles.bodyHeaderText}>Table preparation</ThemedText>
          </View>
          <ThemedText style={styles.bodyCopy}>
            We&apos;ll guide players through setup, turn flow, and scoring once the interactive tabletop is ready. For now,
            coordinate in chat, review the rules, and gather your crew while we finish the real-time experience.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.footerCard}>
          <IconSymbol name="arrow.clockwise" size={18} color={styles.footerIcon.color as string} />
          <View style={styles.footerCopy}>
            <ThemedText type="subtitle">Waiting on more players?</ThemedText>
            <ThemedText style={styles.footerText}>
              Keep this screen open—we&apos;ll auto-refresh the lobby when teammates join or the host starts the match.
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function MetaItem({ icon, label, value }: { icon: Parameters<typeof IconSymbol>[0]['name']; label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaItem}>
      <IconSymbol name={icon} size={16} color={styles.metaItemLabel.color as string} />
      <View style={styles.metaItemCopy}>
        <ThemedText style={styles.metaItemLabel}>{label}</ThemedText>
        <ThemedText style={styles.metaItemValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const surfaceShadow = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(8, 10, 15, 0.45)';
  const statusLobbyBg = isLight ? '#DCFCE7' : '#1D3A28';
  const statusInProgressBg = isLight ? '#FDE68A' : '#42381F';
  const statusCompletedBg = isLight ? '#E2E8F0' : '#2B3038';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 20,
      paddingBottom: 48,
    },
    refreshTint: {
      color: palette.tint,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    gameButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
    },
    gameButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    headerCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 16,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    },
    nameBlock: {
      flex: 1,
      gap: 6,
    },
    roomTitle: {
      color: palette.text,
    },
    gameLabel: {
      color: palette.icon,
      fontSize: 13,
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statusLobby: {
      backgroundColor: statusLobbyBg,
    },
    statusInProgress: {
      backgroundColor: statusInProgressBg,
    },
    statusCompleted: {
      backgroundColor: statusCompletedBg,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: '45%',
    },
    metaItemCopy: {
      gap: 2,
    },
    metaItemLabel: {
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
    },
    metaItemValue: {
      color: palette.text,
      fontWeight: '600',
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingText: {
      color: palette.icon,
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: '#F9731620',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#F9731655',
    },
    errorText: {
      color: '#F97316',
      fontWeight: '600',
    },
    bodyCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 14,
      shadowColor: surfaceShadow,
      shadowRadius: 10,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    bodyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bodyHeaderText: {
      color: palette.text,
      fontWeight: '600',
    },
    bodyCopy: {
      color: palette.icon,
      lineHeight: 20,
    },
    footerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 20,
      borderRadius: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    footerIcon: {
      color: palette.tint,
    },
    footerCopy: {
      flex: 1,
      gap: 4,
    },
    footerText: {
      color: palette.icon,
      lineHeight: 19,
    },
  });
}
