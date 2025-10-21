import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { formatRoomHost } from '../roomUtils';
import type {
  GameRoomSummary,
  GameSessionSummary,
} from '../api/gamesApi';

export type ExplodingCatsCard =
  | 'exploding_cat'
  | 'defuse'
  | 'attack'
  | 'skip'
  | 'cat';

interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
}

interface ExplodingCatsLogEntry {
  id: string;
  type: 'system' | 'action';
  message: string;
  createdAt: string;
}

interface ExplodingCatsSnapshot {
  deck: ExplodingCatsCard[];
  discardPile: ExplodingCatsCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  players: ExplodingCatsPlayerState[];
  logs: ExplodingCatsLogEntry[];
}

function formatCardName(card: ExplodingCatsCard): string {
  switch (card) {
    case 'exploding_cat':
      return 'Exploding Cat';
    case 'defuse':
      return 'Defuse';
    case 'attack':
      return 'Attack';
    case 'skip':
      return 'Skip';
    default:
      return 'Cat';
  }
}

interface ExplodingCatsTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy: 'draw' | 'skip' | 'attack' | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlay: (card: 'skip' | 'attack') => void;
  fullScreen?: boolean;
}

export function ExplodingCatsTable({
  room,
  session,
  currentUserId,
  actionBusy,
  startBusy,
  isHost,
  onStart,
  onDraw,
  onPlay,
  fullScreen = false,
}: ExplodingCatsTableProps) {
  const styles = useThemedStyles(createStyles);

  const snapshot = useMemo<ExplodingCatsSnapshot | null>(() => {
    const raw = session?.state?.snapshot;
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as ExplodingCatsSnapshot;
  }, [session]);

  const players = useMemo(
    () => {
      if (!snapshot) {
        return [];
      }

      return snapshot.playerOrder.map((playerId, index) => {
        const base = snapshot.players.find((player) => player.playerId === playerId);
        return {
          playerId,
          hand: base?.hand ?? [],
          alive: base?.alive ?? false,
          isCurrentTurn: index === snapshot.currentTurnIndex,
          handSize: base?.hand?.length ?? 0,
          isSelf: currentUserId ? playerId === currentUserId : false,
        };
      });
    },
    [snapshot, currentUserId],
  );

  const selfPlayer = useMemo(
    () => players.find((player) => player.isSelf) ?? null,
    [players],
  );

  const deckCount = snapshot?.deck?.length ?? 0;
  const discardTop = snapshot?.discardPile?.[snapshot.discardPile.length - 1] ?? null;
  const pendingDraws = snapshot?.pendingDraws ?? 0;
  const currentTurnPlayerId = snapshot?.playerOrder?.[snapshot.currentTurnIndex] ?? null;
  const isMyTurn = Boolean(currentUserId && currentTurnPlayerId === currentUserId);
  const hasSkip = (selfPlayer?.hand ?? []).includes('skip');
  const hasAttack = (selfPlayer?.hand ?? []).includes('attack');
  const isSessionActive = session?.status === 'active';
  const isSessionCompleted = session?.status === 'completed';
  const canDraw = isSessionActive && isMyTurn && (selfPlayer?.alive ?? false) && pendingDraws > 0;
  const canPlaySkip = isSessionActive && isMyTurn && hasSkip && (selfPlayer?.alive ?? false);
  const canPlayAttack = isSessionActive && isMyTurn && hasAttack && (selfPlayer?.alive ?? false);
  const canStart = isHost && !isSessionActive && !isSessionCompleted && !snapshot;
  const logs = useMemo(() => (snapshot?.logs ?? []).slice(-12).reverse(), [snapshot]);

  const tableContent = (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerTitle}>
          <IconSymbol name="rectangle.grid.2x2" size={18} color={styles.headerIcon.color as string} />
          <ThemedText style={styles.headerText}>Exploding Cats table</ThemedText>
        </View>
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>{session?.status ? session.status.replace('_', ' ') : room?.status ?? 'lobby'}</ThemedText>
        </View>
      </View>

      {snapshot ? (
        <View style={styles.stateRow}>
          <View style={styles.stateChip}>
            <IconSymbol name="rectangle.stack" size={16} color={styles.stateChipText.color as string} />
            <ThemedText style={styles.stateChipText}>{deckCount} in deck</ThemedText>
          </View>
          <View style={styles.stateChip}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={16} color={styles.stateChipText.color as string} />
            <ThemedText style={styles.stateChipText}>
              {discardTop ? `Top discard: ${formatCardName(discardTop)}` : 'Discard pile empty'}
            </ThemedText>
          </View>
          <View style={styles.stateChip}>
            <IconSymbol name="hourglass" size={16} color={styles.stateChipText.color as string} />
            <ThemedText style={styles.stateChipText}>
              {pendingDraws > 0 ? `${pendingDraws} draw${pendingDraws > 1 ? 's' : ''} pending` : 'No pending draws'}
            </ThemedText>
          </View>
        </View>
      ) : null}

      {isSessionCompleted ? (
        <View style={styles.messageCard}>
          <IconSymbol name="crown.fill" size={18} color={styles.messageText.color as string} />
          <ThemedText style={styles.messageText}>Session completed. Start a new match to play again.</ThemedText>
        </View>
      ) : null}

      {snapshot ? (
        <View style={styles.playersGrid}>
          {players.map((player) => {
            const isCurrent = player.isCurrentTurn && isSessionActive && !isSessionCompleted;
            return (
              <View
                key={player.playerId}
                style={[styles.playerCard, player.isSelf ? styles.playerSelf : null, isCurrent ? styles.playerCurrent : null, !player.alive ? styles.playerEliminated : null]}
              >
                <View style={styles.playerHeader}>
                  <View style={styles.playerNameRow}>
                    <IconSymbol name={player.isSelf ? 'person.circle.fill' : 'person.crop.circle'} size={18} color={styles.playerName.color as string} />
                    <ThemedText style={styles.playerName}>{formatRoomHost(player.playerId)}</ThemedText>
                  </View>
                  <View style={[styles.playerStatusPill, player.alive ? styles.playerAlive : styles.playerOut]}>
                    <ThemedText style={styles.playerStatusText}>{player.alive ? 'Alive' : 'Out'}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.playerDetail}>
                  {player.isSelf
                    ? player.hand.length
                      ? `Your hand: ${player.hand.map((card) => formatCardName(card)).join(', ')}`
                      : 'Your hand is empty'
                    : `${player.handSize} card${player.handSize === 1 ? '' : 's'} in hand`}
                </ThemedText>
                {isCurrent ? (
                  <ThemedText style={styles.turnBadge}>Taking a turn…</ThemedText>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            Waiting for the host to start the interactive tabletop.{isHost ? ' Fire it up when everyone is ready.' : ''}
          </ThemedText>
          {canStart ? (
            <TouchableOpacity
              style={[styles.primaryButton, startBusy ? styles.primaryButtonDisabled : null]}
              onPress={onStart}
              disabled={startBusy}
            >
              {startBusy ? (
                <ActivityIndicator size="small" color={styles.primaryButtonText.color as string} />
              ) : (
                <>
                  <IconSymbol name="play.fill" size={16} color={styles.primaryButtonText.color as string} />
                  <ThemedText style={styles.primaryButtonText}>Start match</ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {snapshot && selfPlayer ? (
        <View style={styles.actionsRow}>
          {canDraw ? (
            <TouchableOpacity
              style={[styles.primaryButton, actionBusy && actionBusy !== 'draw' ? styles.primaryButtonDisabled : null]}
              onPress={onDraw}
              disabled={actionBusy === 'draw'}
            >
              {actionBusy === 'draw' ? (
                <ActivityIndicator size="small" color={styles.primaryButtonText.color as string} />
              ) : (
                <>
                  <IconSymbol name="hand.draw.fill" size={16} color={styles.primaryButtonText.color as string} />
                  <ThemedText style={styles.primaryButtonText}>Draw card</ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {canPlaySkip ? (
            <TouchableOpacity
              style={[styles.secondaryButton, actionBusy && actionBusy !== 'skip' ? styles.secondaryButtonDisabled : null]}
              onPress={() => onPlay('skip')}
              disabled={actionBusy === 'skip'}
            >
              {actionBusy === 'skip' ? (
                <ActivityIndicator size="small" color={styles.secondaryButtonText.color as string} />
              ) : (
                <>
                  <IconSymbol name="figure.walk" size={16} color={styles.secondaryButtonText.color as string} />
                  <ThemedText style={styles.secondaryButtonText}>Play Skip</ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {canPlayAttack ? (
            <TouchableOpacity
              style={[styles.destructiveButton, actionBusy && actionBusy !== 'attack' ? styles.destructiveButtonDisabled : null]}
              onPress={() => onPlay('attack')}
              disabled={actionBusy === 'attack'}
            >
              {actionBusy === 'attack' ? (
                <ActivityIndicator size="small" color={styles.destructiveButtonText.color as string} />
              ) : (
                <>
                  <IconSymbol name="bolt.fill" size={16} color={styles.destructiveButtonText.color as string} />
                  <ThemedText style={styles.destructiveButtonText}>Play Attack</ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {!selfPlayer.alive ? (
            <ThemedText style={styles.eliminatedNote}>You blew up this round. Hang tight for the next match.</ThemedText>
          ) : null}
        </View>
      ) : null}

      {logs.length ? (
        <View style={styles.logsSection}>
          <View style={styles.logsHeader}>
            <IconSymbol name="list.bullet.rectangle" size={16} color={styles.logsHeaderText.color as string} />
            <ThemedText style={styles.logsHeaderText}>Recent turns</ThemedText>
          </View>
          {logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <ThemedText style={styles.logTimestamp}>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
              <ThemedText style={styles.logMessage}>{log.message}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );

  if (fullScreen) {
    return (
      <ThemedView style={[styles.card, styles.cardFullScreen]}>
        <ScrollView
          contentContainerStyle={styles.fullScreenScroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.fullScreenInner}>{tableContent}</View>
        </ScrollView>
      </ThemedView>
    );
  }

  return <ThemedView style={styles.card}>{tableContent}</ThemedView>;
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const tableTheme = palette.gameTable ?? {
    surface: isLight ? '#F6F8FC' : '#1E2229',
    raised: isLight ? '#E7EDF7' : '#262A32',
    border: isLight ? '#D8DFEA' : '#33373E',
    shadow: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(0, 0, 0, 0.45)',
    playerSelf: isLight ? '#ECFEFF' : '#11252A',
    playerCurrent: isLight ? '#FEF3C7' : '#3B2E11',
    destructiveBg: isLight ? '#FEE2E2' : '#3A2020',
    destructiveText: isLight ? '#991B1B' : '#FECACA',
  } as const;
  const { surface, raised, border, shadow, playerSelf, playerCurrent, destructiveBg, destructiveText } = tableTheme;

  return StyleSheet.create({
    card: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      gap: 16,
      shadowColor: shadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardFullScreen: {
      flex: 1,
      borderRadius: 0,
      borderWidth: 0,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
      paddingHorizontal: 24,
      paddingVertical: 24,
      backgroundColor: surface,
      gap: 0,
    },
    fullScreenScroll: {
      flexGrow: 1,
    },
    fullScreenInner: {
      gap: 16,
      paddingBottom: 32,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIcon: {
      color: palette.tint,
    },
    headerText: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 16,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: raised,
    },
    statusText: {
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    stateRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    stateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: raised,
    },
    stateChipText: {
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
    },
    messageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: raised,
    },
    messageText: {
      color: palette.icon,
      fontWeight: '600',
    },
    playersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    playerCard: {
      flexBasis: '48%',
      padding: 14,
      borderRadius: 16,
      backgroundColor: isLight ? '#fff' : '#14171C',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      gap: 8,
    },
    playerSelf: {
      backgroundColor: playerSelf,
    },
    playerCurrent: {
      borderColor: palette.tint,
      backgroundColor: playerCurrent,
    },
    playerEliminated: {
      opacity: 0.55,
    },
    playerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    playerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    playerName: {
      color: palette.text,
      fontWeight: '600',
    },
    playerStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    playerAlive: {
      backgroundColor: '#DCFCE7',
    },
    playerOut: {
      backgroundColor: '#FEE2E2',
    },
    playerStatusText: {
      color: '#134E4A',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    playerDetail: {
      color: palette.icon,
      fontSize: 12,
    },
    turnBadge: {
      color: palette.tint,
      fontWeight: '700',
      fontSize: 12,
    },
    placeholder: {
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: raised,
    },
    placeholderText: {
      color: palette.icon,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: isLight ? '#0F172A' : '#F8FAFC',
      fontWeight: '700',
      fontSize: 13,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: raised,
    },
    secondaryButtonDisabled: {
      opacity: 0.6,
    },
    secondaryButtonText: {
      color: palette.tint,
      fontWeight: '700',
      fontSize: 13,
    },
    destructiveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: destructiveBg,
    },
    destructiveButtonDisabled: {
      opacity: 0.6,
    },
    destructiveButtonText: {
      color: destructiveText,
      fontWeight: '700',
      fontSize: 13,
    },
    eliminatedNote: {
      color: palette.icon,
      fontSize: 12,
      fontStyle: 'italic',
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
    },
    logsSection: {
      gap: 8,
    },
    logsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logsHeaderText: {
      color: palette.icon,
      fontWeight: '600',
    },
    logRow: {
      flexDirection: 'row',
      gap: 10,
    },
    logTimestamp: {
      color: palette.icon,
      fontSize: 11,
      width: 52,
      fontVariant: ['tabular-nums'],
    },
    logMessage: {
      flex: 1,
      color: palette.text,
      fontSize: 12,
    },
  });
}
