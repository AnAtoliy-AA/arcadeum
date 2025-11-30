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
  useWindowDimensions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  ExplodingCatsCard as ExplodingCatsArtwork,
  type CardKey as CardArtworkKey,
} from '@/components/cards';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import {
  useHorizontalDragScroll,
  useVerticalDragScroll,
} from '@/hooks/useDragScroll';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/messages';
import type { GameRoomSummary, GameSessionSummary } from '../api/gamesApi';
import { getRoomStatusLabel } from '../roomUtils';
import { platformShadow } from '@/lib/platformShadow';

const TABLE_DIAMETER = 230;
const PLAYER_SEAT_SIZE = 88;
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const ACCESSIBILITY_DISABLED_PROPS: { accessible?: boolean } =
  Platform.OS === 'web' ? {} : { accessible: false };

type ActionEffectType =
  | 'draw'
  | 'skip'
  | 'attack'
  | 'steal'
  | 'defuse'
  | 'cat_combo';

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
  | 'favor'
  | 'shuffle'
  | 'see_the_future'
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
  'favor',
  'shuffle',
  'see_the_future',
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
  favor: { key: 'skip', variant: 1 }, // TODO: Add proper SVG artwork
  shuffle: { key: 'skip', variant: 3 }, // TODO: Add proper SVG artwork
  see_the_future: { key: 'defuse', variant: 1 }, // TODO: Add proper SVG artwork
  tacocat: { key: 'tacocat', variant: 1 },
  hairy_potato_cat: { key: 'hairy-potato-cat', variant: 2 },
  rainbow_ralphing_cat: { key: 'rainbow-ralphing-cat', variant: 2 },
  cattermelon: { key: 'cattermelon', variant: 1 },
  bearded_cat: { key: 'bearded-cat', variant: 3 },
};

const CARD_GRADIENT_COORDS = {
  start: { x: 0.08, y: 0 },
  end: { x: 0.92, y: 1 },
} as const;

const CARD_ASPECT_RATIO = 228 / 148;
const GRID_CARD_MIN_WIDTH = 80;
const DEFAULT_GRID_COLUMNS = 3;
const MIN_GRID_COLUMNS = 1;
const MAX_GRID_COLUMNS = 6;

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

