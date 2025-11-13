import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';
import {
  ExplodingCatsTable,
  type ExplodingCatsCatComboInput,
  type LogVisibility,
} from '../components/ExplodingCatsTable';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from '../roomUtils';
import {
  startGameRoom,
  type GameRoomSummary,
  type GameSessionSummary,
} from '../api/gamesApi';
import { gameSocket as socket } from '@/hooks/useSocket';
import { useTranslation } from '@/lib/i18n';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import { ExplodingCatsRoomTopBar } from './components/ExplodingCatsRoomTopBar';
import { ExplodingCatsRoomMetaItem as MetaItem } from './components/ExplodingCatsRoomMetaItem';

const BACKGROUND_GRADIENT_COORDS = {
  start: { x: 0.12, y: 0 },
  end: { x: 0.9, y: 1 },
} as const;

const HERO_GRADIENT_COORDS = {
  start: { x: 0.08, y: 0 },
  end: { x: 0.92, y: 1 },
} as const;

export interface ExplodingCatsRoomHandle {
  onSessionSnapshot: () => void;
  onSessionStarted: () => void;
  onCatComboPlayed: () => void;
  onException: () => void;
}

export interface ExplodingCatsRoomProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  fallbackName?: string;
  gameId?: string;
  tokens: SessionTokensSnapshot;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
  insetsTop: number;
  fetchRoom: (mode: 'refresh') => Promise<void>;
  refreshing: boolean;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  deleting: boolean;
  leaving: boolean;
  onDeleteRoom: () => void;
  onLeaveRoom: () => void;
  onViewGame: () => void;
  setRoom: React.Dispatch<React.SetStateAction<GameRoomSummary | null>>;
  setSession: React.Dispatch<React.SetStateAction<GameSessionSummary | null>>;
}

export const ExplodingCatsRoom = forwardRef<
  ExplodingCatsRoomHandle,
  ExplodingCatsRoomProps
