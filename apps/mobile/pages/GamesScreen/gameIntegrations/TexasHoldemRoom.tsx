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
import TexasHoldemTable from '../components/TexasHoldemTable';
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

export interface TexasHoldemRoomHandle {
  onSessionSnapshot: () => void;
  onSessionStarted: () => void;
  onHoldemActionPerformed: () => void;
  onException: () => void;
}

export interface TexasHoldemRoomProps {
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

export const TexasHoldemRoom = forwardRef<
  TexasHoldemRoomHandle,
  TexasHoldemRoomProps
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

  const { t } = useTranslation();
  const [startBusy, setStartBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<
    'fold' | 'check' | 'call' | 'raise' | 'all-in' | null
  >(null);
  const [tableFullScreen, setTableFullScreen] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const hasSessionSnapshot = useMemo(
    () => Boolean(session?.state?.snapshot),
    [session],
  );

  useEffect(() => {
    if (!hasSessionSnapshot) {
      setTableFullScreen(false);
    }
  }, [hasSessionSnapshot]);

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
    [],
  );

  const styles = useThemedStyles(createStyles);

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

  const handleStartMatch = useCallback(() => {
    if (!room?.id) {
      return;
    }

    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle' as any),
        t('games.alerts.signInStartMatchMessage' as any),
      );
      return;
    }

    if (startBusy) {
      return;
    }

    setStartBusy(true);
    socket.emit('games.session.start_holdem', {
      roomId: room.id,
      userId: tokens.userId,
      engine: 'texas_holdem_v1',
      startingChips: 1000,
    });
  }, [room?.id, startBusy, t, tokens.accessToken, tokens.userId]);

  const handleTexasHoldemAction = useCallback(
    (action: 'fold' | 'check' | 'call' | 'raise', raiseAmount?: number) => {
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

      setActionBusy(action);
      socket.emit('games.session.holdem_action', {
        roomId: room.id,
        userId: tokens.userId,
        action,
        raiseAmount,
      });
    },
    [actionBusy, room?.id, t, tokens.userId],
  );

  const handlePostHistoryNote = useCallback(
    (message: string, scope: 'all' | 'players') => {
      if (!room?.id || !tokens.userId) {
        return;
      }

      socket.emit('games.session.holdem_history_note', {
        roomId: room.id,
        userId: tokens.userId,
        message,
        scope,
      });
    },
    [room?.id, tokens.userId],
  );

  const handleEnterFullScreen = useCallback(() => {
    setTableFullScreen(true);
  }, []);

  const handleToggleControls = useCallback(() => {
    setControlsCollapsed((prev) => !prev);
  }, []);

  const topBarVariant: 'lobby' | 'table' = hasSessionSnapshot ? 'table' : 'lobby';

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
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
              {t('games.room.loading') || 'Loading room...'}
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
                {t('common.retry') || 'Retry'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {!isLoading && !error && room && (
          <>
            {/* Room Info Card */}
            <LinearGradient
              colors={['#334155', '#475569']}
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
                  label={t('games.room.hostLabel' as any) || 'Host'}
                  value={formatRoomHost(room.hostId)}
                  styles={styles}
                />
                <MetaItem
                  icon="gamecontroller"
                  label={t('games.room.gameLabel' as any) || 'Game'}
                  value={formatRoomGame(gameId || room.gameId)}
                  styles={styles}
                />
                <MetaItem
                  icon="clock.fill"
                  label={t('games.room.createdLabel' as any) || 'Created'}
                  value={formatRoomTimestamp(room.createdAt)}
                  styles={styles}
                />
                <MetaItem
                  icon="person.3.fill"
                  label={t('games.room.playersLabel' as any) || 'Players'}
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

export type TexasHoldemRoomStyles = ReturnType<typeof createStyles>;

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const gameRoom = palette.gameRoom || {};
  const surfaceShadow = gameRoom.surfaceShadow || '#000';
  const topBarSurface = gameRoom.topBarSurface || palette.cardBackground;
  const topBarBorder = gameRoom.topBarBorder || palette.icon + '20';
  const actionBackground = gameRoom.actionBackground || palette.cardBackground;
  const actionBorder = gameRoom.actionBorder || palette.icon + '20';
  const leaveBackground = gameRoom.leaveBackground || '#f59e0b';
  const leaveDisabledBackground = gameRoom.leaveDisabledBackground || '#9ca3af';
  const leaveTint = gameRoom.leaveTint || '#ffffff';
  const deleteBackground = gameRoom.deleteBackground || '#ef4444';
  const deleteDisabledBackground = gameRoom.deleteDisabledBackground || '#9ca3af';
  const deleteTint = gameRoom.deleteTint || '#ffffff';

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: palette.icon,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      color: palette.error,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: palette.tint,
      borderRadius: 8,
    },
    retryText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    heroCard: {
      margin: 16,
      padding: 20,
      borderRadius: 16,
      gap: 16,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.9 : 0.65,
        radius: 20,
        offset: { width: 0, height: 8 },
        elevation: 4,
      }),
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusLobby: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    statusInProgress: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    statusCompleted: {
      backgroundColor: 'rgba(107, 114, 128, 0.2)',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
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
    gameContainer: {
      flex: 1,
    },
    // ExplodingCatsRoomTopBar styles
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
      borderBottomColor: topBarBorder,
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
  });
}