interface ExplodingCatsTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy: 'draw' | 'skip' | 'attack' | 'shuffle' | 'favor' | 'see_the_future' | 'cat_pair' | 'cat_trio' | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlay: (card: 'skip' | 'attack' | 'shuffle') => void;
  onPlayFavor: (targetPlayerId: string, desiredCard: string) => void;
  onPlaySeeTheFuture: () => void;
  onPlayCatCombo: (payload: ExplodingCatsCatComboInput) => void;
  onPostHistoryNote?: (
    message: string,
    scope: LogVisibility,
  ) => Promise<void> | void;
  fullScreen?: boolean;
  tableOnly?: boolean;
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
    case 'favor':
      return 'games.table.cards.favor';
    case 'shuffle':
      return 'games.table.cards.shuffle';
    case 'see_the_future':
      return 'games.table.cards.seeTheFuture';
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
    case 'favor':
      return 'games.table.cardDescriptions.favor';
    case 'shuffle':
      return 'games.table.cardDescriptions.shuffle';
    case 'see_the_future':
      return 'games.table.cardDescriptions.seeTheFuture';
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
  onPlayFavor,
  onPlaySeeTheFuture,
  onPlayCatCombo,
  onPostHistoryNote,
  fullScreen = false,
  tableOnly = false,
}: ExplodingCatsTableProps) {
  const styles = useThemedStyles(createStyles);
  const cardGradientColors = useMemo(
    () => [
      StyleSheet.flatten(styles.cardGradientSwatchA).backgroundColor as string,
      StyleSheet.flatten(styles.cardGradientSwatchB).backgroundColor as string,
      StyleSheet.flatten(styles.cardGradientSwatchC).backgroundColor as string,
    ],
    [styles],
  );
  const cardDecor = useMemo(
    () => (
      <View style={styles.cardBackdrop} pointerEvents="none">
        <LinearGradient
          colors={cardGradientColors}
          start={CARD_GRADIENT_COORDS.start}
          end={CARD_GRADIENT_COORDS.end}
          style={styles.cardGradientLayer}
        />
        <View style={styles.cardGlowPrimary} />
        <View style={styles.cardGlowSecondary} />
        <View style={styles.cardAccentTop} />
        <View style={styles.cardAccentBottom} />
      </View>
    ),
    [cardGradientColors, styles],
  );
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const cardScrollMaxHeight = Math.max(windowHeight - 240, 320);
  const cardScrollStyle = useMemo(() => {
    return Platform.OS === 'web'
      ? [styles.cardScroll, { height: cardScrollMaxHeight }]
      : [styles.cardScroll, { maxHeight: cardScrollMaxHeight }];
  }, [cardScrollMaxHeight, styles.cardScroll]);
  const showHeader = !tableOnly;
  const showStats = !tableOnly;
  const showHandHeader = fullScreen || !tableOnly;
  const showLogs = true;
  const cardPressScale = useRef(new Animated.Value(1)).current;
  const deckPulseScale = useRef(new Animated.Value(1)).current;
  const effectScale = useRef(new Animated.Value(0)).current;
  const effectOpacity = useRef(new Animated.Value(0)).current;
  const effectRotate = useRef(new Animated.Value(0)).current;
  const [activeEffect, setActiveEffect] = useState<ActionEffectType | null>(
    null,
  );
  const [animatingCardKey, setAnimatingCardKey] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [messageVisibility, setMessageVisibility] =
    useState<LogVisibility>('all');
  const [historySending, setHistorySending] = useState(false);
  const [handViewMode, setHandViewMode] = useState<'row' | 'grid'>('row');
  const [gridColumns, setGridColumns] = useState<number>(DEFAULT_GRID_COLUMNS);
  const [gridContainerWidth, setGridContainerWidth] = useState<number>(0);
  const handGridSpacing = useMemo(() => {
    const flattened = StyleSheet.flatten(
      styles.handGridContainer,
    ) as Record<string, unknown> | null;
    const horizontalPadding =
      flattened && typeof flattened['paddingHorizontal'] === 'number'
        ? (flattened['paddingHorizontal'] as number)
        : 0;
    const gap =
      flattened && typeof flattened['gap'] === 'number'
        ? (flattened['gap'] as number)
        : 12;
    return { horizontalPadding, gap };
  }, [styles.handGridContainer]);
  const maxColumnsByWidth = useMemo(() => {
    if (gridContainerWidth <= 0) {
      return MAX_GRID_COLUMNS;
    }

    const { horizontalPadding, gap } = handGridSpacing;
    const usableWidth = gridContainerWidth - horizontalPadding * 2;
    if (usableWidth <= 0) {
      return MIN_GRID_COLUMNS;
    }

    const capacity = Math.floor(
      (usableWidth + gap) / (GRID_CARD_MIN_WIDTH + gap),
    );
    const normalizedCapacity = Number.isFinite(capacity)
      ? capacity
      : MIN_GRID_COLUMNS;

    return Math.min(
      MAX_GRID_COLUMNS,
      Math.max(MIN_GRID_COLUMNS, normalizedCapacity),
    );
  }, [gridContainerWidth, handGridSpacing]);

  useEffect(() => {
    if (gridColumns > maxColumnsByWidth) {
      setGridColumns(maxColumnsByWidth);
    }
  }, [gridColumns, maxColumnsByWidth]);

  const gridCardDimensions = useMemo(() => {
    const columnCount = Math.max(
      MIN_GRID_COLUMNS,
      Math.min(gridColumns, MAX_GRID_COLUMNS, maxColumnsByWidth),
    );

    if (gridContainerWidth <= 0) {
      const fallbackWidth = 128;
      return {
        width: fallbackWidth,
        height: Math.round(fallbackWidth * CARD_ASPECT_RATIO),
      };
    }

    const { horizontalPadding, gap } = handGridSpacing;
    const spacingTotal = gap * Math.max(columnCount - 1, 0);
    const usableWidth =
      gridContainerWidth - horizontalPadding * 2 - spacingTotal;
    const rawWidth = usableWidth / columnCount;
    const safeWidth = Number.isFinite(rawWidth)
      ? rawWidth
      : GRID_CARD_MIN_WIDTH;
    const width = Math.max(
      GRID_CARD_MIN_WIDTH,
      Math.floor(safeWidth),
    );
    const height = Math.round(width * CARD_ASPECT_RATIO);

    return { width, height };
  }, [gridColumns, gridContainerWidth, handGridSpacing, maxColumnsByWidth]);

  const gridCardWidth = gridCardDimensions.width;
  const gridCardHeight = gridCardDimensions.height;

  const snapshot = useMemo<ExplodingCatsSnapshot | null>(() => {
    const raw = session?.state;
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
  const selfPlayerHandSize = selfPlayer?.hand?.length ?? 0;
  const handScrollRef = useHorizontalDragScroll<ScrollView>({
    dependencyKey: `${handViewMode}-${selfPlayerHandSize}`,
  });

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
  const logsScrollRef = useVerticalDragScroll<ScrollView>({
    dependencyKey: logs.length,
  });
  const translateCardName = useCallback(
    (card: ExplodingCatsCard) => t(getCardTranslationKey(card)),
    [t],
  );
  const translateCardDescription = useCallback(
    (card: ExplodingCatsCard) => t(getCardDescriptionKey(card)),
    [t],
  );
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
    // deck pulse for draws
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

    // Trigger simple centered effects for actions
    const mapBusyToEffect = (busy: typeof actionBusy): ActionEffectType | null => {
      if (!busy) return null;
      if (busy === 'cat_pair' || busy === 'cat_trio') return 'cat_combo';
      if (busy === 'draw' || busy === 'skip' || busy === 'attack') {
        return busy as ActionEffectType;
      }
      return null;
    };

    const effectType = mapBusyToEffect(actionBusy);
    if (effectType) {
      // kickoff overlay animation
      setActiveEffect(effectType);
      effectScale.setValue(0.6);
      effectOpacity.setValue(0.95);
      effectRotate.setValue(0);

      Animated.parallel([
        Animated.timing(effectScale, {
          toValue: 1.35,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(effectOpacity, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(effectRotate, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActiveEffect(null);
      });
    }
  }, [actionBusy, deckPulseScale, effectScale, effectOpacity, effectRotate]);

  const renderHandCard = useCallback(
    (card: ExplodingCatsCard, index: number, count: number, mode: 'row' | 'grid' = 'row') => {
      const cardKey = `${card}-${index}`;
      const quickAction = card === 'skip' ? 'skip' : card === 'attack' ? 'attack' : null;
      const isCatCard = CAT_COMBO_CARDS.includes(card as ExplodingCatsCatCard);
      const comboAvailability = isCatCard
        ? catComboAvailability[card as ExplodingCatsCatCard]
        : null;
      const comboPlayable = Boolean(
        isCatCard &&
          comboAvailability &&
          (comboAvailability.pair || comboAvailability.trio) &&
          isSessionActive &&
          isMyTurn &&
          (selfPlayer?.alive ?? false),
      );

      const isPlayable =
        quickAction === 'skip'
          ? canPlaySkip
          : quickAction === 'attack'
          ? canPlayAttack
          : comboPlayable;

      const isBusy =
        quickAction === 'skip'
          ? actionBusy === 'skip'
          : quickAction === 'attack'
          ? actionBusy === 'attack'
          : isCatCard && catComboBusy;

      const cardArt = CARD_ART_SETTINGS[card] ?? CARD_ART_SETTINGS.exploding_cat;
      const cardVariant = (((cardArt.variant ?? 1) - 1 + index) % 3) + 1 as CardArtworkVariant;
      const isAnimating = animatingCardKey === cardKey;
    const isGrid = mode === 'grid';
    const cardWidth = isGrid ? gridCardWidth : 148;
    const cardHeight = isGrid ? gridCardHeight : 228;
      const overlayTitleLines = isGrid ? 1 : 2;
      const overlayDescriptionLines = isGrid ? 2 : 3;

      const actionHint =
        quickAction === 'skip'
          ? t('games.table.actions.playSkip')
          : quickAction === 'attack'
          ? t('games.table.actions.playAttack')
          : comboPlayable
          ? t('games.table.actions.playCatCombo')
          : undefined;

      const comboHint =
        comboPlayable && comboAvailability
          ? comboAvailability.pair && comboAvailability.trio
            ? t('games.table.catCombo.optionPairOrTrio')
            : comboAvailability.trio
            ? t('games.table.catCombo.optionTrio')
            : t('games.table.catCombo.optionPair')
          : undefined;

      const handlePress = () => {
        if (!isPlayable || isBusy || animatingCardKey !== null) {
          return;
        }

        const execute = () => {
          if (quickAction) {
            onPlay(quickAction);
            return;
          }

          if (isCatCard) {
            openCatComboPrompt(card as ExplodingCatsCatCard);
          }
        };

        triggerCardAnimation(cardKey, execute);
      };

      return (
        <AnimatedTouchableOpacity
          key={cardKey}
          style={[
            isGrid ? styles.handCardGrid : styles.handCard,
            isGrid ? { width: cardWidth, height: cardHeight } : null,
            isPlayable ? styles.handCardPlayable : null,
            isPlayable ? null : styles.handCardDisabled,
            isBusy ? styles.handCardBusy : null,
            isAnimating ? { transform: [{ scale: cardPressScale }] } : null,
          ]}
          activeOpacity={isPlayable ? 0.82 : 1}
          onPress={handlePress}
          disabled={!isPlayable || isBusy || animatingCardKey !== null}
          accessibilityRole={isPlayable ? 'button' : 'text'}
          accessibilityLabel={translateCardName(card)}
          accessibilityHint={isPlayable && actionHint ? actionHint : undefined}
        >
          {isBusy ? (
            <ActivityIndicator
              size="small"
              color={styles.handCardBusySpinner.color as string}
            />
          ) : (
            <>
              <View
                style={[
                  styles.handCardArt,
                  isGrid ? { height: Math.round(cardHeight * 0.68) } : null,
                ]}
                {...ACCESSIBILITY_DISABLED_PROPS}
              >
                <ExplodingCatsArtwork
                  {...ACCESSIBILITY_DISABLED_PROPS}
                  card={cardArt.key}
                  variant={cardVariant}
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  focusable={false}
                />
                <View style={styles.handCardOverlay} {...ACCESSIBILITY_DISABLED_PROPS}>
                  <ThemedText style={styles.handCardOverlayTitle} numberOfLines={overlayTitleLines}>
                    {translateCardName(card)}
                  </ThemedText>
                  <ThemedText
                    style={styles.handCardOverlayDescription}
                    numberOfLines={overlayDescriptionLines}
                  >
                    {translateCardDescription(card)}
                  </ThemedText>
                </View>
                {count > 1 && (
                  <View style={styles.handCardCountBadge} {...ACCESSIBILITY_DISABLED_PROPS}>
                    <ThemedText style={styles.handCardCountText}>
                      {count}
                    </ThemedText>
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.handCardMeta,
                  isGrid ? { paddingHorizontal: 2, maxWidth: '100%' } : null,
                ]}
                {...ACCESSIBILITY_DISABLED_PROPS}
              >
                {actionHint ? (
                  <ThemedText style={styles.handCardHint} numberOfLines={1}>
                    {actionHint}
                  </ThemedText>
                ) : null}
                {comboHint ? (
                  <ThemedText style={styles.handCardHint} numberOfLines={1}>
                    {comboHint}
                  </ThemedText>
                ) : null}
              </View>
            </>
          )}
        </AnimatedTouchableOpacity>
      );
    },
    [
      actionBusy,
      animatingCardKey,
      canPlayAttack,
      canPlaySkip,
      catComboAvailability,
      catComboBusy,
  gridCardHeight,
  gridCardWidth,
      isMyTurn,
      isSessionActive,
      onPlay,
      openCatComboPrompt,
      selfPlayer?.alive,
      t,
      translateCardDescription,
      translateCardName,
      triggerCardAnimation,
      styles,
      cardPressScale,
    ],
  );

  const showGridSizeControls = handViewMode === 'grid';
  const canDecreaseGridColumns = gridColumns > MIN_GRID_COLUMNS;
  const canIncreaseGridColumns = gridColumns < maxColumnsByWidth;

  const handleDecreaseGridColumns = useCallback(() => {
    setGridColumns((value) => Math.max(MIN_GRID_COLUMNS, value - 1));
  }, []);

  const handleIncreaseGridColumns = useCallback(() => {
    setGridColumns((value) =>
      Math.min(
        maxColumnsByWidth,
        Math.min(MAX_GRID_COLUMNS, value + 1),
      ),
    );
  }, [maxColumnsByWidth]);

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
                        {...ACCESSIBILITY_DISABLED_PROPS}
                        card={discardArt.key}
                        variant={discardArtVariant}
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid slice"
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
                {/* Centered action effect overlay */}
                {activeEffect ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.effectOverlay,
                      {
                        opacity: effectOpacity,
                        transform: [
                          { scale: effectScale },
                          {
                            rotate: effectRotate.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.effectCircle,
                        activeEffect === 'draw'
                          ? styles.effectCircleDraw
                          : activeEffect === 'attack'
                          ? styles.effectCircleAttack
                          : activeEffect === 'skip'
                          ? styles.effectCircleSkip
                          : activeEffect === 'cat_combo'
                          ? styles.effectCircleCombo
                          : styles.effectCircleDefault,
                      ]}
                    />
                    {activeEffect === 'attack' ? (
                      <Animated.View style={styles.effectIconWrap}>
                        <IconSymbol
                          name="bolt.fill"
                          size={28}
                          color={styles.effectIcon.color as string}
                        />
                      </Animated.View>
                    ) : null}
                  </Animated.View>
                ) : null}
              </View>

              {tableSeats.map((seat) => {
                const isCurrent =
                  seat.player.isCurrentTurn &&
                  isSessionActive &&
                  !isSessionCompleted;
                return (
                  <View
                    key={seat.player.playerId}
                    style={[
                      styles.tableSeatAnchor,
                      {
                        left: seat.position.left,
                        top: seat.position.top,
                      },
                    ]}
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
                  <View style={styles.handHeaderControls}>
                    <View
                      style={[
                        styles.handSizeControls,
                        showGridSizeControls ? null : styles.handSizeControlsHidden,
                      ]}
                      pointerEvents={showGridSizeControls ? 'auto' : 'none'}
                    >
                      <TouchableOpacity
                        style={[
                          styles.handSizeButton,
                          !canDecreaseGridColumns
                            ? styles.handSizeButtonDisabled
                            : null,
                        ]}
                        onPress={handleDecreaseGridColumns}
                        accessibilityRole="button"
                        accessibilityLabel={t('games.table.hand.sizeDecrease')}
                        accessibilityState={{ disabled: !canDecreaseGridColumns }}
                        disabled={!canDecreaseGridColumns}
                      >
                        <IconSymbol
                          name="minus"
                          size={12}
                          color={styles.handTitleIcon.color as string}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.handSizeButton,
                          !canIncreaseGridColumns
                            ? styles.handSizeButtonDisabled
                            : null,
                        ]}
                        onPress={handleIncreaseGridColumns}
                        accessibilityRole="button"
                        accessibilityLabel={t('games.table.hand.sizeIncrease')}
                        accessibilityState={{ disabled: !canIncreaseGridColumns }}
                        disabled={!canIncreaseGridColumns}
                      >
                        <IconSymbol
                          name="plus"
                          size={12}
                          color={styles.handTitleIcon.color as string}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.handViewButton,
                        handViewMode === 'grid' ? styles.handViewButtonActive : null,
                      ]}
                      onPress={() => setHandViewMode('grid')}
                      accessibilityRole="button"
                      accessibilityLabel={t('games.table.hand.viewGrid')}
                      accessibilityState={{ selected: handViewMode === 'grid' }}
                    >
                      <IconSymbol
                        name="square.grid.2x2"
                        size={14}
                        color={
                          (handViewMode === 'grid'
                            ? styles.handViewButtonIconActive.color
                            : styles.handTitleIcon.color) as string
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.handViewButton,
                        handViewMode === 'row' ? styles.handViewButtonActive : null,
                      ]}
                      onPress={() => setHandViewMode('row')}
                      accessibilityRole="button"
                      accessibilityLabel={t('games.table.hand.viewRow')}
                      accessibilityState={{ selected: handViewMode === 'row' }}
                    >
                      <IconSymbol
                        name="rectangle"
                        size={14}
                        color={
                          (handViewMode === 'row'
                            ? styles.handViewButtonIconActive.color
                            : styles.handTitleIcon.color) as string
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {selfPlayer.hand.length ? (
                handViewMode === 'row' ? (
                  <ScrollView
                    horizontal
                    style={styles.handScroll}
                    ref={handScrollRef}
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    contentInsetAdjustmentBehavior="never"
                    contentContainerStyle={styles.handScrollContent}
                  >
                    {(() => {
                      const uniqueCards = Array.from(new Set(selfPlayer.hand));
                      const cardCounts = new Map<ExplodingCatsCard, number>();
                      selfPlayer.hand.forEach((card) => {
                        cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
                      });
                      return uniqueCards.map((card, index) =>
                        renderHandCard(card, index, cardCounts.get(card) || 1)
                      );
                    })()}
                  </ScrollView>
                ) : (
                  <View
                    style={styles.handGridContainer}
                    onLayout={({ nativeEvent: { layout } }) => {
                      const layoutWidth = Math.round(layout.width);
                      setGridContainerWidth((previousWidth) =>
                        previousWidth !== layoutWidth
                          ? layoutWidth
                          : previousWidth,
                      );
                    }}
                  >
                    {(() => {
                      const uniqueCards = Array.from(new Set(selfPlayer.hand));
                      const cardCounts = new Map<ExplodingCatsCard, number>();
                      selfPlayer.hand.forEach((card) => {
                        cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
                      });
                      return uniqueCards.map((card, index) =>
                        renderHandCard(card, index, cardCounts.get(card) || 1, 'grid')
                      );
                    })()}
                  </View>
                )
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
            <ScrollView
              style={styles.logsList}
              ref={logsScrollRef}
              contentContainerStyle={styles.logsListContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {logs.map((log) => {
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
              })}
            </ScrollView>
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
          {cardDecor}
          <ScrollView
            contentContainerStyle={styles.fullScreenScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
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
      <ThemedView style={styles.card}>
        {cardDecor}
        <ScrollView
          style={cardScrollStyle}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.cardScrollContent}
        >
          <View style={styles.fullScreenInner}>{tableContent}</View>
        </ScrollView>
      </ThemedView>
      {comboModal}
    </>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const tableTheme = palette.gameTable;
  const { shadow, destructiveBg, destructiveText, playerCurrent, playerIcon } =
    tableTheme;
  const {
    heroBackground: cardBackground,
    raisedBackground: ringSurface,
    border: cardBorder,
    actionBackground: panelSurface,
    actionBorder: panelBorder,
    heroGlowPrimary,
    heroGlowSecondary,
    backgroundGlow: roomGlow,
    decorPlay,
    decorCheck,
    decorAlert,
    heroBadgeBackground,
    heroBadgeBorder,
    heroBadgeText,
    statusLobby,
    errorBackground,
    errorText,
    titleText,
  } = palette.gameRoom;
  const surface = cardBackground;
  const raised = panelSurface;
  const border = panelBorder;
  const primaryBgColor = decorCheck;
  const primaryTextColor = heroBadgeText;

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
  const handScrollBase: ViewStyle =
    Platform.OS === 'web'
      ? ({
          width: '100%',
          maxWidth: '100%',
          flexGrow: 0,
          flexShrink: 1,
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as ViewStyle)
      : {
          width: '100%',
          flexGrow: 0,
          flexShrink: 1,
          minWidth: 0,
        };

  return StyleSheet.create({
    card: {
      ...cardShadow,
      borderRadius: 28,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      position: 'relative',
      overflow: 'hidden',
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
      borderRadius: 28,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: cardBorder,
      backgroundColor: surface,
    },
    cardScroll: {
      width: '100%',
      flexGrow: 0,
      flexShrink: 0,
    },
    cardScrollContent: {
      paddingBottom: 32,
    },
    fullScreenScroll: {
      flexGrow: 1,
    },
    fullScreenInner: {
      gap: 24,
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: 40,
    },
    cardBackdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    cardGradientLayer: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.85,
    },
    cardGlowPrimary: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 180,
      backgroundColor: `${heroGlowPrimary}33`,
      top: -140,
      right: -100,
    },
    cardGlowSecondary: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 160,
      backgroundColor: `${heroGlowSecondary}29`,
      bottom: -140,
      left: -120,
    },
    cardAccentTop: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 140,
      top: -80,
      left: -70,
      backgroundColor: `${decorPlay}20`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}60`,
    },
    cardAccentBottom: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 150,
      bottom: -90,
      right: -60,
      backgroundColor: `${decorAlert}1f`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorAlert}55`,
    },
    cardGradientSwatchA: {
      backgroundColor: `${heroGlowSecondary}29`,
    },
    cardGradientSwatchB: {
      backgroundColor: surface,
    },
    cardGradientSwatchC: {
      backgroundColor: `${heroGlowPrimary}2f`,
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
      color: decorCheck,
    },
    headerText: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.3,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: heroBadgeBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: heroBadgeBorder,
    },
    statusText: {
      color: heroBadgeText,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    messageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 16,
      backgroundColor: `${decorAlert}1f`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorAlert}55`,
    },
    messageText: {
      color: heroBadgeText,
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
      backgroundColor: ringSurface,
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
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}40`,
      minWidth: 132,
    },
    tableStatIcon: {
      color: decorCheck,
    },
    tableStatTextGroup: {
      gap: 2,
    },
    tableStatTitle: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
    },
    tableStatSubtitle: {
      color: heroBadgeText,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    tableInfoCard: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}40`,
      minWidth: 110,
    },
    tableInfoCardWithArtwork: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: 136,
      gap: 8,
    },
    tableInfoIcon: {
      color: decorCheck,
    },
    tableInfoArtwork: {
      width: 62,
      aspectRatio: 0.68,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}55`,
    },
    tableInfoTitle: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
    },
    tableInfoSubtitle: {
      color: heroBadgeText,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    // Action effect overlay (center of table)
    effectOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 6,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    effectCircle: {
      width: 110,
      height: 110,
      borderRadius: 64,
      backgroundColor: 'transparent',
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isLight ? 0.18 : 0.32,
      shadowRadius: 14,
      elevation: 6,
    },
    effectCircleDefault: {
      backgroundColor: roomGlow,
    },
    effectCircleDraw: {
      backgroundColor: `${decorCheck}33`,
    },
    effectCircleAttack: {
      backgroundColor: `${destructiveBg}cc`,
    },
    effectCircleSkip: {
      backgroundColor: `${decorPlay}33`,
    },
    effectCircleCombo: {
      backgroundColor: `${heroGlowSecondary}33`,
    },
    effectIconWrap: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    effectIcon: {
      color: primaryTextColor,
    },
    tableSeatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: `${playerCurrent}18`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}26`,
    },
    tableSeatAnchor: {
      position: 'absolute',
      width: PLAYER_SEAT_SIZE,
      height: PLAYER_SEAT_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tableSeatRowCurrent: {
      opacity: 1,
      borderColor: `${decorCheck}8f`,
      backgroundColor: `${playerCurrent}66`,
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
      backgroundColor: `${decorCheck}14`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}55`,
    },
    seatAvatarIcon: {
      color: playerIcon,
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
      backgroundColor: decorCheck,
    },
    seatStatusDotOut: {
      backgroundColor: decorAlert,
    },
    seatName: {
      color: heroBadgeText,
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
      backgroundColor: `${decorCheck}24`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorCheck}50`,
      marginHorizontal: 2,
    },
    seatCardBackStacked: {
      marginLeft: 0,
    },
    seatCardCount: {
      color: heroBadgeText,
      fontSize: 11,
      marginLeft: 6,
      fontWeight: '600',
    },
    placeholder: {
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}33`,
    },
    placeholderText: {
      color: heroBadgeText,
    },
    handSection: {
      gap: 12,
    },
    handScroll: handScrollBase,
    handHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    handHeaderControls: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logsList: {
      maxHeight: 260,
      marginTop: 12,
    },
    logsListContent: {
      gap: 12,
      paddingBottom: 8,
    },
    handTitleIcon: {
      color: decorCheck,
    },
    handTitle: {
      color: titleText,
      fontWeight: '700',
      fontSize: 16,
    },
    handStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    handStatusAlive: {
      backgroundColor: statusLobby,
      borderColor: `${decorCheck}66`,
    },
    handStatusOut: {
      backgroundColor: errorBackground,
      borderColor: `${errorText}5c`,
    },
    handStatusText: {
      color: decorCheck,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    handStatusTextOut: {
      color: errorText,
    },
    handScrollContent: {
      flexDirection: 'row',
      alignItems: 'stretch',
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
      color: titleText,
      fontWeight: '800',
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      letterSpacing: 0.8,
      ...handCardTitleShadow,
    },
    handCardOverlayDescription: {
      color: heroBadgeText,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      ...handCardDescriptionShadow,
    },
    handCardCountBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: titleText,
      ...platformShadow({
        color: '#000',
        opacity: 0.6,
        radius: 4,
        offset: { width: 0, height: 2 },
        elevation: 3,
      }),
    },
    handCardCountText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 14,
    },
    handCardMeta: {
      width: '100%',
      alignItems: 'center',
      gap: 4,
      pointerEvents: 'none' as ViewStyle['pointerEvents'],
    },
    handCardPlayable: {
      ...handCardPlayableShadow,
      borderColor: decorCheck,
    },
    handCardGrid: {
      ...handCardShadow,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
      backgroundColor: surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}33`,
      flexShrink: 0,
      overflow: 'hidden',
    },
    handCardDisabled: {
      opacity: 0.65,
    },
    handCardBusy: {
      justifyContent: 'center',
    },
    handCardBusySpinner: {
      color: decorCheck,
    },
    handCardLabel: {
      color: heroBadgeText,
      fontSize: 11,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    handCardHint: {
      color: decorCheck,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    handViewButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}35`,
    },
    handViewButtonActive: {
      backgroundColor: decorCheck,
      borderColor: decorCheck,
    },
    handViewButtonIconActive: {
      color: primaryTextColor,
    },
    handSizeControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      width: 72,
      justifyContent: 'center',
      marginRight: 6,
    },
    handSizeControlsHidden: {
      opacity: 0,
    },
    handSizeButton: {
      width: 28,
      height: 28,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}35`,
    },
    handSizeButtonDisabled: {
      opacity: 0.45,
    },
    handGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingVertical: 6,
      paddingHorizontal: 4,
      justifyContent: 'flex-start',
      alignContent: 'flex-start',
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
      borderColor: `${decorPlay}55`,
    },
    comboModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: titleText,
    },
    comboModalDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: heroBadgeText,
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
      borderColor: `${decorPlay}40`,
      alignItems: 'center',
    },
    comboModeButtonSelected: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    comboModeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: heroBadgeText,
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
      color: titleText,
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
      borderColor: `${decorPlay}40`,
    },
    comboOptionButtonSelected: {
      backgroundColor: primaryBgColor,
      borderColor: primaryBgColor,
    },
    comboOptionLabel: {
      fontSize: 14,
      color: heroBadgeText,
    },
    comboOptionLabelSelected: {
      color: primaryTextColor,
    },
    comboEmptyText: {
      fontSize: 14,
      color: heroBadgeText,
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
      color: heroBadgeText,
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
      borderColor: `${decorPlay}40`,
      backgroundColor: raised,
      alignItems: 'center',
    },
    handEmptyText: {
      color: heroBadgeText,
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
      color: decorCheck,
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
      color: heroBadgeText,
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
      color: heroBadgeText,
      fontWeight: '600',
    },
    logsEmptyText: {
      color: heroBadgeText,
      fontSize: 12,
      fontStyle: 'italic',
    },
    logRow: {
      flexDirection: 'row',
      gap: 10,
    },
    logTimestamp: {
      color: heroBadgeText,
      fontSize: 11,
      width: 52,
      fontVariant: ['tabular-nums'],
    },
    logMessage: {
      flex: 1,
      color: titleText,
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
      color: titleText,
      fontWeight: '600',
      fontSize: 12,
    },
    logScopeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}44`,
    },
    logScopeBadgeText: {
      color: heroBadgeText,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    logMessageText: {
      color: heroBadgeText,
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
      color: titleText,
      fontSize: 13,
    },
    logsInputPlaceholder: {
      color: heroBadgeText,
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
      color: titleText,
      fontWeight: '600',
      fontSize: 12,
    },
    checkboxHint: {
      color: heroBadgeText,
      fontSize: 11,
    },
  });
}