>(({ ...props }, ref) => {
  const {
    room,
    session,
    fallbackName,
    gameId,
    tokens,
    refreshTokens,
    insetsTop,
    fetchRoom,
    refreshing,
    loading,
    error,
    isHost,
    deleting,
    leaving,
    onDeleteRoom,
    onLeaveRoom,
    onViewGame,
    setRoom,
    setSession,
  } = props;
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [actionBusy, setActionBusy] = useState<
    'draw' | 'skip' | 'attack' | 'cat_pair' | 'cat_trio' | null
  >(null);
  const [startBusy, setStartBusy] = useState(false);
  const [tableFullScreen, setTableFullScreen] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const backgroundGradientColors = useMemo(
    () => [
      StyleSheet.flatten(styles.backgroundGradientSwatchA).backgroundColor as string,
      StyleSheet.flatten(styles.backgroundGradientSwatchB).backgroundColor as string,
      StyleSheet.flatten(styles.backgroundGradientSwatchC).backgroundColor as string,
    ],
    [styles],
  );

  const heroGradientColors = useMemo(
    () => [
      StyleSheet.flatten(styles.heroGradientSwatchA).backgroundColor as string,
      StyleSheet.flatten(styles.heroGradientSwatchB).backgroundColor as string,
      StyleSheet.flatten(styles.heroGradientSwatchC).backgroundColor as string,
    ],
    [styles],
  );

  const neonBackdrop = useMemo(
    () => (
      <View style={styles.backgroundDecor} pointerEvents="none">
        <LinearGradient
          colors={backgroundGradientColors}
          start={BACKGROUND_GRADIENT_COORDS.start}
          end={BACKGROUND_GRADIENT_COORDS.end}
          style={styles.backgroundGradientLayer}
        />
        <View style={styles.backgroundGlowLayer} />
        <View style={styles.backgroundSparkTop} />
        <View style={styles.backgroundSparkBottom} />
      </View>
    ),
    [backgroundGradientColors, styles],
  );

  const displayName = room?.name ?? fallbackName ?? t('games.room.defaultName');
  const displayGameRaw = room
    ? formatRoomGame(room.gameId)
    : gameId
      ? formatRoomGame(gameId)
      : undefined;
  const displayGame =
    displayGameRaw === 'Unknown game'
      ? t('games.rooms.unknownGame')
      : displayGameRaw;

  const hasSessionSnapshot = useMemo(() => {
    if (!session?.state || typeof session.state !== 'object') {
      return false;
    }
    return Boolean((session.state as Record<string, unknown>).snapshot);
  }, [session]);

  useEffect(() => {
    if (!hasSessionSnapshot) {
      setTableFullScreen(false);
    }
  }, [hasSessionSnapshot]);

  useImperativeHandle(ref, () => ({
    onSessionSnapshot: () => {
      setActionBusy(null);
    },
    onSessionStarted: () => {
      setStartBusy(false);
      setActionBusy(null);
    },
    onCatComboPlayed: () => {
      setActionBusy(null);
    },
    onException: () => {
      setStartBusy(false);
      setActionBusy(null);
    },
  }));

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

  const isLoading = loading && !refreshing;

  const handleStartMatch = useCallback(() => {
    if (!room?.id) {
      return;
    }

    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInStartMatchMessage'),
      );
      return;
    }

    if (!isHost || startBusy) {
      return;
    }

    setStartBusy(true);
    startGameRoom(
      { roomId: room.id, engine: 'exploding_cats_v1' },
      {
        accessToken: tokens.accessToken,
        refreshTokens,
      },
    )
      .then((response) => {
        setRoom(response.room);
        setSession(response.session);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : t('games.alerts.unableToStartMessage');
        Alert.alert(t('games.alerts.unableToStartTitle'), message);
      })
      .finally(() => {
        setStartBusy(false);
      });
  }, [
    isHost,
    refreshTokens,
    room?.id,
    setRoom,
    setSession,
    startBusy,
    t,
    tokens.accessToken,
  ]);

  const handleDrawCard = useCallback(() => {
    if (!room?.id || !tokens.userId) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInTakeTurnMessage'),
      );
      return;
    }

    if (actionBusy) {
      return;
    }

    setActionBusy('draw');
    socket.emit('games.session.draw', {
      roomId: room.id,
      userId: tokens.userId,
    });
  }, [actionBusy, room?.id, t, tokens.userId]);

  const handlePlayCard = useCallback(
    (card: 'skip' | 'attack') => {
      if (!room?.id || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy(card);
      socket.emit('games.session.play_action', {
        roomId: room.id,
        userId: tokens.userId,
        card,
      });
    },
    [actionBusy, room?.id, t, tokens.userId],
  );

  const handlePlayCatCombo = useCallback(
    (input: ExplodingCatsCatComboInput) => {
      if (!room?.id || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInPlayCardMessage'),
        );
        return;
      }

      if (actionBusy) {
        return;
      }

      setActionBusy(input.mode === 'pair' ? 'cat_pair' : 'cat_trio');
      socket.emit('games.session.play_cat_combo', {
        roomId: room.id,
        userId: tokens.userId,
        cat: input.cat,
        mode: input.mode,
        targetPlayerId: input.targetPlayerId,
        desiredCard: input.mode === 'trio' ? input.desiredCard : undefined,
      });
    },
    [actionBusy, room?.id, t, tokens.userId],
  );

  const handlePostHistoryNote = useCallback(
    (message: string, scope: LogVisibility) => {
      if (!room?.id || !tokens.userId) {
        Alert.alert(
          t('games.alerts.signInRequiredTitle'),
          t('games.alerts.signInTakeTurnMessage'),
        );
        return Promise.resolve();
      }

      const trimmed = message.trim();
      if (!trimmed) {
        return Promise.resolve();
      }

      socket.emit('games.session.history_note', {
        roomId: room.id,
        userId: tokens.userId,
        message: trimmed,
        scope,
      });

      return Promise.resolve();
    },
    [room?.id, t, tokens.userId],
  );

  const handleEnterFullScreen = useCallback(() => {
    setTableFullScreen(true);
  }, []);

  const handleExitFullScreen = useCallback(() => {
    setTableFullScreen(false);
  }, []);

  const handleToggleControls = useCallback(() => {
    setControlsCollapsed((prev) => !prev);
  }, []);

  const topBarVariant: 'lobby' | 'table' = hasSessionSnapshot ? 'table' : 'lobby';
  const showLobbyOverview = !hasSessionSnapshot;
  const topBar = (
    <ExplodingCatsRoomTopBar
      variant={topBarVariant}
      controlsCollapsed={controlsCollapsed}
      onToggleControls={handleToggleControls}
      hasSessionSnapshot={hasSessionSnapshot}
      tableFullScreen={tableFullScreen}
      onEnterFullScreen={handleEnterFullScreen}
      onViewGame={onViewGame}
      onDeleteRoom={onDeleteRoom}
      onLeaveRoom={onLeaveRoom}
      deleting={deleting}
      leaving={leaving}
      isHost={isHost}
      room={room}
      gameId={gameId}
      styles={styles}
    />
  );

  if (tableFullScreen && hasSessionSnapshot) {
    return (
      <ThemedView style={styles.fullscreenContainer}>
        {neonBackdrop}
        <View style={styles.fullscreenTableWrapper}>
          <ExplodingCatsTable
            room={room}
            session={session}
            currentUserId={tokens.userId ?? null}
            actionBusy={actionBusy}
            startBusy={startBusy}
            isHost={isHost}
            onStart={handleStartMatch}
            onDraw={handleDrawCard}
            onPlay={handlePlayCard}
            onPlayCatCombo={handlePlayCatCombo}
            onPostHistoryNote={handlePostHistoryNote}
            fullScreen
            tableOnly
          />
        </View>
        <TouchableOpacity
          style={[styles.tableOnlyCloseButton, { top: insetsTop + 16 }]}
          onPress={handleExitFullScreen}
          accessibilityRole="button"
          accessibilityLabel={t('games.room.buttons.exitFullscreen')}
        >
          <IconSymbol
            name="xmark"
            size={18}
            color={styles.tableOnlyCloseIcon.color as string}
          />
          <ThemedText style={styles.tableOnlyCloseText}>
            {t('games.room.buttons.exitFullscreen')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {neonBackdrop}
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRoom('refresh')}
            tintColor={styles.refreshTint.color as string}
          />
        }
      >
        {topBar}

        {showLobbyOverview ? (
          <ThemedView style={styles.headerCard}>
          <LinearGradient
            colors={heroGradientColors}
            start={HERO_GRADIENT_COORDS.start}
            end={HERO_GRADIENT_COORDS.end}
            style={styles.heroGradientLayer}
            pointerEvents="none"
          />
          <View style={styles.heroBackdrop} pointerEvents="none" />
          <View style={styles.heroGlow} pointerEvents="none" />
          <View style={styles.heroGlowSecondary} pointerEvents="none" />
          <View style={styles.heroOrbit} pointerEvents="none" />
          <View style={styles.heroAccentTop} pointerEvents="none" />
          <View style={styles.heroAccentBottom} pointerEvents="none" />
          <View style={styles.headerContent}>
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <IconSymbol
                  name="gamecontroller.fill"
                  size={16}
                  color={styles.heroBadgeIcon.color as string}
                />
                <ThemedText style={styles.heroBadgeText} numberOfLines={1}>
                  {displayGame ?? t('games.rooms.unknownGame')}
                </ThemedText>
              </View>
              <View style={[styles.statusPill, statusStyle]}>
                <ThemedText style={styles.statusText}>
                  {t(getRoomStatusLabel(room?.status ?? 'lobby'))}
                </ThemedText>
              </View>
            </View>

            <View style={styles.heroTitleStack}>
              <ThemedText style={styles.heroTagline} numberOfLines={1}>
                {t('games.room.heroTagline')}
              </ThemedText>
              <View style={styles.heroTitleFrame}>
                <View style={styles.heroTitleGlow} pointerEvents="none" />
                <ThemedText type="title" style={styles.roomTitle} numberOfLines={2}>
                  {displayName}
                </ThemedText>
              </View>
            </View>

            {displayGame ? (
              <ThemedText style={styles.gameLabel}>{displayGame}</ThemedText>
            ) : null}

            <View style={styles.heroDividerRow}>
              <View style={styles.heroDividerDot} />
              <View style={styles.heroDividerLine} />
              <View style={styles.heroDividerDotSecondary} />
            </View>

            {room ? (
              <View style={styles.metaGrid}>
                {(() => {
                  const hostLabelRaw = room.host?.displayName ?? formatRoomHost(room.hostId);
                  const hostValue =
                    hostLabelRaw === 'mystery captain'
                      ? t('games.rooms.mysteryHost')
                      : hostLabelRaw;
                  const baseCapacity = room.maxPlayers
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
                  const playersValue = playerNames
                    ? `${baseCapacity} • ${playerNames}`
                    : baseCapacity;
                  const createdRaw = formatRoomTimestamp(room.createdAt);
                  const createdValue =
                    createdRaw === 'Just created' ? t('games.rooms.justCreated') : createdRaw;
                  const accessValue =
                    room.visibility === 'private'
                      ? t('games.rooms.visibility.private')
                      : t('games.rooms.visibility.public');
                  return (
                    <>
                      <MetaItem
                        icon="person.crop.circle"
                        label={t('games.room.meta.host')}
                        value={hostValue}
                        styles={styles}
                      />
                      <MetaItem
                        icon="person.3.fill"
                        label={t('games.room.meta.players')}
                        value={playersValue}
                        styles={styles}
                      />
                      <MetaItem
                        icon="clock.fill"
                        label={t('games.room.meta.created')}
                        value={t('games.rooms.created', {
                          timestamp: createdValue,
                        })}
                        styles={styles}
                      />
                      <MetaItem
                        icon={room.visibility === 'private' ? 'lock.fill' : 'sparkles'}
                        label={t('games.room.meta.access')}
                        value={accessValue}
                        styles={styles}
                      />
                      {room.inviteCode ? (
                        <MetaItem
                          icon="number"
                          label={t('games.room.meta.inviteCode')}
                          value={room.inviteCode}
                          styles={styles}
                        />
                      ) : null}
                    </>
                  );
                })()}
              </View>
            ) : null}

            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={styles.refreshTint.color as string} />
                <ThemedText style={styles.loadingText}>{t('games.room.loading')}</ThemedText>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorCard}>
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={18}
                  color={styles.errorText.color as string}
                />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}
          </View>
          </ThemedView>
        ) : null}

        {showLobbyOverview ? (
          <ThemedView style={styles.bodyCard}>
            <View style={styles.bodyHeader}>
              <View style={styles.bodyHeaderAccent} />
              <IconSymbol
                name="sparkles"
                size={18}
                color={styles.bodyHeaderText.color as string}
              />
              <ThemedText style={styles.bodyHeaderText}>
                {t('games.room.preparationTitle')}
              </ThemedText>
            </View>
            <ThemedText style={styles.bodyCopy}>
              {t('games.room.preparationCopy')}
            </ThemedText>
          </ThemedView>
        ) : null}

        <ExplodingCatsTable
          room={room}
          session={session}
          currentUserId={tokens.userId ?? null}
          actionBusy={actionBusy}
          startBusy={startBusy}
          isHost={isHost}
          onStart={handleStartMatch}
          onDraw={handleDrawCard}
          onPlay={handlePlayCard}
          onPlayCatCombo={handlePlayCatCombo}
          onPostHistoryNote={handlePostHistoryNote}
          fullScreen={hasSessionSnapshot}
        />

        {showLobbyOverview ? (
          <ThemedView style={styles.footerCard}>
            <View style={styles.footerAccent} />
            <IconSymbol
              name="arrow.clockwise"
              size={18}
              color={styles.footerIcon.color as string}
            />
            <View style={styles.footerCopy}>
              <ThemedText type="subtitle" style={styles.footerTitle}>
                {t('games.room.waitingTitle')}
              </ThemedText>
              <ThemedText style={styles.footerText}>
                {t('games.room.waitingCopy')}
              </ThemedText>
            </View>
          </ThemedView>
  ) : null}
      </ScrollView>
    </ThemedView>
  );
});

