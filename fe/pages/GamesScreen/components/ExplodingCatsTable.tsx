import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  ExplodingCatsCard as ExplodingCatsArtwork,
  type CardKey as CardArtworkKey,
} from '@/components/cards';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/messages';
import type { GameRoomSummary, GameSessionSummary } from '../api/gamesApi';
import { getRoomStatusLabel } from '../roomUtils';
import { platformShadow } from '@/lib/platformShadow';

const TABLE_DIAMETER = 230;
const PLAYER_SEAT_SIZE = 88;
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

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
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

export type ExplodingCatsCatCard =
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

export const CAT_COMBO_CARDS: ExplodingCatsCatCard[] = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
];

const DESIRED_CARD_OPTIONS: ExplodingCatsCard[] = [
  'exploding_cat',
  'defuse',
  'attack',
  'skip',
  ...CAT_COMBO_CARDS,
];

type CardArtworkVariant = 1 | 2 | 3;

const CARD_ART_SETTINGS: Record<
  ExplodingCatsCard,
  { key: CardArtworkKey; variant: CardArtworkVariant }
> = {
  exploding_cat: { key: 'exploding-cat', variant: 1 },
  defuse: { key: 'defuse', variant: 2 },
  attack: { key: 'attack', variant: 1 },
  skip: { key: 'skip', variant: 2 },
  tacocat: { key: 'tacocat', variant: 1 },
  hairy_potato_cat: { key: 'hairy-potato-cat', variant: 2 },
  rainbow_ralphing_cat: { key: 'rainbow-ralphing-cat', variant: 2 },
  cattermelon: { key: 'cattermelon', variant: 1 },
  bearded_cat: { key: 'bearded-cat', variant: 3 },
};

export type ExplodingCatsCatComboInput =
  | {
      cat: ExplodingCatsCatCard;
      mode: 'pair';
      targetPlayerId: string;
    }
  | {
      cat: ExplodingCatsCatCard;
      mode: 'trio';
      targetPlayerId: string;
      desiredCard: ExplodingCatsCard;
    };

interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
}

export type LogVisibility = 'all' | 'players';

interface ExplodingCatsLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: LogVisibility;
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

interface CatComboPromptState {
  cat: ExplodingCatsCatCard;
  mode: 'pair' | 'trio' | null;
  targetPlayerId: string | null;
  desiredCard: ExplodingCatsCard | null;
  available: {
    pair: boolean;
    trio: boolean;
  };
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
    case 'tacocat':
      return 'games.table.cards.tacocat';
    case 'hairy_potato_cat':
      return 'games.table.cards.hairyPotatoCat';
    case 'rainbow_ralphing_cat':
      return 'games.table.cards.rainbowRalphingCat';
    case 'cattermelon':
      return 'games.table.cards.cattermelon';
    case 'bearded_cat':
      return 'games.table.cards.beardedCat';
    default:
      return 'games.table.cards.generic';
  }
}

function getCardDescriptionKey(card: ExplodingCatsCard): TranslationKey {
  switch (card) {
    case 'exploding_cat':
      return 'games.table.cardDescriptions.explodingCat';
    case 'defuse':
      return 'games.table.cardDescriptions.defuse';
    case 'attack':
      return 'games.table.cardDescriptions.attack';
    case 'skip':
      return 'games.table.cardDescriptions.skip';
    case 'tacocat':
      return 'games.table.cardDescriptions.tacocat';
    case 'hairy_potato_cat':
      return 'games.table.cardDescriptions.hairyPotatoCat';
    case 'rainbow_ralphing_cat':
      return 'games.table.cardDescriptions.rainbowRalphingCat';
    case 'cattermelon':
      return 'games.table.cardDescriptions.cattermelon';
    case 'bearded_cat':
      return 'games.table.cardDescriptions.beardedCat';
    default:
      return 'games.table.cardDescriptions.generic';
  }
}

