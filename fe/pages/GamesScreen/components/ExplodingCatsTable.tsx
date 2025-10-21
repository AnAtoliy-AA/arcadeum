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
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/messages';
import type {
  GameRoomSummary,
  GameSessionSummary,
} from '../api/gamesApi';
import { getRoomStatusLabel } from '../roomUtils';

const TABLE_DIAMETER = 260;
const PLAYER_SEAT_SIZE = 88;

interface SessionPlayerProfile {
  id: string;
  username?: string;
  email?: string | null;
}

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

function getCardTranslationKey(card: ExplodingCatsCard): TranslationKey {
  switch (card) {
    case 'exploding_cat':
      return 'games.table.cards.explodingCat';
    case 'defuse':
      return 'games.table.cards.defuse';
    case 'attack':
      return 'games.table.cards.attack';
    case 'skip':
      return 'games.table.cards.skip';
    default:
      return 'games.table.cards.generic';
  }
}

function getSessionStatusTranslationKey(status: GameSessionSummary['status'] | undefined | null): TranslationKey {
  switch (status) {
    case 'active':
      return 'games.table.sessionStatus.active';
    case 'completed':
      return 'games.table.sessionStatus.completed';
    case 'waiting':
      return 'games.table.sessionStatus.pending';
    default:
      return 'games.table.sessionStatus.unknown';
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
  const { t } = useTranslation();

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

      const rawPlayers = Array.isArray((session as any)?.state?.players)
        ? ((session as any).state.players as SessionPlayerProfile[])
        : [];
      const lookup = new Map(rawPlayers.map((player) => [player.id, player]));

      return snapshot.playerOrder.map((playerId, index) => {
        const base = snapshot.players.find((player) => player.playerId === playerId);
        const userProfile = lookup.get(playerId);
        return {
          playerId,
          displayName: userProfile?.username || userProfile?.email || playerId,
          hand: base?.hand ?? [],
          alive: base?.alive ?? false,
          isCurrentTurn: index === snapshot.currentTurnIndex,
          handSize: base?.hand?.length ?? 0,
          isSelf: currentUserId ? playerId === currentUserId : false,
          orderIndex: index,
        };
      });
    },
    [snapshot, currentUserId, session],
  );

  const otherPlayers = useMemo(
    () => players.filter((player) => !player.isSelf),
    [players],
  );

  const tableSeats = useMemo(() => {
    if (!otherPlayers.length) {
      return [];
    }

    const total = otherPlayers.length;
    const center = TABLE_DIAMETER / 2;
    const radius = Math.max(center - PLAYER_SEAT_SIZE / 2 - 8, 0);

    return otherPlayers.map((player, index) => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      const left = Math.round(
        center + radius * Math.cos(angle) - PLAYER_SEAT_SIZE / 2,
      );
      const top = Math.round(
        center + radius * Math.sin(angle) - PLAYER_SEAT_SIZE / 2,
      );

      return {
        player,
        position: {
          left,
          top,
        },
      };
    });
  }, [otherPlayers]);

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
  const translateCardName = (card: ExplodingCatsCard) => t(getCardTranslationKey(card));
  const statusLabel = session?.status
    ? t(getSessionStatusTranslationKey(session.status))
    : t(getRoomStatusLabel((room?.status ?? 'lobby') as GameRoomSummary['status']));
  const placeholderText = `${t('games.table.placeholder.waiting')}${isHost ? ` ${t('games.table.placeholder.hostSuffix')}` : ''}`;
  const pendingDrawsLabel = pendingDraws > 0 ? pendingDraws : t('games.table.info.none');
  const pendingDrawsCaption = pendingDraws === 1 ? t('games.table.info.pendingSingular') : t('games.table.info.pendingPlural');

  const tableContent = (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerTitle}>
          <IconSymbol name="rectangle.grid.2x2" size={18} color={styles.headerIcon.color as string} />
          <ThemedText style={styles.headerText}>{t('games.table.headerTitle')}</ThemedText>
        </View>
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
        </View>
      </View>
      {isSessionCompleted ? (
        <View style={styles.messageCard}>
          <IconSymbol name="crown.fill" size={18} color={styles.messageText.color as string} />
          <ThemedText style={styles.messageText}>{t('games.table.messageCompleted')}</ThemedText>
        </View>
      ) : null}

      {snapshot ? (
        <>
          <View style={styles.tableSection}>
            <View style={styles.tableRing}>
              <View style={styles.tableCenter}>
                <View style={styles.tableInfoCard}>
                  <IconSymbol name="rectangle.stack" size={18} color={styles.tableInfoIcon.color as string} />
                  <ThemedText style={styles.tableInfoTitle}>{deckCount}</ThemedText>
                  <ThemedText style={styles.tableInfoSubtitle}>{t('games.table.info.inDeck')}</ThemedText>
                </View>
                <View style={styles.tableInfoCard}>
                  <IconSymbol name="arrow.triangle.2.circlepath" size={18} color={styles.tableInfoIcon.color as string} />
                  <ThemedText style={styles.tableInfoTitle}>
                    {discardTop ? translateCardName(discardTop) : t('games.table.info.empty')}
                  </ThemedText>
                  <ThemedText style={styles.tableInfoSubtitle}>{t('games.table.info.topDiscard')}</ThemedText>
                </View>
                <View style={styles.tableInfoCard}>
                  <IconSymbol name="hourglass" size={18} color={styles.tableInfoIcon.color as string} />
                  <ThemedText style={styles.tableInfoTitle}>
                    {pendingDrawsLabel}
                  </ThemedText>
                  <ThemedText style={styles.tableInfoSubtitle}>
                    {pendingDrawsCaption}
                  </ThemedText>
                </View>
              </View>

              {tableSeats.map((seat) => {
                const isCurrent =
                  seat.player.isCurrentTurn && isSessionActive && !isSessionCompleted;
                const cardsLabel = t(
                  seat.player.handSize === 1
                    ? 'games.table.seats.cardsSingular'
                    : 'games.table.seats.cardsPlural',
                  { count: seat.player.handSize },
                );
                const seatStatusLabel = t(
                  seat.player.alive
                    ? 'games.table.seats.status.alive'
                    : 'games.table.seats.status.out',
                );
                return (
                  <View
                    key={seat.player.playerId}
                    style={[
                      styles.tableSeat,
                      {
                        left: seat.position.left,
                        top: seat.position.top,
                      },
                      isCurrent ? styles.tableSeatCurrent : null,
                      !seat.player.alive ? styles.tableSeatOut : null,
                    ]}
                  >
                    <View style={styles.seatAvatar}>
                      <IconSymbol
                        name="person.circle.fill"
                        size={20}
                        color={styles.seatAvatarIcon.color as string}
                      />
                    </View>
                    <ThemedText style={styles.seatName} numberOfLines={1}>
                      {seat.player.displayName}
                    </ThemedText>
                    <ThemedText style={styles.seatCardCount}>
                      {cardsLabel}
                    </ThemedText>
                    <ThemedText style={styles.seatStatus}>
                      {seatStatusLabel}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>

          {selfPlayer ? (
            <View style={styles.handSection}>
              <View style={styles.handHeader}>
                <IconSymbol name="hand.draw.fill" size={18} color={styles.handTitleIcon.color as string} />
                <ThemedText style={styles.handTitle}>{t('games.table.hand.title')}</ThemedText>
                <View
                  style={[
                    styles.handStatusPill,
                    selfPlayer.alive ? styles.handStatusAlive : styles.handStatusOut,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.handStatusText,
                      selfPlayer.alive ? null : styles.handStatusTextOut,
                    ]}
                  >
                    {t(selfPlayer.alive ? 'games.table.hand.statusAlive' : 'games.table.hand.statusOut')}
                  </ThemedText>
                </View>
              </View>

              {selfPlayer.hand.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.handScrollContent}
                >
                  {selfPlayer.hand.map((card, index) => {
                    const cardKey = `${card}-${index}`;
                    const cardAction = card === 'skip' ? 'skip' : card === 'attack' ? 'attack' : null;
                    const canPlayCard = cardAction === 'skip'
                      ? canPlaySkip
                      : cardAction === 'attack'
                        ? canPlayAttack
                        : false;
                    const isActionBusy = cardAction ? actionBusy === cardAction : false;
                    const actionLabel = cardAction === 'skip'
                      ? t('games.table.actions.playSkip')
                      : cardAction === 'attack'
                        ? t('games.table.actions.playAttack')
                        : null;

                    return (
                      <TouchableOpacity
                        key={cardKey}
                        style={[
                          styles.handCard,
                          cardAction && canPlayCard ? styles.handCardPlayable : null,
                          cardAction && !canPlayCard ? styles.handCardDisabled : null,
                          isActionBusy ? styles.handCardBusy : null,
                        ]}
                        activeOpacity={cardAction && canPlayCard ? 0.8 : 1}
                        onPress={cardAction && canPlayCard && !isActionBusy ? () => onPlay(cardAction) : undefined}
                        disabled={!cardAction || !canPlayCard || isActionBusy}
                        accessibilityRole={cardAction && canPlayCard ? 'button' : 'text'}
                        accessibilityLabel={translateCardName(card)}
                        accessibilityHint={cardAction && canPlayCard ? actionLabel ?? undefined : undefined}
                      >
                        {isActionBusy ? (
                          <ActivityIndicator size="small" color={styles.handCardBusySpinner.color as string} />
                        ) : (
                          <>
                            <ThemedText style={styles.handCardTitle} numberOfLines={2}>
                              {translateCardName(card)}
                            </ThemedText>
                            <ThemedText style={styles.handCardLabel}>{t('games.table.hand.cardLabel')}</ThemedText>
                            {cardAction && canPlayCard && actionLabel ? (
                              <ThemedText style={styles.handCardHint} numberOfLines={1}>
                                {actionLabel}
                              </ThemedText>
                            ) : null}
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.handEmpty}>
                  <ThemedText style={styles.handEmptyText}>{t('games.table.hand.empty')}</ThemedText>
                </View>
              )}

              <View style={styles.handActions}>
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
                        <ThemedText style={styles.primaryButtonText}>{t('games.table.actions.draw')}</ThemedText>
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
                        <ThemedText style={styles.secondaryButtonText}>{t('games.table.actions.playSkip')}</ThemedText>
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
                        <ThemedText style={styles.destructiveButtonText}>{t('games.table.actions.playAttack')}</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>

              {!selfPlayer.alive ? (
                <ThemedText style={styles.eliminatedNote}>{t('games.table.hand.eliminatedNote')}</ThemedText>
              ) : null}
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            {placeholderText}
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
                  <ThemedText style={styles.primaryButtonText}>{t('games.table.actions.start')}</ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {logs.length ? (
        <View style={styles.logsSection}>
          <View style={styles.logsHeader}>
            <IconSymbol name="list.bullet.rectangle" size={16} color={styles.logsHeaderText.color as string} />
            <ThemedText style={styles.logsHeaderText}>{t('games.table.logs.title')}</ThemedText>
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
    playerIcon: isLight ? '#0F172A' : '#F1F5F9',
  } as const;
  const {
    surface,
    raised,
    border,
    shadow,
  playerCurrent,
  destructiveBg,
  destructiveText,
  } = tableTheme;

  const innerDiameter = Math.max(
    TABLE_DIAMETER - PLAYER_SEAT_SIZE - 32,
    140,
  );

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
    tableSection: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    tableRing: {
      width: TABLE_DIAMETER,
      height: TABLE_DIAMETER,
      borderRadius: TABLE_DIAMETER / 2,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 16,
      shadowColor: shadow,
      shadowOpacity: isLight ? 0.25 : 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    tableCenter: {
      width: innerDiameter,
      height: innerDiameter,
      borderRadius: innerDiameter / 2,
      backgroundColor: surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    tableInfoCard: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      minWidth: 110,
    },
    tableInfoIcon: {
      color: palette.tint,
    },
    tableInfoTitle: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 16,
    },
    tableInfoSubtitle: {
      color: palette.icon,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    tableSeat: {
      position: 'absolute',
      width: PLAYER_SEAT_SIZE,
      height: PLAYER_SEAT_SIZE,
      borderRadius: 20,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      gap: 4,
      shadowColor: shadow,
      shadowOpacity: isLight ? 0.2 : 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    tableSeatCurrent: {
      borderColor: palette.tint,
      backgroundColor: playerCurrent,
      shadowOpacity: 0.5,
    },
    tableSeatOut: {
      opacity: 0.45,
    },
    seatAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: raised,
    },
    seatAvatarIcon: {
      color: palette.tint,
    },
    seatName: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
      textAlign: 'center',
    },
    seatCardCount: {
      color: palette.icon,
      fontSize: 12,
    },
    seatStatus: {
      color: palette.icon,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
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
    handSection: {
      gap: 12,
    },
    handHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    handTitleIcon: {
      color: palette.tint,
    },
    handTitle: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 16,
    },
    handStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    handStatusAlive: {
      backgroundColor: '#DCFCE7',
    },
    handStatusOut: {
      backgroundColor: '#FEE2E2',
    },
    handStatusText: {
      color: '#134E4A',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    handStatusTextOut: {
      color: '#991B1B',
    },
    handScrollContent: {
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    handCard: {
      width: 96,
      height: 128,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isLight ? '#FFFFFF' : '#14171C',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      shadowColor: shadow,
      shadowOpacity: isLight ? 0.25 : 0.45,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    handCardPlayable: {
      borderColor: palette.tint,
      shadowOpacity: isLight ? 0.35 : 0.6,
    },
    handCardDisabled: {
      opacity: 0.65,
    },
    handCardBusy: {
      justifyContent: 'center',
    },
    handCardBusySpinner: {
      color: palette.tint,
    },
    handCardTitle: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 13,
      textAlign: 'center',
    },
    handCardLabel: {
      color: palette.icon,
      fontSize: 11,
    },
    handCardHint: {
      color: palette.tint,
      fontSize: 11,
      fontWeight: '600',
    },
    handEmpty: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      backgroundColor: raised,
      alignItems: 'center',
    },
    handEmptyText: {
      color: palette.icon,
      fontSize: 13,
    },
    handActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
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
