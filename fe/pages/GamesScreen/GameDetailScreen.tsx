import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { getGameById } from './catalog';
import { useSessionTokens } from '@/stores/sessionTokens';
import {
  joinGameRoom,
  listGameRooms,
  type GameRoomSummary,
} from './api/gamesApi';
import {
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from './roomUtils';

export default function GameDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
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
  const isFetchingRooms = roomsLoading || roomsRefreshing;

  const gameId = useMemo(() => {
    const value = params?.id;
    if (Array.isArray(value)) return value[0];
    return value ?? undefined;
  }, [params]);

  const game = useMemo(() => (gameId ? getGameById(gameId) : undefined), [gameId]);

  const fetchRooms = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!gameId || !tokens.accessToken) {
        setRooms([]);
        setRoomsError(null);
        return;
      }

      const setLoading = mode === 'initial' ? setRoomsLoading : setRoomsRefreshing;
      setLoading(true);

      try {
        const response = await listGameRooms(gameId, {
          accessToken: tokens.accessToken,
          refreshTokens,
        });
        setRooms(response.rooms ?? []);
        setRoomsError(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load rooms right now.';
        setRoomsError(message);
      } finally {
        setLoading(false);
      }
    },
    [gameId, refreshTokens, tokens.accessToken],
  );

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  useFocusEffect(
    useCallback(() => {
      if (!gameId || !tokens.accessToken) {
        return undefined;
      }
      void fetchRooms('refresh');
      return undefined;
    }, [fetchRooms, gameId, tokens.accessToken]),
  );

  const sortedRooms = useMemo(() => {
    if (!rooms.length) return [];
    return [...rooms].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rooms]);

  const handleJoinRoom = useCallback(
    async (room: GameRoomSummary) => {
      if (!tokens.accessToken) {
        Alert.alert(
          'Sign in required',
          'Log in to grab a seat in this lobby.',
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

      setJoiningRoomId(room.id);
      try {
        const response = await joinGameRoom(
          { roomId: room.id },
          {
            accessToken: tokens.accessToken,
            refreshTokens,
          },
        );

        setRooms((current) =>
          current.map((existing) =>
            existing.id === response.room.id ? response.room : existing,
          ),
        );

        Alert.alert(
          'Joined room',
          'You’re in! The host will start the session when everyone arrives.',
        );
        void fetchRooms('refresh');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to join that room right now.';
        Alert.alert('Couldn’t join room', message);
      } finally {
        setJoiningRoomId(null);
      }
    },
    [fetchRooms, refreshTokens, router, tokens.accessToken],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/games');
    }
  }, [router]);

  const handleCreateRoom = useCallback(() => {
    if (!game) return;
    router.push({ pathname: '/games/create', params: { gameId: game.id } });
  }, [game, router]);

  const handleInvite = useCallback(async () => {
    if (!game) return;
    try {
      await Share.share({
        title: `Join me for ${game.name}`,
        message: `Jump into ${game.name} on AICO. I'll create a room as soon as the prototype opens!`,
      });
    } catch {
      Alert.alert('Invite not sent', 'Copy a link or ping friends manually while we add native invites.');
    }
  }, [game]);

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!game) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name="chevron.left" size={20} color={styles.backText.color as string} />
              <ThemedText style={styles.backText}>Back</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedView style={styles.emptyCard}>
            <IconSymbol name="sparkles" size={36} color={styles.emptyIcon.color as string} />
            <ThemedText type="title" style={styles.emptyTitle}>Game coming soon</ThemedText>
            <ThemedText style={styles.emptyCopy}>
              We couldn&apos;t find that title. Browse the lounge for active prototypes and upcoming releases.
            </ThemedText>
            <TouchableOpacity style={styles.primaryButton} onPress={handleBack}>
              <ThemedText style={styles.primaryButtonText}>Browse games</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  const statusStyle =
    game.status === 'In prototype' ? styles.statusPrototype : game.status === 'In design' ? styles.statusDesign : styles.statusRoadmap;

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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={20} color={styles.backText.color as string} />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
            <IconSymbol name="paperplane.fill" size={18} color={styles.inviteText.color as string} />
            <ThemedText style={styles.inviteText}>Invite friends</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleBlock}>
              <ThemedText type="title" style={styles.title}>{game.name}</ThemedText>
              <ThemedText style={styles.tagline}>{game.tagline}</ThemedText>
            </View>
            <View style={[styles.statusPill, statusStyle]}>
              <ThemedText style={styles.statusText}>{game.status}</ThemedText>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MetaChip label={game.players} icon="person.3.fill" />
            <MetaChip label={game.duration} icon="clock.fill" />
            <MetaChip label={game.mechanics[0]} icon="sparkles" />
          </View>
          <ThemedText style={styles.overview}>{game.overview}</ThemedText>
          <View style={styles.tagGroup}>
            {game.bestFor.map(item => (
              <View key={item} style={styles.tagChip}>
                <ThemedText style={styles.tagText}>{item}</ThemedText>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
            <ThemedText style={styles.primaryButtonText}>Create room</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.roomsCard}>
          <View style={styles.roomsHeader}>
            <ThemedText type="subtitle">Open rooms</ThemedText>
            <TouchableOpacity
              style={styles.roomsRefreshButton}
              onPress={() => fetchRooms('refresh')}
              disabled={isFetchingRooms}
            >
              {isFetchingRooms ? (
                <ActivityIndicator
                  size="small"
                  color={styles.roomsRefreshText.color as string}
                />
              ) : (
                <>
                  <IconSymbol
                    name="arrow.clockwise"
                    size={16}
                    color={styles.roomsRefreshText.color as string}
                  />
                  <ThemedText style={styles.roomsRefreshText}>Refresh</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.roomsCaption}>
            Jump into a live lobby or create your own session if nothing&apos;s open yet.
          </ThemedText>

          {roomsLoading ? (
            <View style={styles.roomsSkeletonRow}>
              <ActivityIndicator
                size="small"
                color={styles.roomsSkeletonSpinner.color as string}
              />
              <ThemedText style={styles.roomsSkeletonText}>Loading rooms…</ThemedText>
            </View>
          ) : roomsError ? (
            <View style={styles.roomsErrorCard}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={20}
                color={styles.roomsErrorIcon.color as string}
              />
              <View style={styles.roomsErrorCopy}>
                <ThemedText style={styles.roomsErrorTitle}>Can&apos;t fetch rooms</ThemedText>
                <ThemedText style={styles.roomsErrorText}>{roomsError}</ThemedText>
              </View>
              <TouchableOpacity style={styles.roomsRetryButton} onPress={() => fetchRooms('refresh')}>
                <IconSymbol
                  name="arrow.clockwise"
                  size={16}
                  color={styles.roomsRetryText.color as string}
                />
                <ThemedText style={styles.roomsRetryText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : sortedRooms.length === 0 ? (
            <View style={styles.roomsEmptyState}>
              <IconSymbol
                name="sparkles"
                size={24}
                color={styles.roomsEmptyIcon.color as string}
              />
              <ThemedText style={styles.roomsEmptyTitle}>Your table could be first</ThemedText>
              <ThemedText style={styles.roomsEmptyText}>
                Kick things off by spinning up a room tailored for this game.
              </ThemedText>
              <TouchableOpacity style={styles.roomsEmptyButton} onPress={handleCreateRoom}>
                <ThemedText style={styles.roomsEmptyButtonText}>Create room</ThemedText>
              </TouchableOpacity>
            </View>
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
        </ThemedView>

        <Section title="Highlights" description={game.summary}>
          {game.highlights.map(feature => (
            <View key={feature.title} style={styles.listItem}>
              <IconSymbol name="sparkles" size={20} color={styles.listIcon.color as string} />
              <View style={styles.listCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>{feature.title}</ThemedText>
                <ThemedText style={styles.listBody}>{feature.description}</ThemedText>
              </View>
            </View>
          ))}
        </Section>

        <Section title="How to play" description="Three quick beats so new players can jump in without a rulebook.">
          {game.howToPlay.map(step => (
            <View key={step.title} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <ThemedText style={styles.stepBadgeText}>{String(game.howToPlay.indexOf(step) + 1).padStart(2, '0')}</ThemedText>
              </View>
              <View style={styles.stepCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>{step.title}</ThemedText>
                <ThemedText style={styles.listBody}>{step.detail}</ThemedText>
              </View>
            </View>
          ))}
        </Section>

        <Section title="What&apos;s next" description="We&apos;re polishing these systems before the public beta drops.">
          {game.comingSoon.map(item => (
            <View key={item.title} style={styles.listItem}>
              <IconSymbol name="gamecontroller.fill" size={20} color={styles.listIcon.color as string} />
              <View style={styles.listCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.listBody}>{item.description}</ThemedText>
              </View>
            </View>
          ))}
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <ThemedView style={styles.sectionCard}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      {description ? <ThemedText style={styles.sectionDescription}>{description}</ThemedText> : null}
      <View style={styles.sectionContent}>{children}</View>
    </ThemedView>
  );
}

function MetaChip({ label, icon }: { label: string; icon: Parameters<typeof IconSymbol>[0]['name'] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaChip}>
      <IconSymbol name={icon} size={16} color={styles.metaChipIcon.color as string} />
      <ThemedText style={styles.metaChipText}>{label}</ThemedText>
    </View>
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
  const roomStatusLobbyBg = isLight ? '#DCFCE7' : '#1D3A28';
  const roomStatusInProgressBg = isLight ? '#FDE68A' : '#42381F';
  const roomStatusCompletedBg = isLight ? '#E2E8F0' : '#2B3038';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 16,
      paddingBottom: 80,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    refreshControlTint: {
      color: palette.tint,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backText: {
      color: palette.tint,
      fontWeight: '600',
    },
    inviteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
    },
    inviteText: {
      color: palette.tint,
      fontWeight: '600',
    },
    heroCard: {
      backgroundColor: cardBackground,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    heroTitleBlock: {
      flex: 1,
      gap: 8,
    },
    title: {
      flexShrink: 1,
    },
    tagline: {
      color: palette.icon,
      fontSize: 16,
      lineHeight: 22,
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
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
      fontWeight: '600',
      fontSize: 12,
      color: palette.text,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
    metaChipIcon: {
      color: palette.tint,
    },
    metaChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    overview: {
      color: palette.text,
      lineHeight: 20,
    },
    tagGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagChip: {
      backgroundColor: raisedBackground,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagText: {
      color: palette.icon,
      fontWeight: '600',
      fontSize: 12,
    },
    primaryButton: {
      marginTop: 4,
      borderRadius: 14,
      backgroundColor: palette.tint,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 16,
    },
    roomsCard: {
      backgroundColor: cardBackground,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    roomsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    roomsRefreshButton: {
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
    roomsRefreshText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    roomsCaption: {
      color: palette.icon,
      lineHeight: 20,
    },
    roomsSkeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomsSkeletonSpinner: {
      color: palette.tint,
    },
    roomsSkeletonText: {
      color: palette.icon,
    },
    roomsErrorCard: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    roomsErrorIcon: {
      color: '#F97316',
    },
    roomsErrorCopy: {
      flex: 1,
      gap: 4,
    },
    roomsErrorTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomsErrorText: {
      color: palette.icon,
    },
    roomsRetryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: cardBackground,
    },
    roomsRetryText: {
      color: palette.tint,
      fontWeight: '600',
    },
    roomsEmptyState: {
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      gap: 12,
      backgroundColor: raisedBackground,
    },
    roomsEmptyIcon: {
      color: palette.tint,
    },
    roomsEmptyTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomsEmptyText: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
    roomsEmptyButton: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    roomsEmptyButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    roomCard: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 18,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 10,
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
      backgroundColor: roomStatusLobbyBg,
    },
    roomStatusInProgress: {
      backgroundColor: roomStatusInProgressBg,
    },
    roomStatusCompleted: {
      backgroundColor: roomStatusCompletedBg,
    },
    roomStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
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
    sectionCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    sectionTitle: {
      color: palette.text,
    },
    sectionDescription: {
      color: palette.icon,
      lineHeight: 20,
    },
    sectionContent: {
      gap: 16,
    },
    listItem: {
      flexDirection: 'row',
      gap: 12,
    },
    listIcon: {
      color: palette.tint,
    },
    listCopy: {
      flex: 1,
      gap: 4,
    },
    listTitle: {
      color: palette.text,
    },
    listBody: {
      color: palette.icon,
      lineHeight: 20,
    },
    stepItem: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    stepBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: raisedBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBadgeText: {
      color: palette.tint,
      fontWeight: '700',
    },
    stepCopy: {
      flex: 1,
      gap: 4,
    },
    emptyCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 24,
      alignItems: 'center',
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    emptyIcon: {
      color: palette.tint,
    },
    emptyTitle: {
      textAlign: 'center',
    },
    emptyCopy: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