ExplodingCatsRoom.displayName = 'ExplodingCatsRoom';

export type ExplodingCatsRoomStyles = ReturnType<typeof createStyles>;

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const {
    gameRoom: {
      raisedBackground,
      border: borderColor,
      surfaceShadow,
      heroBackground,
      heroGlowPrimary,
      heroGlowSecondary,
      topBarSurface,
      topBarBorder,
      heroBadgeBackground,
      heroBadgeBorder,
      heroBadgeIcon: heroBadgeIconColor,
      heroBadgeText: heroBadgeTextColor,
      actionBackground,
      actionBorder,
      statusLobby,
      statusInProgress,
      statusCompleted,
      leaveBackground,
      leaveDisabledBackground,
      leaveTint,
      deleteBackground,
      deleteDisabledBackground,
      deleteTint,
      errorBackground,
      errorBorder,
      errorText,
      backgroundGradient,
      backgroundGlow,
      decorPlay,
      decorCheck,
      decorAlert,
      titleBackground,
      titleBorder,
      titleGlow,
      titleText,
    },
  } = palette;
  const fill = StyleSheet.absoluteFillObject;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      position: 'relative',
    },
    fullscreenContainer: {
      flex: 1,
      backgroundColor: palette.background,
      position: 'relative',
    },
    content: {
      padding: 24,
      gap: 20,
      paddingBottom: 48,
    },
    refreshTint: {
      color: palette.tint,
    },
    backgroundDecor: {
      ...fill,
      zIndex: 0,
    },
    backgroundGradientLayer: {
      ...fill,
      opacity: isLight ? 0.9 : 0.75,
    },
    backgroundGlowLayer: {
      position: 'absolute',
      top: -120,
      right: -80,
      width: 280,
      height: 280,
      borderRadius: 160,
      backgroundColor: backgroundGlow,
    },
    backgroundSparkTop: {
      position: 'absolute',
      top: 140,
      left: -40,
      width: 220,
      height: 220,
      borderRadius: 160,
      backgroundColor: `${decorPlay}1a`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}4d`,
      transform: [{ rotate: '-22deg' }],
    },
    backgroundSparkBottom: {
      position: 'absolute',
      bottom: -80,
      right: -60,
      width: 240,
      height: 240,
      borderRadius: 160,
      backgroundColor: `${decorCheck}12`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}4d`,
      transform: [{ rotate: '18deg' }],
    },
    backgroundGradientSwatchA: {
      backgroundColor: backgroundGradient[0],
    },
    backgroundGradientSwatchB: {
      backgroundColor: backgroundGradient[1],
    },
    backgroundGradientSwatchC: {
      backgroundColor: backgroundGradient[2],
    },
    topBar: {
      width: '100%',
      paddingHorizontal: 24,
      paddingTop: 4,
      paddingBottom: 4,
    },
    fullscreenTopBar: {
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    topBarCard: {
      width: '100%',
      backgroundColor: topBarSurface,
      borderRadius: 24,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: topBarBorder,
      gap: 16,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.9 : 0.7,
        radius: 14,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    topBarCardCollapsed: {
      gap: 12,
      paddingBottom: 12,
    },
    topBarHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'nowrap',
    },
    topBarTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      flexWrap: 'wrap',
    },
    topBarTitleIcon: {
      color: palette.tint,
    },
    topBarTitle: {
      color: palette.icon,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    topBarSubtitle: {
      color: palette.icon,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 2,
      flexShrink: 1,
      maxWidth: '100%',
    },
    controlsToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      flexShrink: 0,
      marginLeft: 'auto',
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 8,
        offset: { width: 0, height: 3 },
        elevation: 2,
      }),
    },
    controlsToggleIcon: {
      color: palette.tint,
    },
    controlsToggleText: {
      color: palette.tint,
      fontSize: 12,
      fontWeight: '600',
    },
    fullscreenTableWrapper: {
      flex: 1,
    },
    actionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 10,
      alignSelf: 'stretch',
      marginTop: 4,
    },
    gameButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.4 : 0.6,
        radius: 10,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    gameButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: leaveBackground,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.5 : 0.7,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    leaveButtonDisabled: {
      backgroundColor: leaveDisabledBackground,
      opacity: 0.7,
    },
    leaveButtonText: {
      color: leaveTint,
      fontWeight: '600',
      fontSize: 13,
    },
    leaveSpinner: {
      color: leaveTint,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: deleteBackground,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.45 : 0.65,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    deleteButtonDisabled: {
      backgroundColor: deleteDisabledBackground,
      opacity: 0.7,
    },
    deleteButtonText: {
      color: deleteTint,
      fontWeight: '600',
      fontSize: 13,
    },
    deleteSpinner: {
      color: deleteTint,
    },
    headerCard: {
      padding: 22,
      borderRadius: 28,
      backgroundColor: heroBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      overflow: 'hidden',
      position: 'relative',
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.9 : 0.65,
        radius: 20,
        offset: { width: 0, height: 8 },
        elevation: 4,
      }),
    },
    heroGradientLayer: {
      ...fill,
      opacity: 0.85,
    },
    heroBackdrop: {
      ...fill,
      backgroundColor: heroBackground,
      opacity: isLight ? 0.92 : 0.88,
    },
    heroGlow: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 180,
      backgroundColor: `${heroGlowPrimary}33`,
      top: -100,
      right: -80,
    },
    heroGlowSecondary: {
      position: 'absolute',
      width: 230,
      height: 230,
      borderRadius: 150,
      backgroundColor: `${heroGlowSecondary}2b`,
      bottom: -90,
      left: -70,
    },
    heroOrbit: {
      position: 'absolute',
      top: 40,
      right: -30,
      width: 160,
      height: 160,
      borderRadius: 120,
      borderWidth: 1.2,
      borderColor: `${decorCheck}66`,
      opacity: 0.6,
      transform: [{ rotate: '14deg' }],
    },
    heroAccentTop: {
      position: 'absolute',
      top: -36,
      left: -40,
      width: 140,
      height: 140,
      borderRadius: 120,
      backgroundColor: `${decorPlay}24`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}66`,
      transform: [{ rotate: '-18deg' }],
    },
    heroAccentBottom: {
      position: 'absolute',
      bottom: -46,
      right: -20,
      width: 170,
      height: 170,
      borderRadius: 150,
      backgroundColor: `${decorAlert}1a`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorAlert}5c`,
      transform: [{ rotate: '12deg' }],
    },
    heroGradientSwatchA: {
      backgroundColor: `${heroGlowSecondary}29`,
    },
    heroGradientSwatchB: {
      backgroundColor: heroBackground,
    },
    heroGradientSwatchC: {
      backgroundColor: `${heroGlowPrimary}2f`,
    },
    headerContent: {
      gap: 18,
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: heroBadgeBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: heroBadgeBorder,
    },
    heroBadgeIcon: {
      color: heroBadgeIconColor,
    },
    heroBadgeText: {
      color: heroBadgeTextColor,
      fontWeight: '700',
      fontSize: 13,
    },
    heroTitleStack: {
      gap: 12,
    },
    heroTagline: {
      color: decorCheck,
      textTransform: 'uppercase',
      fontSize: 12,
      letterSpacing: 1.6,
      fontWeight: '700',
    },
    heroTitleFrame: {
      position: 'relative',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: titleBackground,
      borderWidth: 1.2,
      borderColor: titleBorder,
      overflow: 'hidden',
      ...platformShadow({
        color: titleGlow,
        opacity: isLight ? 0.5 : 0.7,
        radius: 20,
        offset: { width: 0, height: 8 },
        elevation: 4,
      }),
    },
    heroTitleGlow: {
      ...fill,
      backgroundColor: `${titleGlow}1f`,
      opacity: isLight ? 0.9 : 0.75,
    },
    roomTitle: {
      color: titleText,
      fontSize: 28,
      fontWeight: '800',
      lineHeight: 32,
    },
    gameLabel: {
      color: heroBadgeTextColor,
      fontSize: 13,
      fontWeight: '600',
    },
    heroDividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    heroDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: `${heroBadgeBorder}66`,
    },
    heroDividerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: decorPlay,
    },
    heroDividerDotSecondary: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: decorAlert,
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.5,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 1,
      }),
    },
    statusLobby: {
      backgroundColor: statusLobby,
    },
    statusInProgress: {
      backgroundColor: statusInProgress,
    },
    statusCompleted: {
      backgroundColor: statusCompleted,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: '45%',
      padding: 12,
      borderRadius: 16,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.3 : 0.5,
        radius: 8,
        offset: { width: 0, height: 3 },
        elevation: 2,
      }),
    },
    metaItemIcon: {
      color: palette.tint,
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
      backgroundColor: errorBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: errorBorder,
    },
    errorText: {
      color: errorText,
      fontWeight: '600',
    },
    bodyCard: {
      padding: 20,
      borderRadius: 22,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      gap: 14,
      ...platformShadow({
        color: surfaceShadow,
        radius: 12,
        opacity: isLight ? 1 : 0.6,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    bodyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    bodyHeaderAccent: {
      width: 6,
      height: 28,
      borderRadius: 999,
      backgroundColor: decorCheck,
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
      borderRadius: 22,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.55,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    footerAccent: {
      width: 8,
      height: 32,
      borderRadius: 999,
      backgroundColor: decorAlert,
    },
    footerIcon: {
      color: palette.tint,
    },
    footerCopy: {
      flex: 1,
      gap: 4,
    },
    footerTitle: {
      color: palette.text,
    },
    footerText: {
      color: palette.icon,
      lineHeight: 19,
    },
    tableOnlyCloseButton: {
      position: 'absolute',
      left: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.85 : 0.75,
        radius: 12,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    tableOnlyCloseIcon: {
      color: palette.text,
    },
    tableOnlyCloseText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
    },
  });
}
