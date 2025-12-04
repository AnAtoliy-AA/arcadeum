import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import TexasHoldemTable from '../../components/TexasHoldemTable';
import {
  formatRoomGame,
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from '../../roomUtils';
import { useTranslation } from '@/lib/i18n';
import { ExplodingCatsRoomTopBar } from '../components/ExplodingCatsRoomTopBar';
import { ExplodingCatsRoomMetaItem as MetaItem } from '../components/ExplodingCatsRoomMetaItem';
import {
  BACKGROUND_GRADIENT_COORDS,
  HERO_GRADIENT_COORDS,
} from './TexasHoldemRoom.constants';
import type {
  TexasHoldemRoomHandle,
  TexasHoldemRoomProps,
} from './TexasHoldemRoom.types';
import {
  useTexasHoldemRoomState,
  useTexasHoldemRoomActions,
} from './TexasHoldemRoom.hooks';
import { createStyles, type TexasHoldemRoomStyles } from './TexasHoldemRoom.styles';

export type { TexasHoldemRoomHandle, TexasHoldemRoomProps, TexasHoldemRoomStyles };

export const TexasHoldemRoom = forwardRef<
  TexasHoldemRoomHandle,
  TexasHoldemRoomProps
>(({ ...props }, ref) => {
  const {
    room,
    session,
    gameId,
    tokens,
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
  } = props;

  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const hasSessionSnapshot = useMemo(
    () => Boolean(session?.state),
    [session],
  );

  const {
    startBusy,
    setStartBusy,
    actionBusy,
    setActionBusy,
    tableFullScreen,
    setTableFullScreen,
    controlsCollapsed,
    setControlsCollapsed,
  } = useTexasHoldemRoomState({ hasSessionSnapshot });

  const {
    handleStartMatch,
    handleTexasHoldemAction,
    handlePostHistoryNote,
  } = useTexasHoldemRoomActions({
    room,
    tokens,
    startBusy,
    actionBusy,
    setStartBusy,
    setActionBusy,
    t: t as (key: string, replacements?: Record<string, unknown>) => string,
  });

  const handleEnterFullScreen = useCallback(() => {
    setTableFullScreen(true);
  }, [setTableFullScreen]);

  const handleToggleControls = useCallback(() => {
    setControlsCollapsed((prev) => !prev);
  }, [setControlsCollapsed]);

  useImperativeHandle(
    ref,
    () => ({
      onSessionSnapshot: () => {
        setActionBusy(null);
      },
      onSessionStarted: () => {
        setStartBusy(false);
        setActionBusy(null);
      },
      onHoldemActionPerformed: () => {
        setActionBusy(null);
      },
      onException: () => {
        setStartBusy(false);
        setActionBusy(null);
      },
    }),
    [setActionBusy, setStartBusy],
  );

  const roomStatusStyle = useMemo(() => {
    if (room?.status === 'completed') {
      return styles.statusCompleted;
    }
    if (room?.status === 'in_progress') {
      return styles.statusInProgress;
    }
    return styles.statusLobby;
  }, [room, styles.statusCompleted, styles.statusInProgress, styles.statusLobby]);

  const isLoading = loading && !refreshing;
  const topBarVariant: 'lobby' | 'table' = hasSessionSnapshot ? 'table' : 'lobby';

  return (
    <LinearGradient
      colors={[
        styles.backgroundGradientStart.color as string,
        styles.backgroundGradientEnd.color as string,
      ]}
      {...BACKGROUND_GRADIENT_COORDS}
      style={styles.container}
    >
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchRoom('refresh')} />
        }
      >
        {isLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>
              {t('games.room.loading')}
            </ThemedText>
          </ThemedView>
        )}

        {!isLoading && error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchRoom('refresh')}
            >
              <ThemedText style={styles.retryText}>
                {t('common.retry')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {!isLoading && !error && room && (
          <>
            {/* Room Info Card */}
            <LinearGradient
              colors={[
                styles.heroGradientStart.color as string,
                styles.heroGradientEnd.color as string,
              ]}
              {...HERO_GRADIENT_COORDS}
              style={styles.heroCard}
            >
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, roomStatusStyle]}>
                  <ThemedText style={styles.statusText}>
                    {t(getRoomStatusLabel(room.status))}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <MetaItem
                  icon="person.crop.circle"
                  label={t('games.room.hostLabel')}
                  value={formatRoomHost(room.hostId)}
                  styles={styles}
                />
                <MetaItem
                  icon="gamecontroller"
                  label={t('games.room.gameLabel')}
                  value={formatRoomGame(gameId || room.gameId)}
                  styles={styles}
                />
                <MetaItem
                  icon="clock.fill"
                  label={t('games.room.createdLabel')}
                  value={formatRoomTimestamp(room.createdAt)}
                  styles={styles}
                />
                <MetaItem
                  icon="person.3.fill"
                  label={t('games.room.playersLabel')}
                  value={`${room.playerCount}${
                    room.maxPlayers ? `/${room.maxPlayers}` : ''
                  }`}
                  styles={styles}
                />
              </View>
            </LinearGradient>

            {/* Texas Hold'em Game Table */}
            <View style={styles.gameContainer}>
              <TexasHoldemTable
                room={room}
                session={session}
                currentUserId={tokens.userId ?? null}
                actionBusy={actionBusy}
                startBusy={startBusy}
                isHost={isHost}
                onStart={handleStartMatch}
                onAction={handleTexasHoldemAction}
                onPostHistoryNote={handlePostHistoryNote}
                fullScreen={hasSessionSnapshot}
              />
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
});

TexasHoldemRoom.displayName = 'TexasHoldemRoom';
