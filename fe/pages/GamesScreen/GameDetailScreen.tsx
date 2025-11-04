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
import { InviteCodeDialog } from './InviteCodeDialog';
import { interpretJoinError } from './joinErrorUtils';
import { useTranslation } from '@/lib/i18n';
import { useAppName } from '@/hooks/useAppName';
import { platformShadow } from '@/lib/platformShadow';

type InvitePromptState = {
  visible: boolean;
  room: GameRoomSummary | null;
  mode: 'room' | 'manual';
  loading: boolean;
  error: string | null;
};

export default function GameDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t, locale } = useTranslation();
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
  const [invitePrompt, setInvitePrompt] = useState<InvitePromptState>({
    visible: false,
    room: null,
    mode: 'room',
    loading: false,
    error: null,
  });
  const appName = useAppName();

  const gameId = useMemo(() => {
    const value = params?.id;
    if (Array.isArray(value)) return value[0];
    return value ?? undefined;
  }, [params]);

  const game = useMemo(
    () => (gameId ? getGameById(gameId) : undefined),
    [gameId],
  );
  const isPlayable = Boolean(game?.isPlayable);
  const localizedOverview = useMemo(() => {
    return game?.localizations?.[locale]?.overview ?? game?.overview ?? '';
  }, [game, locale]);
  const localizedSummary = useMemo(() => {
    return game?.localizations?.[locale]?.summary ?? game?.summary ?? '';
  }, [game, locale]);
  const localizedHowToPlay = useMemo(() => {
    return game?.localizations?.[locale]?.howToPlay ?? game?.howToPlay ?? [];
  }, [game, locale]);

  const fetchRooms = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!gameId || !tokens.accessToken) {
        setRooms([]);
        setRoomsError(null);
        return;
      }

      const setLoading =
        mode === 'initial' ? setRoomsLoading : setRoomsRefreshing;
      setLoading(true);

      try {
        const response = await listGameRooms(
          { gameId },
          {
            accessToken: tokens.accessToken,
            refreshTokens,
          },
        );
        setRooms(response.rooms ?? []);
        setRoomsError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('games.errors.loadRooms');
        setRoomsError(message);
      } finally {
        setLoading(false);
      }
    },
    [gameId, refreshTokens, t, tokens.accessToken],
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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rooms]);

  const updateRoomList = useCallback((room: GameRoomSummary) => {
    setRooms((current) => {
      const next = [...current];
      const existingIndex = next.findIndex(
        (existing) => existing.id === room.id,
      );
      if (existingIndex >= 0) {
        next[existingIndex] = room;
        return next;
      }
      return [room, ...next];
    });
  }, []);

  const navigateToRoomScreen = useCallback(
    (nextRoom: GameRoomSummary) => {
      router.push({
        pathname: '/games/rooms/[id]',
        params: {
          id: nextRoom.id,
          gameId: nextRoom.gameId,
          roomName: nextRoom.name,
        },
      });
    },
    [router],
  );

  const showUnavailableAlert = useCallback(() => {
    Alert.alert(
      t('games.create.alerts.gameUnavailableTitle'),
      t('games.create.alerts.gameUnavailableMessage'),
    );
  }, [t]);

  const joinRoom = useCallback(
    async (room: GameRoomSummary, inviteCode?: string) => {
      setJoiningRoomId(room.id);
      if (inviteCode) {
        setInvitePrompt({
          visible: true,
          room,
          mode: 'room',
          loading: true,
          error: null,
        });
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

        setInvitePrompt({
          visible: false,
          room: null,
          mode: 'room',
          loading: false,
          error: null,
        });

        navigateToRoomScreen(response.room);
        void fetchRooms('refresh');
      } catch (error) {
        const { type, message: rawMessage } = interpretJoinError(error);

        if (!inviteCode && type === 'invite-required') {
          setInvitePrompt({
            visible: true,
            room,
            mode: 'room',
            loading: false,
            error: null,
          });
          return;
        }

        if (
          inviteCode &&
          (type === 'invite-required' || type === 'invite-invalid')
        ) {
          setInvitePrompt({
            visible: true,
            room,
            mode: 'room',
            loading: false,
            error:
              type === 'invite-required'
                ? t('games.alerts.inviteRequired')
                : t('games.alerts.inviteInvalid'),
          });
          return;
        }

        if (type === 'room-full') {
          Alert.alert(
            t('games.alerts.roomFullTitle'),
            t('games.alerts.roomFullMessage'),
          );
          return;
        }

        if (type === 'room-locked') {
          Alert.alert(
            t('games.alerts.roomLockedTitle'),
            t('games.alerts.roomLockedMessage'),
          );
          return;
        }

        const fallbackMessage =
          rawMessage && rawMessage !== 'Something went wrong.'
            ? rawMessage
            : t('games.alerts.genericError');
        Alert.alert(t('games.alerts.genericJoinFailedTitle'), fallbackMessage);
      } finally {
        setJoiningRoomId(null);
      }
    },
    [
      fetchRooms,
      navigateToRoomScreen,
      refreshTokens,
      t,
      tokens.accessToken,
      updateRoomList,
    ],
  );

  const handleJoinRoom = useCallback(
    (room: GameRoomSummary) => {
      if (!tokens.accessToken) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInDetailMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.signIn'),
              onPress: () => router.push('/auth' as never),
            },
          ],
        );
        return;
      }

      void joinRoom(room);
    },
    [joinRoom, router, t, tokens.accessToken],
  );

  const handleInviteCancel = useCallback(() => {
    setInvitePrompt({
      visible: false,
      room: null,
      mode: 'room',
      loading: false,
      error: null,
    });
  }, []);

  const handleInviteSubmit = useCallback(
    (code: string) => {
      if (invitePrompt.mode !== 'room' || !invitePrompt.room) {
        return;
      }
      void joinRoom(invitePrompt.room, code);
    },
    [invitePrompt.mode, invitePrompt.room, joinRoom],
  );

  const handleCreateRoom = useCallback(() => {
    if (!game) {
      return;
    }

    if (!game.isPlayable) {
      showUnavailableAlert();
      return;
    }

    router.push({ pathname: '/games/create', params: { gameId: game.id } });
  }, [game, router, showUnavailableAlert]);

  const handleInvite = useCallback(async () => {
    if (!game) return;
    try {
      await Share.share({
        title: t('games.share.title', { game: game.name }),
        message: t('games.share.message', { game: game.name, appName }),
      });
    } catch {
      Alert.alert(
        t('games.alerts.inviteShareFailedTitle'),
        t('games.alerts.inviteShareFailedMessage'),
      );
    }
  }, [appName, game, t]);

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
          <ThemedView style={styles.emptyCard}>
            <IconSymbol
              name="sparkles"
              size={36}
              color={styles.emptyIcon.color as string}
            />
            <ThemedText type="title" style={styles.emptyTitle}>
              {t('games.detail.emptyTitle')}
            </ThemedText>
            <ThemedText style={styles.emptyCopy}>
              {t('games.detail.emptyDescription')}
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  const statusStyle =
    game.status === 'In prototype'
      ? styles.statusPrototype
      : game.status === 'In design'
        ? styles.statusDesign
        : styles.statusRoadmap;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={roomsRefreshing}
            onRefresh={() => fetchRooms('refresh')}
            tintColor={styles.refreshControlTint.color as string}
          />
        }
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
            <IconSymbol
              name="paperplane.fill"
              size={18}
              color={styles.inviteText.color as string}
            />
            <ThemedText style={styles.inviteText}>
              {t('games.detail.inviteButton')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleBlock}>
              <ThemedText type="title" style={styles.title}>
                {game.name}
              </ThemedText>
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
          <ThemedText style={styles.overview}>{localizedOverview}</ThemedText>
          <View style={styles.tagGroup}>
            {game.bestFor.map((item) => (
              <View key={item} style={styles.tagChip}>
                <ThemedText style={styles.tagText}>{item}</ThemedText>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isPlayable && styles.primaryButtonDisabled,
            ]}
            onPress={handleCreateRoom}
            disabled={!isPlayable}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isPlayable }}
          >
            <ThemedText
              style={[
                styles.primaryButtonText,
                !isPlayable && styles.primaryButtonTextDisabled,
              ]}
            >
              {t('games.common.createRoom')}
            </ThemedText>
          </TouchableOpacity>
          {!isPlayable ? (
            <ThemedText style={styles.comingSoonHint}>
              {t('games.create.badgeComingSoon')}
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.roomsCard}>
          <View style={styles.roomsHeader}>
            <ThemedText type="subtitle">
              {t('games.detail.openRoomsTitle')}
            </ThemedText>
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
                  <ThemedText style={styles.roomsRefreshText}>
                    {t('games.detail.refresh')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.roomsCaption}>
            {t('games.detail.openRoomsCaption')}
          </ThemedText>

          {roomsLoading ? (
            <View style={styles.roomsSkeletonRow}>
              <ActivityIndicator
                size="small"
                color={styles.roomsSkeletonSpinner.color as string}
              />
              <ThemedText style={styles.roomsSkeletonText}>
                {t('games.detail.loadingRooms')}
              </ThemedText>
            </View>
          ) : roomsError ? (
            <View style={styles.roomsErrorCard}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={20}
                color={styles.roomsErrorIcon.color as string}
              />
              <View style={styles.roomsErrorCopy}>
                <ThemedText style={styles.roomsErrorTitle}>
                  {t('games.detail.errorTitle')}
                </ThemedText>
                <ThemedText style={styles.roomsErrorText}>
                  {roomsError}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.roomsRetryButton}
                onPress={() => fetchRooms('refresh')}
              >
                <IconSymbol
                  name="arrow.clockwise"
                  size={16}
                  color={styles.roomsRetryText.color as string}
                />
                <ThemedText style={styles.roomsRetryText}>
                  {t('common.retry')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : sortedRooms.length === 0 ? (
            <View style={styles.roomsEmptyState}>
              <IconSymbol
                name="sparkles"
                size={24}
                color={styles.roomsEmptyIcon.color as string}
              />
              <ThemedText style={styles.roomsEmptyTitle}>
                {t('games.detail.emptyRoomsTitle')}
              </ThemedText>
              <ThemedText style={styles.roomsEmptyText}>
                {t('games.detail.emptyRoomsCaption')}
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.roomsEmptyButton,
                  !isPlayable && styles.roomsEmptyButtonDisabled,
                ]}
                onPress={handleCreateRoom}
                disabled={!isPlayable}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isPlayable }}
              >
                <ThemedText
                  style={[
                    styles.roomsEmptyButtonText,
                    !isPlayable && styles.roomsEmptyButtonTextDisabled,
                  ]}
                >
                  {t('games.common.createRoom')}
                </ThemedText>
              </TouchableOpacity>
              {!isPlayable ? (
                <ThemedText style={styles.comingSoonHint}>
                  {t('games.create.badgeComingSoon')}
                </ThemedText>
              ) : null}
            </View>
          ) : (
            sortedRooms.map((room) => {
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
                <ThemedView key={room.id} style={styles.roomCard}>
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
                          <ThemedText style={styles.roomJoinButtonText}>
                            {t('games.common.joinRoom')}
                          </ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              );
            })
          )}
        </ThemedView>

        <Section
          title={t('games.detail.highlightsTitle')}
          description={localizedSummary}
        >
          {game.highlights.map((feature) => (
            <View key={feature.title} style={styles.listItem}>
              <IconSymbol
                name="sparkles"
                size={20}
                color={styles.listIcon.color as string}
              />
              <View style={styles.listCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={styles.listBody}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </Section>

        <Section
          title={t('games.detail.howToPlayTitle')}
          description={t('games.detail.howToPlayCaption')}
        >
          {localizedHowToPlay.map((step) => (
            <View key={step.title} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <ThemedText style={styles.stepBadgeText}>
                  {String(localizedHowToPlay.indexOf(step) + 1).padStart(
                    2,
                    '0',
                  )}
                </ThemedText>
              </View>
              <View style={styles.stepCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText style={styles.listBody}>{step.detail}</ThemedText>
              </View>
            </View>
          ))}
        </Section>

        <Section
          title={t('games.detail.comingSoonTitle')}
          description={t('games.detail.comingSoonCaption')}
        >
          {game.comingSoon.map((item) => (
            <View key={item.title} style={styles.listItem}>
              <IconSymbol
                name="gamecontroller.fill"
                size={20}
                color={styles.listIcon.color as string}
              />
              <View style={styles.listCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.listBody}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </Section>
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

function Section({
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

function MetaChip({
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

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const statusPrototypeBg = isLight ? '#D8F1FF' : '#1D3B48';
  const statusDesignBg = isLight ? '#EDE3FF' : '#2A2542';
  const statusRoadmapBg = isLight ? '#E0F6ED' : '#1F3A32';
  const surfaceShadow = isLight
    ? 'rgba(15, 23, 42, 0.08)'
    : 'rgba(8, 10, 15, 0.45)';
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
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 4,
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
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
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
    primaryButtonDisabled: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 16,
    },
    primaryButtonTextDisabled: {
      opacity: 0.75,
    },
    comingSoonHint: {
      marginTop: 6,
      color: palette.icon,
      fontSize: 12,
      fontStyle: 'italic',
    },
    roomsCard: {
      backgroundColor: cardBackground,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
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
    roomsEmptyButtonDisabled: {
      opacity: 0.45,
    },
    roomsEmptyButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    roomsEmptyButtonTextDisabled: {
      opacity: 0.75,
    },
    roomCard: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 18,
      gap: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 10,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
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
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
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
