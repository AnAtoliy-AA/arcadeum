import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ExplodingCatsTable } from '../../components/ExplodingCatsTable';
import { formatRoomGame } from '../../roomUtils';
import { useTranslation } from '@/lib/i18n';
import { ExplodingCatsRoomTopBar } from '../components/ExplodingCatsRoomTopBar';
import {
  createStyles,
  type ExplodingCatsRoomStyles,
} from './ExplodingCatsRoom.styles';
import { useGameActions } from './ExplodingCatsRoom.hooks';
import { NeonBackdrop } from './ExplodingCatsRoom.components';
import { ExplodingCatsLobbyContent } from './ExplodingCatsLobbyContent';
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
  const idleTimerEnabled = room?.gameOptions?.idleTimerEnabled ?? false;

  const {
    handleStartMatch,
    handleDrawCard,
    handlePlayCard,
    handlePlayNope,
    handlePlayFavor,
    handleGiveFavorCard,
    handlePlaySeeTheFuture,
    handlePlayCatCombo,
    handlePlayDefuse,
    handlePostHistoryNote,
    handleReorderParticipants,
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
    () =>
      [
        StyleSheet.flatten(styles.heroGradientSwatchA)
          .backgroundColor as string,
        StyleSheet.flatten(styles.heroGradientSwatchB)
          .backgroundColor as string,
        StyleSheet.flatten(styles.heroGradientSwatchC)
          .backgroundColor as string,
      ] as const,
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
            onPlayNope={handlePlayNope}
            onPlayFavor={handlePlayFavor}
            onGiveFavorCard={handleGiveFavorCard}
            onPlaySeeTheFuture={handlePlaySeeTheFuture}
            onPlayCatCombo={handlePlayCatCombo}
            onPlayDefuse={handlePlayDefuse}
            onPostHistoryNote={handlePostHistoryNote}
            fullScreen
            tableOnly
            roomName={displayName}
            idleTimerEnabled={idleTimerEnabled}
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
      <NestableScrollContainer
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
          <ExplodingCatsLobbyContent
            room={room}
            displayName={displayName}
            displayGame={displayGame}
            heroGradientColors={heroGradientColors}
            statusStyle={statusStyle}
            isLoading={isLoading}
            error={error}
            styles={styles}
            onReorderParticipants={handleReorderParticipants}
            isHost={isHost}
          />
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
          onPlayNope={handlePlayNope}
          onPlayFavor={handlePlayFavor}
          onGiveFavorCard={handleGiveFavorCard}
          onPlaySeeTheFuture={handlePlaySeeTheFuture}
          onPlayCatCombo={handlePlayCatCombo}
          onPlayDefuse={handlePlayDefuse}
          onPostHistoryNote={handlePostHistoryNote}
          fullScreen={hasSessionSnapshot}
          roomName={displayName}
          idleTimerEnabled={idleTimerEnabled}
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
      </NestableScrollContainer>
    </ThemedView>
  );
});

ExplodingCatsRoom.displayName = 'ExplodingCatsRoom';
