import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { gamesCatalog, type GameCatalogueEntry } from './catalog';
import {
  joinGameRoom,
  listGameRooms,
  type GameRoomSummary,
} from './api/gamesApi';
import { useSessionTokens } from '@/stores/sessionTokens';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from './roomUtils';
import { InviteCodeDialog } from './InviteCodeDialog';

type InvitePromptState = {
  visible: boolean;
  room: GameRoomSummary | null;
  mode: 'room' | 'manual';
  loading: boolean;
  error: string | null;
};

export default function GamesScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
  const navigateToCreate = useCallback((gameId?: string) => {
    if (gameId) {
      router.push({ pathname: '/games/create', params: { gameId } } as never);
    } else {
      router.push('/games/create' as never);
    }
  }, [router]);
  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
    whenUnauthenticated: '/auth',
    blockWhenUnauthenticated: true,
  });

  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsRefreshing, setRoomsRefreshing] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [invitePrompt, setInvitePrompt] = useState<InvitePromptState>({
    visible: false,
    room: null,
    mode: 'room',
    loading: false,
    error: null,
  });

  const fetchRooms = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!tokens.accessToken) {
        setRooms([]);
        setRoomsError(null);
        return;
      }

      const setLoadingFlag = mode === 'initial' ? setRoomsLoading : setRoomsRefreshing;
      setLoadingFlag(true);

      try {
        const response = await listGameRooms(undefined, {
          accessToken: tokens.accessToken,
          refreshTokens,
        });
        setRooms(response.rooms ?? []);
        setRoomsError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load rooms right now.';
        setRoomsError(message);
      } finally {
        setLoadingFlag(false);
      }
    },
    [refreshTokens, tokens.accessToken],
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useFocusEffect(
    useCallback(() => {
      fetchRooms('refresh');
    }, [fetchRooms]),
  );

  const sortedRooms = useMemo(() => {
    if (!rooms.length) return [];
    return [...rooms].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rooms]);

  const updateRoomList = useCallback((room: GameRoomSummary) => {
    setRooms((current) => {
      const next = [...current];
      const existingIndex = next.findIndex((existing) => existing.id === room.id);
      if (existingIndex >= 0) {
        next[existingIndex] = room;
        return next;
      }
      return [room, ...next];
    });
  }, []);

  const joinRoom = useCallback(async (room: GameRoomSummary, inviteCode?: string) => {
    setJoiningRoomId(room.id);
    if (inviteCode) {
      setInvitePrompt({ visible: true, room, mode: 'room', loading: true, error: null });
    }

    try {
      const response = await joinGameRoom(
        { roomId: room.id, inviteCode },
        {
          accessToken: tokens.accessToken,
          refreshTokens,
        },
      );

      updateRoomList(response.room);

  setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });

      Alert.alert('Joined room', 'You are in! The host will kick things off soon.');
      void fetchRooms('refresh');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not join that room right now.';
      const needsInvite = message.toLowerCase().includes('invite code');

      if (!inviteCode && needsInvite) {
  setInvitePrompt({ visible: true, room, mode: 'room', loading: false, error: null });
        return;
      }

      if (inviteCode && needsInvite) {
        setInvitePrompt({
          visible: true,
          room,
          mode: 'room',
          loading: false,
          error: 'Invite code didn’t work. Double-check and try again.',
        });
        return;
      }

      if (inviteCode) {
        setInvitePrompt({
          visible: true,
          room,
          mode: 'room',
          loading: false,
          error: message,
        });
        return;
      }

      Alert.alert('Couldn’t join room', message);
    } finally {
      setJoiningRoomId(null);
    }
  }, [fetchRooms, refreshTokens, tokens.accessToken, updateRoomList]);

  const joinRoomByInviteCode = useCallback(async (code: string) => {
    if (!tokens.accessToken) {
      Alert.alert(
        'Sign in required',
        'Log in to redeem an invite code and sync your seat with the host.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: () => router.push('/auth' as never),
          },
        ],
      );
      return;
    }

    setInvitePrompt({
      visible: true,
      room: null,
      mode: 'manual',
      loading: true,
      error: null,
    });

    try {
      const response = await joinGameRoom(
        { inviteCode: code },
        {
          accessToken: tokens.accessToken,
          refreshTokens,
        },
      );

      updateRoomList(response.room);

      setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });

      Alert.alert(
        'Joined room',
        `You’re in “${response.room.name}”. The host will kick things off soon.`,
      );
      void fetchRooms('refresh');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to join that room right now.';
      const needsInvite = message.toLowerCase().includes('invite code');

      setInvitePrompt({
        visible: true,
        room: null,
        mode: 'manual',
        loading: false,
        error: needsInvite
          ? 'Invite code didn’t work. Double-check and try again.'
          : message,
      });
    }
  }, [fetchRooms, refreshTokens, router, tokens.accessToken, updateRoomList]);

  const handleJoinRoom = useCallback((room: GameRoomSummary) => {
    if (!tokens.accessToken) {
      Alert.alert(
        'Sign in required',
        'Log in to join a lobby and sync your seat with the host.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: () => {
              router.push('/auth' as never);
            },
          },
        ],
      );
      return;
    }

    void joinRoom(room);
  }, [joinRoom, router, tokens.accessToken]);

  const handleInviteCancel = useCallback(() => {
    setInvitePrompt({ visible: false, room: null, mode: 'room', loading: false, error: null });
  }, []);

  const handleInviteSubmit = useCallback((code: string) => {
    if (invitePrompt.mode === 'manual') {
      void joinRoomByInviteCode(code);
      return;
    }

    if (!invitePrompt.room) {
      return;
    }

    void joinRoom(invitePrompt.room, code);
  }, [invitePrompt.mode, invitePrompt.room, joinRoom, joinRoomByInviteCode]);

  const handleManualInvite = useCallback(() => {
    if (!tokens.accessToken) {
      Alert.alert(
        'Sign in required',
        'Log in to redeem an invite code and sync your seat with the host.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: () => router.push('/auth' as never),
          },
        ],
      );
      return;
    }

    setInvitePrompt({ visible: true, room: null, mode: 'manual', loading: false, error: null });
  }, [router, tokens.accessToken]);

  const handleCreate = useCallback((game: GameCatalogueEntry) => {
    navigateToCreate(game.id);
  }, [navigateToCreate]);

  const handlePreview = useCallback((game: GameCatalogueEntry) => {
    router.push({ pathname: '/games/[id]', params: { id: game.id } });
  }, [router]);

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={roomsRefreshing}
            onRefresh={() => fetchRooms('refresh')}
            tintColor={styles.refreshControlTint.color as string}
          />
        )}
      >
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Tabletop Lounge</ThemedText>
            <ThemedText style={styles.subtitle}>
              Spin up real-time rooms, invite your friends, and let AICO handle rules, scoring, and moderation.
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigateToCreate()}>
            <IconSymbol name="sparkles" size={18} color={styles.headerButtonText.color as string} />
            <ThemedText style={styles.headerButtonText}>New room</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Featured games</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Early access titles we&apos;re polishing for launch. Tap to explore rules and reserve a playtest slot.
          </ThemedText>
        </View>

  {gamesCatalog.map(game => {
          const statusStyle =
            game.status === 'In prototype'
              ? styles.statusPrototype
              : game.status === 'In design'
                ? styles.statusDesign
                : styles.statusRoadmap;
          return (
          <ThemedView key={game.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>{game.name}</ThemedText>
              <View style={[styles.statusPill, statusStyle]}>
                <ThemedText style={styles.statusText}>{game.status}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.cardSummary}>{game.summary}</ThemedText>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <IconSymbol name="person.3.fill" size={16} color={styles.metaChipIcon.color as string} />
                <ThemedText style={styles.metaChipText}>{game.players}</ThemedText>
              </View>
              <View style={styles.metaChip}>
                <IconSymbol name="clock.fill" size={16} color={styles.metaChipIcon.color as string} />
                <ThemedText style={styles.metaChipText}>{game.duration}</ThemedText>
              </View>
            </View>
            <View style={styles.tagRow}>
              {game.tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => handleCreate(game)}>
                <ThemedText style={styles.primaryButtonText}>Create room</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => handlePreview(game)}>
                <ThemedText style={styles.secondaryButtonText}>View rules</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
          );
        })}

        <View style={styles.section}>
          <ThemedText type="subtitle">Active rooms</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Jump into a lobby that&apos;s already spinning up or scope what&apos;s happening live.
          </ThemedText>
          <TouchableOpacity style={styles.manualInviteTrigger} onPress={handleManualInvite}>
            <IconSymbol name="lock.open" size={16} color={styles.manualInviteTriggerText.color as string} />
            <ThemedText style={styles.manualInviteTriggerText}>Have an invite code?</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.roomsContainer}>
          {roomsLoading ? (
            <ThemedView style={styles.roomSkeleton}>
              <ActivityIndicator size="small" color={styles.roomSkeletonSpinner.color as string} />
              <ThemedText style={styles.roomSkeletonText}>Fetching rooms...</ThemedText>
            </ThemedView>
          ) : roomsError ? (
            <ThemedView style={styles.roomErrorCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={styles.roomErrorIcon.color as string} />
              <View style={styles.roomErrorCopy}>
                <ThemedText style={styles.roomErrorTitle}>Can&apos;t reach the lounge</ThemedText>
                <ThemedText style={styles.roomErrorText}>{roomsError}</ThemedText>
              </View>
              <TouchableOpacity style={styles.roomRetryButton} onPress={() => fetchRooms('refresh')}>
                <IconSymbol name="arrow.clockwise" size={16} color={styles.roomRetryText.color as string} />
                <ThemedText style={styles.roomRetryText}>Retry</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : sortedRooms.length === 0 ? (
            <ThemedView style={styles.roomEmptyCard}>
              <IconSymbol name="sparkles" size={22} color={styles.roomEmptyIcon.color as string} />
              <ThemedText style={styles.roomEmptyTitle}>No rooms yet</ThemedText>
              <ThemedText style={styles.roomEmptyText}>
                Be the trailblazer—kick off the first lobby or tap refresh to check again in a few.
              </ThemedText>
            </ThemedView>
          ) : (
            sortedRooms.map(room => {
              const statusStyle =
                room.status === 'lobby'
                  ? styles.roomStatusLobby
                  : room.status === 'in_progress'
                    ? styles.roomStatusInProgress
                    : styles.roomStatusCompleted;

              const statusLabel = getRoomStatusLabel(room.status);
              const capacityLabel = room.maxPlayers
                ? `${room.playerCount}/${room.maxPlayers} players`
                : `${room.playerCount} players`;
              const createdLabel = formatRoomTimestamp(room.createdAt);
              const isJoining = joiningRoomId === room.id;
              const isPrivate = room.visibility === 'private';

              return (
                <ThemedView key={room.id} style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.roomTitle}>{room.name}</ThemedText>
                    <View style={[styles.roomStatusPill, statusStyle]}>
                      <ThemedText style={styles.roomStatusText}>{statusLabel}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.roomGameLabel}>{formatRoomGame(room.gameId)}</ThemedText>
                  <View style={styles.roomMetaRow}>
                    <IconSymbol name="person.crop.circle" size={16} color={styles.roomMetaIcon.color as string} />
                    <ThemedText style={styles.roomMetaText}>Hosted by {formatRoomHost(room.hostId)}</ThemedText>
                  </View>
                  <View style={styles.roomMetaRow}>
                    <IconSymbol name="person.3.fill" size={16} color={styles.roomMetaIcon.color as string} />
                    <ThemedText style={styles.roomMetaText}>{capacityLabel}</ThemedText>
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
                          {isPrivate ? 'Invite only' : 'Open lobby'}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.roomTimestamp}>Created {createdLabel}</ThemedText>
                    </View>
                    <TouchableOpacity
                      style={[styles.roomJoinButton, isJoining && styles.roomJoinButtonDisabled]}
                      onPress={() => handleJoinRoom(room)}
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
                          <ThemedText style={styles.roomJoinButtonText}>Join room</ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              );
            })
          )}
        </View>

        <View style={styles.footerCard}>
          <IconSymbol name="sparkles" size={26} color={styles.footerIcon.color as string} />
          <View style={styles.footerCopy}>
            <ThemedText type="subtitle">Want a specific game?</ThemedText>
            <ThemedText style={styles.footerText}>
              Drop requests in #feature-votes or submit your own custom deck idea. Community picks go live every sprint.
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => navigateToCreate()}>
          <IconSymbol name="gamecontroller.fill" size={24} color={styles.fabIcon.color as string} />
          <ThemedText style={styles.fabText}>Create room</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      <InviteCodeDialog
        visible={invitePrompt.visible}
        roomName={invitePrompt.room?.name}
        mode={invitePrompt.mode}
        loading={invitePrompt.loading}
        error={invitePrompt.error}
        onSubmit={handleInviteSubmit}
        onCancel={handleInviteCancel}
      />
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const statusPrototypeBg = isLight ? '#D8F1FF' : '#1D3B48';
  const statusDesignBg = isLight ? '#EDE3FF' : '#2A2542';
  const statusRoadmapBg = isLight ? '#E0F6ED' : '#1F3A32';
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
      gap: 16,
      paddingBottom: 48,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    subtitle: {
      marginTop: 6,
      color: palette.icon,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    headerButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    refreshControlTint: {
      color: palette.tint,
    },
    section: {
      marginTop: 8,
      gap: 4,
    },
    sectionCaption: {
      color: palette.icon,
    },
    manualInviteTrigger: {
      marginTop: 8,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    manualInviteTriggerText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    card: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 20,
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    cardTitle: {
      flexShrink: 1,
    },
    cardSummary: {
      color: palette.text,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 12,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: raisedBackground,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    metaChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    metaChipIcon: {
      color: palette.tint,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagChip: {
      backgroundColor: raisedBackground,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500',
      color: palette.icon,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: palette.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '600',
      fontSize: 15,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 15,
    },
    footerCard: {
      flexDirection: 'row',
      gap: 16,
      padding: 20,
      borderRadius: 16,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      alignItems: 'center',
    },
    footerIcon: {
      color: palette.tint,
    },
    footerCopy: {
      flex: 1,
      gap: 6,
    },
    footerText: {
      color: palette.icon,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusPrototype: {
      backgroundColor: statusPrototypeBg,
    },
    statusDesign: {
      backgroundColor: statusDesignBg,
    },
    statusRoadmap: {
      backgroundColor: statusRoadmapBg,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    fab: {
      marginTop: 12,
      borderRadius: 16,
      backgroundColor: palette.tint,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    fabIcon: {
      color: palette.background,
    },
    fabText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 16,
    },
    roomsContainer: {
      gap: 12,
    },
    roomSkeleton: {
      borderRadius: 16,
      padding: 20,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomSkeletonSpinner: {
      color: palette.tint,
    },
    roomSkeletonText: {
      color: palette.icon,
    },
    roomErrorCard: {
      borderRadius: 16,
      padding: 18,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomErrorIcon: {
      color: '#F97316',
    },
    roomErrorCopy: {
      flex: 1,
      gap: 4,
    },
    roomErrorTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomErrorText: {
      color: palette.icon,
    },
    roomRetryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: raisedBackground,
    },
    roomRetryText: {
      color: palette.tint,
      fontWeight: '600',
    },
    roomEmptyCard: {
      borderRadius: 16,
      padding: 24,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      alignItems: 'center',
      gap: 10,
    },
    roomEmptyIcon: {
      color: palette.tint,
    },
    roomEmptyTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomEmptyText: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
    roomCard: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 20,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    roomTitle: {
      color: palette.text,
      fontSize: 16,
    },
    roomStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    roomStatusLobby: {
      backgroundColor: statusLobbyBg,
    },
    roomStatusInProgress: {
      backgroundColor: statusInProgressBg,
    },
    roomStatusCompleted: {
      backgroundColor: statusCompletedBg,
    },
    roomStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    roomGameLabel: {
      color: palette.icon,
      fontSize: 13,
    },
    roomMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roomMetaIcon: {
      color: palette.tint,
    },
    roomMetaText: {
      color: palette.text,
      fontSize: 13,
    },
    roomFooter: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    roomBadgeRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    roomVisibilityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    roomVisibilityChipPrivate: {
      backgroundColor: '#bf5af233',
    },
    roomVisibilityChipPublic: {
      backgroundColor: '#22c55e33',
    },
    roomVisibilityChipIcon: {
      color: palette.tint,
    },
    roomVisibilityChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    roomTimestamp: {
      color: palette.icon,
      fontSize: 11,
    },
    roomJoinButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    roomJoinButtonDisabled: {
      opacity: 0.7,
    },
    roomJoinButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 13,
    },
  });
}

