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
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ExplodingCatsTable } from '../../components/ExplodingCatsTable';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from '../../roomUtils';
import { useTranslation } from '@/lib/i18n';
import { ExplodingCatsRoomTopBar } from '../components/ExplodingCatsRoomTopBar';
import { ExplodingCatsRoomMetaItem as MetaItem } from '../components/ExplodingCatsRoomMetaItem';
import { HERO_GRADIENT_COORDS } from './ExplodingCatsRoom.constants';
import {
  createStyles,
  type ExplodingCatsRoomStyles,
} from './ExplodingCatsRoom.styles';
import { useGameActions } from './ExplodingCatsRoom.hooks';
import { NeonBackdrop } from './ExplodingCatsRoom.components';
import type {
  ExplodingCatsRoomHandle,
  ExplodingCatsRoomProps,
  ActionBusyType,
} from './ExplodingCatsRoom.types';

export type {
  ExplodingCatsRoomHandle,
  ExplodingCatsRoomProps,
} from './ExplodingCatsRoom.types';
export type { ExplodingCatsRoomStyles };

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
  const [actionBusy, setActionBusy] = useState<ActionBusyType>(null);
  const [startBusy, setStartBusy] = useState(false);
  const [tableFullScreen, setTableFullScreen] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const {
    handleStartMatch,
    handleDrawCard,
    handlePlayCard,
    handlePlayFavor,
    handlePlaySeeTheFuture,
    handlePlayCatCombo,
    handlePostHistoryNote,
  } = useGameActions({
    room,
    tokens,
    refreshTokens,
    isHost,
    actionBusy,
    startBusy,
    setActionBusy,
    setStartBusy,
    setRoom,
    setSession,
  });

  const backgroundGradientColors = useMemo(
    () => [
      StyleSheet.flatten(styles.backgroundGradientSwatchA)
        .backgroundColor as string,
      StyleSheet.flatten(styles.backgroundGradientSwatchB)
        .backgroundColor as string,
      StyleSheet.flatten(styles.backgroundGradientSwatchC)
        .backgroundColor as string,
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
      <NeonBackdrop
        backgroundGradientColors={backgroundGradientColors}
        styles={styles}
      />
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
    // Backend returns state directly, not wrapped in snapshot
    return Boolean(session.state);
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
  }, [
    room,
    styles.statusCompleted,
    styles.statusInProgress,
    styles.statusLobby,
  ]);

  const isLoading = loading && !refreshing;

  const handleEnterFullScreen = useCallback(() => {
    setTableFullScreen(true);
  }, []);

  const handleExitFullScreen = useCallback(() => {
    setTableFullScreen(false);
  }, []);

  const handleToggleControls = useCallback(() => {
    setControlsCollapsed((prev) => !prev);
  }, []);

  const topBarVariant: 'lobby' | 'table' = hasSessionSnapshot
    ? 'table'
    : 'lobby';
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
            onPlayFavor={handlePlayFavor}
            onPlaySeeTheFuture={handlePlaySeeTheFuture}
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
                  <ThemedText
                    type="title"
                    style={styles.roomTitle}
                    numberOfLines={2}
                  >
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
                    const hostLabelRaw =
                      room.host?.displayName ?? formatRoomHost(room.hostId);
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
                      createdRaw === 'Just created'
                        ? t('games.rooms.justCreated')
                        : createdRaw;
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
                          icon={
                            room.visibility === 'private'
                              ? 'lock.fill'
                              : 'sparkles'
                          }
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
                  <ActivityIndicator
                    size="small"
                    color={styles.refreshTint.color as string}
                  />
                  <ThemedText style={styles.loadingText}>
                    {t('games.room.loading')}
                  </ThemedText>
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
          onPlayFavor={handlePlayFavor}
          onPlaySeeTheFuture={handlePlaySeeTheFuture}
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