function getSessionStatusTranslationKey(
  status: GameSessionSummary['status'] | undefined | null,
): TranslationKey {
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
  actionBusy: 'draw' | 'skip' | 'attack' | 'cat_pair' | 'cat_trio' | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlay: (card: 'skip' | 'attack') => void;
  onPlayCatCombo: (payload: ExplodingCatsCatComboInput) => void;
  onPostHistoryNote?: (
    message: string,
    scope: LogVisibility,
  ) => Promise<void> | void;
  fullScreen?: boolean;
  tableOnly?: boolean;
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
  onPlayCatCombo,
  onPostHistoryNote,
  fullScreen = false,
  tableOnly = false,
}: ExplodingCatsTableProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const showHeader = !tableOnly;
  const showStats = !tableOnly;
  const showHandHeader = !tableOnly;
  const showLogs = true;
  const cardPressScale = useRef(new Animated.Value(1)).current;
  const deckPulseScale = useRef(new Animated.Value(1)).current;
  const [animatingCardKey, setAnimatingCardKey] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [messageVisibility, setMessageVisibility] =
    useState<LogVisibility>('all');
  const [historySending, setHistorySending] = useState(false);

  const snapshot = useMemo<ExplodingCatsSnapshot | null>(() => {
    const raw = session?.state?.snapshot;
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as ExplodingCatsSnapshot;
  }, [session]);

  const players = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    const rawPlayers = Array.isArray((session as any)?.state?.players)
      ? ((session as any).state.players as SessionPlayerProfile[])
      : [];
    const lookup = new Map(rawPlayers.map((player) => [player.id, player]));

    return snapshot.playerOrder.map((playerId, index) => {
      const base = snapshot.players.find(
        (player) => player.playerId === playerId,
      );
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
  }, [snapshot, currentUserId, session]);

  const otherPlayers = useMemo(
    () => players.filter((player) => !player.isSelf),
    [players],
  );

  const playerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    players.forEach((player) => {
      map.set(player.playerId, player.displayName);
    });
    return map;
  }, [players]);

  const tableSeats = useMemo(() => {
    if (!otherPlayers.length) {
      return [];
    }

    const total = otherPlayers.length;
    const center = TABLE_DIAMETER / 2;
    const radius = Math.max(center + PLAYER_SEAT_SIZE / 2 - 12, 0);

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
  const discardTop =
    snapshot?.discardPile?.[snapshot.discardPile.length - 1] ?? null;
  const discardArt = discardTop
    ? (CARD_ART_SETTINGS[discardTop] ?? CARD_ART_SETTINGS.exploding_cat)
    : null;
  const discardArtVariant: CardArtworkVariant = discardArt
    ? discardArt.variant
    : 1;
  const pendingDraws = snapshot?.pendingDraws ?? 0;
  const currentTurnPlayerId =
    snapshot?.playerOrder?.[snapshot.currentTurnIndex] ?? null;
  const isMyTurn = Boolean(
    currentUserId && currentTurnPlayerId === currentUserId,
  );
  const hasSkip = (selfPlayer?.hand ?? []).includes('skip');
  const hasAttack = (selfPlayer?.hand ?? []).includes('attack');
  const isSessionActive = session?.status === 'active';
  const isSessionCompleted = session?.status === 'completed';
  const canDraw =
    isSessionActive &&
    isMyTurn &&
    (selfPlayer?.alive ?? false) &&
    pendingDraws > 0;
  const canPlaySkip =
    isSessionActive && isMyTurn && hasSkip && (selfPlayer?.alive ?? false);
  const canPlayAttack =
    isSessionActive && isMyTurn && hasAttack && (selfPlayer?.alive ?? false);
  const canStart =
    isHost && !isSessionActive && !isSessionCompleted && !snapshot;
  const isCurrentUserPlayer = Boolean(selfPlayer);
  const logs = useMemo(() => {
    const source = snapshot?.logs ?? [];
    const filtered = source.filter(
      (entry) => entry.scope !== 'players' || isCurrentUserPlayer,
    );
    const ordered = [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });
    return ordered.slice(-20).reverse();
  }, [snapshot, isCurrentUserPlayer]);
  const translateCardName = (card: ExplodingCatsCard) =>
    t(getCardTranslationKey(card));
  const translateCardDescription = (card: ExplodingCatsCard) =>
    t(getCardDescriptionKey(card));
  const statusLabel = session?.status
    ? t(getSessionStatusTranslationKey(session.status))
    : t(
        getRoomStatusLabel(
          (room?.status ?? 'lobby') as GameRoomSummary['status'],
        ),
      );
  const placeholderText = `${t('games.table.placeholder.waiting')}${isHost ? ` ${t('games.table.placeholder.hostSuffix')}` : ''}`;
  const pendingDrawsLabel =
    pendingDraws > 0 ? pendingDraws : t('games.table.info.none');
  const pendingDrawsCaption =
    pendingDraws === 1
      ? t('games.table.info.pendingSingular')
      : t('games.table.info.pendingPlural');
  const trimmedMessage = messageDraft.trim();
  const canSendHistoryMessage =
    isCurrentUserPlayer && trimmedMessage.length > 0;
  const formatLogMessage = useCallback(
    (message: string) => {
      if (!message) {
        return message;
      }
      let next = message;
      playerNameMap.forEach((displayName, playerId) => {
        if (playerId && displayName && playerId !== displayName) {
          next = next.split(playerId).join(displayName);
        }
      });
      return next;
    },
    [playerNameMap],
  );

  const aliveOpponents = useMemo(
    () => otherPlayers.filter((player) => player.alive),
    [otherPlayers],
  );

  const catCardCounts = useMemo(() => {
    const counts: Record<ExplodingCatsCatCard, number> = {
      tacocat: 0,
      hairy_potato_cat: 0,
      rainbow_ralphing_cat: 0,
      cattermelon: 0,
      bearded_cat: 0,
    };

    if (selfPlayer?.hand?.length) {
      selfPlayer.hand.forEach((card) => {
        if (CAT_COMBO_CARDS.includes(card as ExplodingCatsCatCard)) {
          const catCard = card as ExplodingCatsCatCard;
          counts[catCard] = (counts[catCard] ?? 0) + 1;
        }
      });
    }

    return counts;
  }, [selfPlayer?.hand]);

  const catComboAvailability = useMemo(() => {
    const availability: Record<
      ExplodingCatsCatCard,
      { pair: boolean; trio: boolean }
    > = {
      tacocat: { pair: false, trio: false },
      hairy_potato_cat: { pair: false, trio: false },
      rainbow_ralphing_cat: { pair: false, trio: false },
      cattermelon: { pair: false, trio: false },
      bearded_cat: { pair: false, trio: false },
    };

    CAT_COMBO_CARDS.forEach((cat) => {
      const count = catCardCounts[cat] ?? 0;
      availability[cat] = {
        pair: count >= 2 && aliveOpponents.length > 0,
        trio: count >= 3 && aliveOpponents.length > 0,
      };
    });

    return availability;
  }, [catCardCounts, aliveOpponents]);

  const [catComboPrompt, setCatComboPrompt] =
    useState<CatComboPromptState | null>(null);
  const catComboBusy = actionBusy === 'cat_pair' || actionBusy === 'cat_trio';

  useEffect(() => {
    setMessageDraft('');
    setMessageVisibility('all');
    setHistorySending(false);
  }, [session?.id]);

  const closeCatComboPrompt = useCallback(() => {
    setCatComboPrompt(null);
  }, []);

  const openCatComboPrompt = useCallback(
    (cat: ExplodingCatsCatCard) => {
      const availability = catComboAvailability[cat];
      if (!availability || (!availability.pair && !availability.trio)) {
        return;
      }

      const preferredMode = availability.pair ? 'pair' : 'trio';
      const defaultTarget = aliveOpponents[0]?.playerId ?? null;
      const defaultDesired = availability.trio ? 'defuse' : null;

      if (!defaultTarget) {
        return;
      }

      setCatComboPrompt({
        cat,
        mode: preferredMode,
        targetPlayerId: defaultTarget,
        desiredCard: preferredMode === 'trio' ? defaultDesired : null,
        available: availability,
      });
    },
    [aliveOpponents, catComboAvailability],
  );

  const handleSendHistoryNote = useCallback(async () => {
    if (!canSendHistoryMessage || historySending) {
      return;
    }

    if (!onPostHistoryNote) {
      setMessageDraft('');
      return;
    }

    setHistorySending(true);
    try {
      await onPostHistoryNote(trimmedMessage, messageVisibility);
      setMessageDraft('');
    } finally {
      setHistorySending(false);
    }
  }, [
    canSendHistoryMessage,
    historySending,
    onPostHistoryNote,
    trimmedMessage,
    messageVisibility,
  ]);

  const toggleMessageVisibility = useCallback(() => {
    setMessageVisibility((prev) => (prev === 'all' ? 'players' : 'all'));
  }, []);

  const handleCatComboModeChange = useCallback(
    (mode: 'pair' | 'trio') => {
      setCatComboPrompt((prev) => {
        if (!prev || !prev.available[mode]) {
          return prev;
        }
        const nextTarget =
          prev.targetPlayerId ?? aliveOpponents[0]?.playerId ?? null;
        const nextDesired =
          mode === 'trio' ? (prev.desiredCard ?? 'defuse') : null;
        return {
          ...prev,
          mode,
          targetPlayerId: nextTarget,
          desiredCard: nextDesired,
        };
      });
    },
    [aliveOpponents],
  );

  const handleCatComboTargetChange = useCallback((playerId: string) => {
    setCatComboPrompt((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        targetPlayerId: playerId,
      };
    });
  }, []);

  const handleCatComboDesiredCardChange = useCallback(
    (card: ExplodingCatsCard) => {
      setCatComboPrompt((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          desiredCard: card,
        };
      });
    },
    [],
  );

  const handleConfirmCatCombo = useCallback(() => {
    if (!catComboPrompt || !catComboPrompt.mode) {
      return;
    }

    if (!catComboPrompt.targetPlayerId) {
      return;
    }

    if (catComboPrompt.mode === 'pair') {
      onPlayCatCombo({
        cat: catComboPrompt.cat,
        mode: 'pair',
        targetPlayerId: catComboPrompt.targetPlayerId,
      });
      setCatComboPrompt(null);
      return;
    }

    if (!catComboPrompt.desiredCard) {
      return;
    }

    onPlayCatCombo({
      cat: catComboPrompt.cat,
      mode: 'trio',
      targetPlayerId: catComboPrompt.targetPlayerId,
      desiredCard: catComboPrompt.desiredCard,
    });
    setCatComboPrompt(null);
  }, [catComboPrompt, onPlayCatCombo]);

  const comboConfirmDisabled = !catComboPrompt
    ? true
    : catComboBusy ||
      !catComboPrompt.mode ||
      !catComboPrompt.targetPlayerId ||
      (catComboPrompt.mode === 'trio' && !catComboPrompt.desiredCard);

  const triggerCardAnimation = useCallback(
    (key: string, onComplete: () => void) => {
      setAnimatingCardKey(key);
      cardPressScale.setValue(1);
      Animated.sequence([
        Animated.timing(cardPressScale, {
          toValue: 0.92,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardPressScale, {
          toValue: 1.06,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardPressScale, {
          toValue: 1,
          duration: 140,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimatingCardKey(null);
        onComplete();
      });
    },
    [cardPressScale],
  );

  useEffect(() => {
    if (actionBusy === 'draw') {
      deckPulseScale.setValue(1);
      Animated.sequence([
        Animated.timing(deckPulseScale, {
          toValue: 1.1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(deckPulseScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [actionBusy, deckPulseScale]);

  const tableContent = (
    <>
      {showHeader ? (
        <>
          <View style={styles.headerRow}>
            <View style={styles.headerTitle}>
              <IconSymbol
                name="rectangle.grid.2x2"
                size={18}
                color={styles.headerIcon.color as string}
              />
              <ThemedText style={styles.headerText}>
                {t('games.table.headerTitle')}
              </ThemedText>
            </View>
            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
            </View>
          </View>
          {isSessionCompleted ? (
            <View style={styles.messageCard}>
              <IconSymbol
                name="crown.fill"
                size={18}
                color={styles.messageText.color as string}
              />
              <ThemedText style={styles.messageText}>
                {t('games.table.messageCompleted')}
              </ThemedText>
            </View>
          ) : null}
        </>
      ) : null}

      {snapshot ? (
        <>
          <View style={styles.tableSection}>
            <View style={styles.tableRing}>
              <View style={styles.tableCenter}>
                <View
                  style={[
                    styles.tableInfoCard,
                    discardTop ? styles.tableInfoCardWithArtwork : null,
                  ]}
                >
                  {discardTop && discardArt ? (
                    <View style={styles.tableInfoArtwork}>
                      <ExplodingCatsArtwork
                        card={discardArt.key}
                        variant={discardArtVariant}
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid slice"
                        accessible={false}
                        focusable={false}
                      />
                    </View>
                  ) : (
                    <IconSymbol
                      name="arrow.triangle.2.circlepath"
                      size={18}
                      color={styles.tableInfoIcon.color as string}
                    />
                  )}
                  <ThemedText style={styles.tableInfoTitle}>
                    {discardTop
                      ? translateCardName(discardTop)
                      : t('games.table.info.empty')}
                  </ThemedText>
                </View>
              </View>

              {tableSeats.map((seat) => {
                const isCurrent =
                  seat.player.isCurrentTurn &&
                  isSessionActive &&
                  !isSessionCompleted;
                return (
                  <View
                    key={seat.player.playerId}
                    style={{
                      position: 'absolute',
                      left: seat.position.left,
                      top: seat.position.top,
                    }}
                  >
                    <View
                      style={[
                        styles.tableSeatRow,
                        isCurrent ? styles.tableSeatRowCurrent : null,
                        !seat.player.alive ? styles.tableSeatRowOut : null,
                      ]}
                    >
                      <View style={styles.seatAvatarColumn}>
                        <View style={styles.seatAvatar}>
                          <IconSymbol
                            name="person.circle.fill"
                            size={28}
                            color={styles.seatAvatarIcon.color as string}
                          />
                          <View
                            style={[
                              styles.seatStatusDot,
                              seat.player.alive
                                ? styles.seatStatusDotAlive
                                : styles.seatStatusDotOut,
                            ]}
                          />
                        </View>
                        <ThemedText style={styles.seatName} numberOfLines={1}>
                          {seat.player.displayName}
                        </ThemedText>
                        <View style={styles.seatCardStrip}>
                          {Array.from({
                            length: Math.min(seat.player.handSize, 6),
                          }).map((_, cardIndex) => (
                            <View
                              key={cardIndex}
                              style={[
                                styles.seatCardBack,
                                cardIndex > 0
                                  ? styles.seatCardBackStacked
                                  : null,
                              ]}
                            />
                          ))}
                          <ThemedText style={styles.seatCardCount}>
                            {seat.player.handSize}
                            {seat.player.handSize > 6 ? '+' : ''}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            {showStats ? (
              <View style={styles.tableStatsRow}>
                <Animated.View
                  style={[
                    styles.tableStatCard,
                    { transform: [{ scale: deckPulseScale }] },
                  ]}
                >
                  <IconSymbol
                    name="rectangle.stack"
                    size={18}
                    color={styles.tableStatIcon.color as string}
                  />
                  <View style={styles.tableStatTextGroup}>
                    <ThemedText style={styles.tableStatTitle}>
                      {deckCount}
                    </ThemedText>
                    <ThemedText style={styles.tableStatSubtitle}>
                      {t('games.table.info.inDeck')}
                    </ThemedText>
                  </View>
                </Animated.View>
                <View style={styles.tableStatCard}>
                  <IconSymbol
                    name="hourglass"
                    size={18}
                    color={styles.tableStatIcon.color as string}
                  />
                  <View style={styles.tableStatTextGroup}>
                    <ThemedText style={styles.tableStatTitle}>
                      {pendingDrawsLabel}
                    </ThemedText>
                    <ThemedText style={styles.tableStatSubtitle}>
                      {pendingDrawsCaption}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ) : null}
          </View>

          {selfPlayer ? (
            <View style={styles.handSection}>
              {showHandHeader ? (
                <View style={styles.handHeader}>
                  <IconSymbol
                    name="hand.draw.fill"
                    size={18}
                    color={styles.handTitleIcon.color as string}
                  />
                  <ThemedText style={styles.handTitle}>
                    {t('games.table.hand.title')}
                  </ThemedText>
                  <View
                    style={[
                      styles.handStatusPill,
                      selfPlayer.alive
                        ? styles.handStatusAlive
                        : styles.handStatusOut,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.handStatusText,
                        selfPlayer.alive ? null : styles.handStatusTextOut,
                      ]}
                    >
                      {t(
                        selfPlayer.alive
                          ? 'games.table.hand.statusAlive'
                          : 'games.table.hand.statusOut',
                      )}
                    </ThemedText>
                  </View>
                </View>
              ) : null}

              {selfPlayer.hand.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.handScrollContent}
                >
                  {selfPlayer.hand.map((card, index) => {
                    const cardKey = `${card}-${index}`;
                    const cardAction: 'skip' | 'attack' | null =
                      card === 'skip'
                        ? 'skip'
                        : card === 'attack'
                          ? 'attack'
                          : null;
                    const isCatCard = CAT_COMBO_CARDS.includes(
                      card as ExplodingCatsCatCard,
                    );
                    const comboAvailability = isCatCard
                      ? catComboAvailability[card as ExplodingCatsCatCard]
                      : null;
                    const canPlayCatCombo = Boolean(
                      isCatCard &&
                        comboAvailability &&
                        (comboAvailability.pair || comboAvailability.trio) &&
                        isSessionActive &&
                        isMyTurn &&
                        (selfPlayer?.alive ?? false),
                    );
                    const canPlayCard =
                      cardAction === 'skip'
                        ? canPlaySkip
                        : cardAction === 'attack'
                          ? canPlayAttack
                          : canPlayCatCombo;
                    const isActionBusy = cardAction
                      ? actionBusy === cardAction
                      : isCatCard
                        ? catComboBusy
                        : false;
                    const actionLabel =
                      cardAction === 'skip'
                        ? t('games.table.actions.playSkip')
                        : cardAction === 'attack'
                          ? t('games.table.actions.playAttack')
                          : isCatCard && canPlayCatCombo
                            ? t('games.table.actions.playCatCombo')
                            : null;
                    const comboHint =
                      isCatCard && comboAvailability
                        ? comboAvailability.pair && comboAvailability.trio
                          ? t('games.table.catCombo.optionPairOrTrio')
                          : comboAvailability.trio
                            ? t('games.table.catCombo.optionTrio')
                            : comboAvailability.pair
                              ? t('games.table.catCombo.optionPair')
                              : null
                        : null;
                    const artConfig =
                      CARD_ART_SETTINGS[card] ??
                      CARD_ART_SETTINGS.exploding_cat;
                    const baseVariant = artConfig.variant;
                    const artVariant = (((baseVariant - 1 + index) % 3) +
                      1) as CardArtworkVariant;
                    const description = translateCardDescription(card);

                    const isAnimatingThisCard = animatingCardKey === cardKey;
                    const isDisabled =
                      !canPlayCard || isActionBusy || animatingCardKey !== null;

                    const runCardAction = () => {
                      if (cardAction) {
                        onPlay(cardAction);
                      } else if (isCatCard) {
                        openCatComboPrompt(card as ExplodingCatsCatCard);
                      }
                    };

                    const handleCardPress = () => {
                      if (
                        !canPlayCard ||
                        isActionBusy ||
                        animatingCardKey !== null
                      ) {
                        return;
                      }
                      triggerCardAnimation(cardKey, runCardAction);
                    };

                    return (
                      <AnimatedTouchableOpacity
                        key={cardKey}
                        style={[
                          styles.handCard,
                          canPlayCard ? styles.handCardPlayable : null,
                          !canPlayCard ? styles.handCardDisabled : null,
                          isActionBusy ? styles.handCardBusy : null,
                          isAnimatingThisCard
                            ? { transform: [{ scale: cardPressScale }] }
                            : null,
                        ]}
                        activeOpacity={canPlayCard ? 0.8 : 1}
                        onPress={handleCardPress}
                        disabled={isDisabled}
                        accessibilityRole={canPlayCard ? 'button' : 'text'}
                        accessibilityLabel={translateCardName(card)}
                        accessibilityHint={
                          canPlayCard && actionLabel ? actionLabel : undefined
                        }
                      >
                        {isActionBusy ? (
                          <ActivityIndicator
                            size="small"
                            color={styles.handCardBusySpinner.color as string}
                          />
                        ) : (
                          <>
                            <View style={styles.handCardArt} accessible={false}>
                              <ExplodingCatsArtwork
                                card={artConfig.key}
                                variant={artVariant}
                                width="100%"
                                height="100%"
                                preserveAspectRatio="xMidYMid slice"
                                accessible={false}
                                focusable={false}
                              />
                              <View style={styles.handCardOverlay}>
                                <ThemedText
                                  style={styles.handCardOverlayTitle}
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                >
                                  {translateCardName(card)}
                                </ThemedText>
                                <ThemedText
                                  style={styles.handCardOverlayDescription}
                                  numberOfLines={3}
                                >
                                  {description}
                                </ThemedText>
                              </View>
                            </View>
                            <View
                              style={styles.handCardMeta}
                              accessible={false}
                            >
                              {actionLabel ? (
                                <ThemedText
                                  style={styles.handCardHint}
                                  numberOfLines={1}
                                >
                                  {actionLabel}
                                </ThemedText>
                              ) : null}
                              {comboHint ? (
                                <ThemedText
                                  style={styles.handCardHint}
                                  numberOfLines={1}
                                >
                                  {comboHint}
                                </ThemedText>
                              ) : null}
                            </View>
                          </>
                        )}
                      </AnimatedTouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.handEmpty}>
                  <ThemedText style={styles.handEmptyText}>
                    {t('games.table.hand.empty')}
                  </ThemedText>
                </View>
              )}

              <View style={styles.handActions}>
                {canDraw ? (
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      actionBusy && actionBusy !== 'draw'
                        ? styles.primaryButtonDisabled
                        : null,
                    ]}
                    onPress={onDraw}
                    disabled={actionBusy === 'draw'}
                  >
                    {actionBusy === 'draw' ? (
                      <ActivityIndicator
                        size="small"
                        color={styles.primaryButtonText.color as string}
                      />
                    ) : (
                      <>
                        <IconSymbol
                          name="hand.draw.fill"
                          size={16}
                          color={styles.primaryButtonText.color as string}
                        />
                        <ThemedText style={styles.primaryButtonText}>
                          {t('games.table.actions.draw')}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}

                {canPlaySkip ? (
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      actionBusy && actionBusy !== 'skip'
                        ? styles.secondaryButtonDisabled
                        : null,
                    ]}
                    onPress={() => onPlay('skip')}
                    disabled={actionBusy === 'skip'}
                  >
                    {actionBusy === 'skip' ? (
                      <ActivityIndicator
                        size="small"
                        color={styles.secondaryButtonText.color as string}
                      />
                    ) : (
                      <>
                        <IconSymbol
                          name="figure.walk"
                          size={16}
                          color={styles.secondaryButtonText.color as string}
                        />
                        <ThemedText style={styles.secondaryButtonText}>
                          {t('games.table.actions.playSkip')}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}

                {canPlayAttack ? (
                  <TouchableOpacity
                    style={[
                      styles.destructiveButton,
                      actionBusy && actionBusy !== 'attack'
                        ? styles.destructiveButtonDisabled
                        : null,
                    ]}
                    onPress={() => onPlay('attack')}
                    disabled={actionBusy === 'attack'}
                  >
                    {actionBusy === 'attack' ? (
                      <ActivityIndicator
                        size="small"
                        color={styles.destructiveButtonText.color as string}
                      />
                    ) : (
                      <>
                        <IconSymbol
                          name="bolt.fill"
                          size={16}
                          color={styles.destructiveButtonText.color as string}
                        />
                        <ThemedText style={styles.destructiveButtonText}>
                          {t('games.table.actions.playAttack')}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>

              {!selfPlayer.alive ? (
                <ThemedText style={styles.eliminatedNote}>
                  {t('games.table.hand.eliminatedNote')}
                </ThemedText>
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
              style={[
                styles.primaryButton,
                startBusy ? styles.primaryButtonDisabled : null,
              ]}
              onPress={onStart}
              disabled={startBusy}
            >
              {startBusy ? (
                <ActivityIndicator
                  size="small"
                  color={styles.primaryButtonText.color as string}
                />
              ) : (
                <>
                  <IconSymbol
                    name="play.fill"
                    size={16}
                    color={styles.primaryButtonText.color as string}
                  />
                  <ThemedText style={styles.primaryButtonText}>
                    {t('games.table.actions.start')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {showLogs ? (
        <View style={styles.logsSection}>
          <View style={styles.logsHeader}>
            <IconSymbol
              name="list.bullet.rectangle"
              size={16}
              color={styles.logsHeaderText.color as string}
            />
            <ThemedText style={styles.logsHeaderText}>
              {t('games.table.logs.title')}
            </ThemedText>
          </View>
          {isCurrentUserPlayer ? (
            <>
              <View style={styles.logsComposer}>
                <TextInput
                  style={styles.logsInput}
                  value={messageDraft}
                  onChangeText={setMessageDraft}
                  placeholder={t('games.table.logs.composerPlaceholder')}
                  placeholderTextColor={
                    styles.logsInputPlaceholder.color as string
                  }
                  multiline
                  maxLength={500}
                  editable={!historySending}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.logsSendButton,
                    !canSendHistoryMessage || historySending
                      ? styles.logsSendButtonDisabled
                      : null,
                  ]}
                  onPress={handleSendHistoryNote}
                  disabled={!canSendHistoryMessage || historySending}
                >
                  {historySending ? (
                    <ActivityIndicator
                      size="small"
                      color={styles.logsSendButtonText.color as string}
                    />
                  ) : (
                    <>
                      <IconSymbol
                        name="paperplane.fill"
                        size={14}
                        color={styles.logsSendButtonText.color as string}
                      />
                      <ThemedText style={styles.logsSendButtonText}>
                        {t('games.table.logs.send')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.logsCheckboxRow}
                onPress={toggleMessageVisibility}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    messageVisibility === 'players'
                      ? styles.checkboxBoxChecked
                      : null,
                  ]}
                >
                  {messageVisibility === 'players' ? (
                    <IconSymbol
                      name="checkmark"
                      size={12}
                      color={styles.checkboxCheck.color as string}
                    />
                  ) : null}
                </View>
                <View style={styles.checkboxCopy}>
                  <ThemedText style={styles.checkboxLabel}>
                    {t(
                      messageVisibility === 'players'
                        ? 'games.table.logs.checkboxLabelPlayers'
                        : 'games.table.logs.checkboxLabelAll',
                    )}
                  </ThemedText>
                  <ThemedText style={styles.checkboxHint}>
                    {t('games.table.logs.checkboxHint')}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </>
          ) : null}
          {logs.length ? (
            logs.map((log) => {
              const timestamp = new Date(log.createdAt);
              const timeLabel = Number.isNaN(timestamp.getTime())
                ? '--:--'
                : timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
              const isMessage = log.type === 'message';
              let senderDisplayName: string | null = null;
              if (isMessage) {
                if (log.senderName) {
                  senderDisplayName = log.senderName;
                } else if (log.senderId) {
                  senderDisplayName =
                    playerNameMap.get(log.senderId) ??
                    (currentUserId && log.senderId === currentUserId
                      ? t('games.table.logs.you')
                      : null);
                }
                if (!senderDisplayName) {
                  senderDisplayName = t('games.table.logs.unknownSender');
                }
              }

              return (
                <View key={log.id} style={styles.logRow}>
                  <ThemedText style={styles.logTimestamp}>
                    {timeLabel}
                  </ThemedText>
                  {isMessage ? (
                    <View style={styles.logMessageColumn}>
                      <View style={styles.logMessageHeader}>
                        <ThemedText
                          style={styles.logMessageSender}
                          numberOfLines={1}
                        >
                          {senderDisplayName}
                        </ThemedText>
                        {log.scope === 'players' ? (
                          <View style={styles.logScopeBadge}>
                            <ThemedText style={styles.logScopeBadgeText}>
                              {t('games.table.logs.playersOnlyTag')}
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>
                      <ThemedText style={styles.logMessageText}>
                        {log.message}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.logMessage}>
                      {formatLogMessage(log.message)}
                    </ThemedText>
                  )}
                </View>
              );
            })
          ) : (
            <ThemedText style={styles.logsEmptyText}>
              {t('games.table.logs.empty')}
            </ThemedText>
          )}
        </View>
      ) : null}
    </>
  );

  const comboModal = catComboPrompt ? (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={closeCatComboPrompt}
    >
      <View style={styles.comboModalBackdrop}>
        <ThemedView style={styles.comboModalCard}>
          <ThemedText style={styles.comboModalTitle}>
            {t('games.table.catCombo.title', {
              card: translateCardName(catComboPrompt.cat),
            })}
          </ThemedText>
          <ThemedText style={styles.comboModalDescription}>
            {t('games.table.catCombo.description')}
          </ThemedText>
          <View style={styles.comboModeRow}>
            {catComboPrompt.available.pair ? (
              <TouchableOpacity
                style={[
                  styles.comboModeButton,
                  catComboPrompt.mode === 'pair'
                    ? styles.comboModeButtonSelected
                    : null,
                ]}
                onPress={() => handleCatComboModeChange('pair')}
              >
                <ThemedText
                  style={[
                    styles.comboModeButtonText,
                    catComboPrompt.mode === 'pair'
                      ? styles.comboModeButtonTextSelected
                      : null,
                  ]}
                >
                  {t('games.table.catCombo.modePair')}
                </ThemedText>
              </TouchableOpacity>
            ) : null}
            {catComboPrompt.available.trio ? (
              <TouchableOpacity
                style={[
                  styles.comboModeButton,
                  catComboPrompt.mode === 'trio'
                    ? styles.comboModeButtonSelected
                    : null,
                ]}
                onPress={() => handleCatComboModeChange('trio')}
              >
                <ThemedText
                  style={[
                    styles.comboModeButtonText,
                    catComboPrompt.mode === 'trio'
                      ? styles.comboModeButtonTextSelected
                      : null,
                  ]}
                >
                  {t('games.table.catCombo.modeTrio')}
                </ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>
          {catComboPrompt.mode ? (
            <View style={styles.comboSection}>
              <ThemedText style={styles.comboSectionLabel}>
                {t('games.table.catCombo.targetLabel')}
              </ThemedText>
              {aliveOpponents.length ? (
                <View style={styles.comboOptionGroup}>
                  {aliveOpponents.map((player) => (
                    <TouchableOpacity
                      key={player.playerId}
                      style={[
                        styles.comboOptionButton,
                        catComboPrompt.targetPlayerId === player.playerId
                          ? styles.comboOptionButtonSelected
                          : null,
                      ]}
                      onPress={() =>
                        handleCatComboTargetChange(player.playerId)
                      }
                    >
                      <ThemedText
                        style={[
                          styles.comboOptionLabel,
                          catComboPrompt.targetPlayerId === player.playerId
                            ? styles.comboOptionLabelSelected
                            : null,
                        ]}
                        numberOfLines={1}
                      >
                        {player.displayName}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <ThemedText style={styles.comboEmptyText}>
                  {t('games.table.catCombo.noTargets')}
                </ThemedText>
              )}
            </View>
          ) : null}
          {catComboPrompt.mode === 'trio' ? (
            <View style={styles.comboSection}>
              <ThemedText style={styles.comboSectionLabel}>
                {t('games.table.catCombo.desiredCardLabel')}
              </ThemedText>
              <View style={styles.comboOptionGroup}>
                {DESIRED_CARD_OPTIONS.map((cardOption) => (
                  <TouchableOpacity
                    key={cardOption}
                    style={[
                      styles.comboOptionButton,
                      catComboPrompt.desiredCard === cardOption
                        ? styles.comboOptionButtonSelected
                        : null,
                    ]}
                    onPress={() => handleCatComboDesiredCardChange(cardOption)}
                  >
                    <ThemedText
                      style={[
                        styles.comboOptionLabel,
                        catComboPrompt.desiredCard === cardOption
                          ? styles.comboOptionLabelSelected
                          : null,
                      ]}
                      numberOfLines={1}
                    >
                      {translateCardName(cardOption)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
          <View style={styles.comboActions}>
            <TouchableOpacity
              style={styles.comboCancelButton}
              onPress={closeCatComboPrompt}
              disabled={catComboBusy}
            >
              <ThemedText style={styles.comboCancelText}>
                {t('games.table.catCombo.cancel')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.comboConfirmButton,
                comboConfirmDisabled ? styles.comboConfirmButtonDisabled : null,
              ]}
              onPress={handleConfirmCatCombo}
              disabled={comboConfirmDisabled}
            >
              {catComboBusy ? (
                <ActivityIndicator
                  size="small"
                  color={styles.comboConfirmText.color as string}
                />
              ) : (
                <ThemedText style={styles.comboConfirmText}>
                  {t('games.table.catCombo.confirm')}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  ) : null;

  if (fullScreen) {
    return (
      <>
        <ThemedView style={[styles.card, styles.cardFullScreen]}>
          <ScrollView
            contentContainerStyle={styles.fullScreenScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.fullScreenInner}>{tableContent}</View>
          </ScrollView>
        </ThemedView>
        {comboModal}
      </>
    );
  }

  return (
    <>
      <ThemedView style={styles.card}>{tableContent}</ThemedView>
      {comboModal}
    </>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const tableTheme = palette.gameTable;
  const { surface, raised, border, shadow, destructiveBg, destructiveText } =
    tableTheme;
  const primaryBgColor = palette.tint;
  const primaryTextColor = palette.background;

  const innerDiameter = Math.max(TABLE_DIAMETER - PLAYER_SEAT_SIZE - 20, 180);
  const overlayShadow = isLight
    ? 'rgba(15, 23, 42, 0.45)'
    : 'rgba(15, 23, 42, 0.65)';
  const cardShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 1 : 0.6,
    radius: 12,
  });
  const tableRingShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.25 : 0.45,
    radius: 18,
    offset: { width: 0, height: 6 },
    elevation: 4,
  });
  const tableStatShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.25 : 0.45,
    radius: 12,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });
  const handCardShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.24 : 0.42,
    radius: 10,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });
  const handCardPlayableShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.35 : 0.6,
    radius: 10,
    offset: { width: 0, height: 4 },
    elevation: 3,
  });
  const handCardOverlayShadow = platformShadow({
    color: overlayShadow,
    opacity: isLight ? 0.9 : 0.8,
    radius: 12,
    offset: { width: 0, height: 8 },
  });
  const comboModalShadow = platformShadow({
    color: shadow,
    opacity: isLight ? 0.4 : 0.8,
    radius: 10,
    offset: { width: 0, height: 6 },
    elevation: 3,
  });
  const handCardTitleShadow: TextStyle =
    Platform.OS === 'web'
      ? {}
      : {
          textShadowColor: 'rgba(15, 23, 42, 0.55)',
          textShadowOffset: { width: 0, height: 4 },
          textShadowRadius: 8,
        };
  const handCardDescriptionShadow: TextStyle =
    Platform.OS === 'web'
      ? {}
      : {
          textShadowColor: 'rgba(15, 23, 42, 0.45)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 6,
        };

  return StyleSheet.create({
    card: {
      ...cardShadow,
      padding: 20,
      borderRadius: 20,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      gap: 16,
    },
    cardFullScreen: {
      ...platformShadow({
        color: shadow,
        opacity: 0,
        radius: 0,
        offset: { width: 0, height: 0 },
        elevation: 0,
      }),
      flex: 1,
      borderRadius: 0,
      borderWidth: 0,
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
      paddingTop: PLAYER_SEAT_SIZE * 0.9,
    },
    tableRing: {
      ...tableRingShadow,
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
    },
    tableCenter: {
      width: innerDiameter,
      height: innerDiameter,
      borderRadius: innerDiameter / 2,
      backgroundColor: surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 12,
    },
    tableStatsRow: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 12,
      marginTop: 16,
    },
    tableStatCard: {
      ...tableStatShadow,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      minWidth: 132,
    },
    tableStatIcon: {
      color: palette.tint,
    },
    tableStatTextGroup: {
      gap: 2,
    },
    tableStatTitle: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 16,
    },
    tableStatSubtitle: {
      color: palette.icon,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
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
    tableInfoCardWithArtwork: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: 136,
      gap: 8,
    },
    tableInfoIcon: {
      color: palette.tint,
    },
    tableInfoArtwork: {
      width: 62,
      aspectRatio: 0.68,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
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
    tableSeatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tableSeatRowCurrent: {
      opacity: 1,
    },
    tableSeatRowOut: {
      opacity: 0.45,
    },
    seatAvatarColumn: {
      alignItems: 'center',
      gap: 6,
      minWidth: 52,
    },
    seatAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    seatAvatarIcon: {
      color: palette.tint,
    },
    seatStatusDot: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      bottom: 2,
      right: 2,
      borderWidth: 1.5,
      borderColor: surface,
    },
    seatStatusDotAlive: {
      backgroundColor: '#22C55E',
    },
    seatStatusDotOut: {
      backgroundColor: '#9CA3AF',
    },
    seatName: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
      marginTop: 2,
      textAlign: 'center',
      maxWidth: 80,
    },
    seatCardStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'center',
    },
    seatCardBack: {
      width: 18,
      height: 26,
      borderRadius: 4,
      backgroundColor: palette.background,
      marginHorizontal: 2,
    },
    seatCardBackStacked: {
      marginLeft: 0,
    },
    seatCardCount: {
      color: palette.icon,
      fontSize: 11,
      marginLeft: 6,
      fontWeight: '600',
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
      ...handCardShadow,
      width: 148,
      height: 228,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
      backgroundColor: surface,
      flexShrink: 0,
    },
    handCardArt: {
      width: '100%',
      aspectRatio: 0.68,
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: raised,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardOverlay: {
      ...handCardOverlayShadow,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 6,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardOverlayTitle: {
      color: '#FDE68A',
      fontWeight: '800',
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      letterSpacing: 0.8,
      ...handCardTitleShadow,
    },
    handCardOverlayDescription: {
      color: '#F8FAFC',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      ...handCardDescriptionShadow,
    },
    handCardMeta: {
      width: '100%',
      alignItems: 'center',
      gap: 4,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardPlayable: {
      ...handCardPlayableShadow,
      borderColor: palette.tint,
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
    handCardLabel: {
      color: palette.icon,
      fontSize: 11,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    handCardHint: {
      color: palette.tint,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    comboModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    comboModalCard: {
      ...comboModalShadow,
      width: '100%',
      maxWidth: 360,
      borderRadius: 18,
      backgroundColor: surface,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
    },
    comboModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
    },
    comboModalDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.icon,
    },
    comboModeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    comboModeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      alignItems: 'center',
    },
    comboModeButtonSelected: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    comboModeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    comboModeButtonTextSelected: {
      color: primaryTextColor,
    },
    comboSection: {
      gap: 8,
    },
    comboSectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    comboOptionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    comboOptionButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
    },
    comboOptionButtonSelected: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    comboOptionLabel: {
      fontSize: 14,
      color: palette.text,
    },
    comboOptionLabelSelected: {
      color: primaryTextColor,
    },
    comboEmptyText: {
      fontSize: 14,
      color: palette.icon,
    },
    comboActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    comboCancelButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    comboCancelText: {
      fontSize: 14,
      color: palette.icon,
    },
    comboConfirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: primaryBgColor,
      gap: 8,
    },
    comboConfirmButtonDisabled: {
      opacity: 0.6,
    },
    comboConfirmText: {
      fontSize: 14,
      fontWeight: '600',
      color: primaryTextColor,
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
      backgroundColor: primaryBgColor,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: primaryTextColor,
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
      gap: 12,
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
    logsEmptyText: {
      color: palette.icon,
      fontSize: 12,
      fontStyle: 'italic',
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
    logMessageColumn: {
      flex: 1,
      gap: 4,
    },
    logMessageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logMessageSender: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 12,
    },
    logScopeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: raised,
    },
    logScopeBadgeText: {
      color: palette.icon,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    logMessageText: {
      color: palette.text,
      fontSize: 12,
      lineHeight: 16,
    },
    logsComposer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    logsInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 96,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: raised,
      color: palette.text,
      fontSize: 13,
    },
    logsInputPlaceholder: {
      color: palette.icon,
    },
    logsSendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: primaryBgColor,
    },
    logsSendButtonDisabled: {
      opacity: 0.5,
    },
    logsSendButtonText: {
      color: primaryTextColor,
      fontWeight: '700',
      fontSize: 13,
    },
    logsCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    checkboxBox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surface,
    },
    checkboxBoxChecked: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    checkboxCheck: {
      color: primaryTextColor,
    },
    checkboxCopy: {
      flex: 1,
      gap: 2,
    },
    checkboxLabel: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 12,
    },
    checkboxHint: {
      color: palette.icon,
      fontSize: 11,
    },
  });
}
