import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  ExplodingCatsCard as ExplodingCatsArtwork,
} from '@/components/cards';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  useHorizontalDragScroll,
  useVerticalDragScroll,
} from '@/hooks/useDragScroll';
import { useTranslation } from '@/lib/i18n';
import { getRoomStatusLabel } from '../../roomUtils';
import type { GameRoomSummary } from '../../api/gamesApi';

// Import local modules
import type {
  ExplodingCatsTableProps,
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  ExplodingCatsLogEntry,
  LogVisibility,
} from './types';
import {
  TABLE_DIAMETER,
  CARD_ART_SETTINGS,
  CARD_GRADIENT_COORDS,
  CARD_ASPECT_RATIO,
  GRID_CARD_MIN_WIDTH,
  DEFAULT_GRID_COLUMNS,
  MIN_GRID_COLUMNS,
  MAX_GRID_COLUMNS,
  CAT_COMBO_CARDS,
  PLAYER_SEAT_SIZE,
} from './constants';
import {
  getCardTranslationKey,
  getCardDescriptionKey,
  getSessionStatusTranslationKey,
} from './utils';
import { useGameState } from './hooks/useGameState';
import { useCardAnimations } from './hooks/useCardAnimations';
import { useCatCombo } from './hooks/useCatCombo';
import { GameHeader } from './components/GameHeader';
import { PlayerSeat } from './components/PlayerSeat';
import { TableStats } from './components/TableStats';
import { HandCard } from './components/HandCard';
import { HandView } from './components/HandView';
import { GameLogs } from './components/GameLogs';
import { CatComboModal } from './components/CatComboModal';
import { createStyles } from './styles';

const ACCESSIBILITY_DISABLED_PROPS: { accessible?: boolean } =
  Platform.OS === 'web' ? {} : { accessible: false };

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

  // State management
  const [messageDraft, setMessageDraft] = useState('');
  const [messageVisibility, setMessageVisibility] =
    useState<LogVisibility>('all');
  const [historySending, setHistorySending] = useState(false);
  const [handViewMode, setHandViewMode] = useState<'row' | 'grid'>('row');
  const [gridColumns, setGridColumns] = useState<number>(DEFAULT_GRID_COLUMNS);
  const [gridContainerWidth, setGridContainerWidth] = useState<number>(0);

  // Custom hooks
  const gameState = useGameState(session, currentUserId);
  const animations = useCardAnimations(actionBusy);
  const catCombo = useCatCombo(
    gameState.selfPlayer?.hand,
    gameState.otherPlayers.filter((p) => p.alive),
  );

  const {
    snapshot,
    players,
    otherPlayers,
    selfPlayer,
    playerNameMap,
    tableSeats,
    deckCount,
    discardTop,
    pendingDraws,
    isMyTurn,
  } = gameState;

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

  const selfPlayerHandSize = selfPlayer?.hand?.length ?? 0;
  const handScrollRef = useHorizontalDragScroll<ScrollView>({
    dependencyKey: `${handViewMode}-${selfPlayerHandSize}`,
  });

  const discardArt = discardTop
    ? (CARD_ART_SETTINGS[discardTop] ?? CARD_ART_SETTINGS.exploding_cat)
    : null;
  const discardArtVariant = discardArt ? discardArt.variant : 1;

  const isSessionActive = session?.status === 'active';
  const isSessionCompleted = session?.status === 'completed';
  const canDraw =
    isSessionActive &&
    isMyTurn &&
    (selfPlayer?.alive ?? false) &&
    pendingDraws > 0;
  const hasSkip = (selfPlayer?.hand ?? []).includes('skip');
  const hasAttack = (selfPlayer?.hand ?? []).includes('attack');
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

  useEffect(() => {
    setMessageDraft('');
    setMessageVisibility('all');
    setHistorySending(false);
  }, [session?.id]);

  const catComboBusy = actionBusy === 'cat_pair' || actionBusy === 'cat_trio';

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

  const handleConfirmCatCombo = useCallback(() => {
    if (!catCombo.catComboPrompt || !catCombo.catComboPrompt.mode) {
      return;
    }

    if (!catCombo.catComboPrompt.targetPlayerId) {
      return;
    }

    if (catCombo.catComboPrompt.mode === 'pair') {
      onPlayCatCombo({
        cat: catCombo.catComboPrompt.cat,
        mode: 'pair',
        targetPlayerId: catCombo.catComboPrompt.targetPlayerId,
      });
      catCombo.closeCatComboPrompt();
      return;
    }

    if (!catCombo.catComboPrompt.desiredCard) {
      return;
    }

    onPlayCatCombo({
      cat: catCombo.catComboPrompt.cat,
      mode: 'trio',
      targetPlayerId: catCombo.catComboPrompt.targetPlayerId,
      desiredCard: catCombo.catComboPrompt.desiredCard,
    });
    catCombo.closeCatComboPrompt();
  }, [catCombo, onPlayCatCombo]);

  const comboConfirmDisabled = !catCombo.catComboPrompt
    ? true
    : catComboBusy ||
      !catCombo.catComboPrompt.mode ||
      !catCombo.catComboPrompt.targetPlayerId ||
      (catCombo.catComboPrompt.mode === 'trio' && !catCombo.catComboPrompt.desiredCard);

  const renderHandCard = useCallback(
    (card: ExplodingCatsCard, index: number, count: number, mode: 'row' | 'grid' = 'row') => {
      const cardKey = `${card}-${index}`;
      const quickAction = card === 'skip' ? 'skip' : card === 'attack' ? 'attack' : null;
      const isCatCard = CAT_COMBO_CARDS.includes(card as ExplodingCatsCatCard);
      const comboAvailability = isCatCard
        ? catCombo.catComboAvailability[card as ExplodingCatsCatCard]
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

      const isAnimating = animations.animatingCardKey === cardKey;
      const isGrid = mode === 'grid';
      const cardWidth = isGrid ? gridCardWidth : 148;
      const cardHeight = isGrid ? gridCardHeight : 228;

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
        if (!isPlayable || isBusy || animations.animatingCardKey !== null) {
          return;
        }

        const execute = () => {
          if (quickAction) {
            onPlay(quickAction);
            return;
          }

          if (isCatCard) {
            catCombo.openCatComboPrompt(card as ExplodingCatsCatCard);
          }
        };

        animations.triggerCardAnimation(cardKey, execute);
      };

      return (
        <HandCard
          key={cardKey}
          card={card}
          index={index}
          count={count}
          mode={mode}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          isPlayable={isPlayable}
          isBusy={isBusy}
          isAnimating={isAnimating}
          animationScale={animations.cardPressScale}
          actionHint={actionHint}
          comboHint={comboHint}
          translateCardName={translateCardName}
          translateCardDescription={translateCardDescription}
          onPress={handlePress}
          styles={styles}
        />
      );
    },
    [
      actionBusy,
      animations,
      canPlayAttack,
      canPlaySkip,
      catCombo,
      catComboBusy,
      gridCardHeight,
      gridCardWidth,
      isMyTurn,
      isSessionActive,
      onPlay,
      selfPlayer?.alive,
      t,
      translateCardDescription,
      translateCardName,
      styles,
    ],
  );

  const handleGridColumnsChange = useCallback((delta: number) => {
    setGridColumns((value) =>
      delta > 0
        ? Math.min(maxColumnsByWidth, Math.min(MAX_GRID_COLUMNS, value + 1))
        : Math.max(MIN_GRID_COLUMNS, value - 1),
    );
  }, [maxColumnsByWidth]);

  const activeEffect = animations.activeEffect;
  const innerDiameter = Math.max(TABLE_DIAMETER - PLAYER_SEAT_SIZE - 20, 180);

  const tableContent = (
    <>
      {showHeader ? (
        <GameHeader
          statusLabel={statusLabel}
          isCompleted={isSessionCompleted}
          styles={styles}
        />
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
                        opacity: animations.effectOpacity,
                        transform: [
                          { scale: animations.effectScale },
                          {
                            rotate: animations.effectRotate.interpolate({
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
                  <PlayerSeat
                    key={seat.player.playerId}
                    player={seat.player}
                    position={seat.position}
                    isCurrent={isCurrent}
                    styles={styles}
                  />
                );
              })}
            </View>
            {showStats ? (
              <TableStats
                deckCount={deckCount}
                pendingDraws={pendingDrawsLabel}
                pendingDrawsCaption={pendingDrawsCaption}
                deckPulseScale={animations.deckPulseScale}
                styles={styles}
              />
            ) : null}
          </View>

          <HandView
            selfPlayer={selfPlayer}
            handViewMode={handViewMode}
            onViewModeChange={setHandViewMode}
            gridColumns={gridColumns}
            onGridColumnsChange={handleGridColumnsChange}
            maxColumnsByWidth={maxColumnsByWidth}
            showHandHeader={showHandHeader}
            canDraw={canDraw}
            canPlaySkip={canPlaySkip}
            canPlayAttack={canPlayAttack}
            actionBusy={actionBusy}
            onDraw={onDraw}
            onPlay={onPlay}
            renderHandCard={renderHandCard}
            handScrollRef={handScrollRef}
            gridContainerWidth={gridContainerWidth}
            onGridContainerLayout={setGridContainerWidth}
            styles={styles}
          />
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
        <GameLogs
          logs={logs}
          isCurrentUserPlayer={isCurrentUserPlayer}
          messageDraft={messageDraft}
          onMessageChange={setMessageDraft}
          messageVisibility={messageVisibility}
          onVisibilityToggle={toggleMessageVisibility}
          historySending={historySending}
          canSendHistoryMessage={canSendHistoryMessage}
          onSend={handleSendHistoryNote}
          formatLogMessage={formatLogMessage}
          logsScrollRef={logsScrollRef}
          currentUserId={currentUserId}
          playerNameMap={playerNameMap}
          styles={styles}
        />
      ) : null}
    </>
  );

  const comboModal = (
    <CatComboModal
      catComboPrompt={catCombo.catComboPrompt}
      aliveOpponents={otherPlayers.filter((p) => p.alive)}
      catComboBusy={catComboBusy}
      comboConfirmDisabled={comboConfirmDisabled}
      onClose={catCombo.closeCatComboPrompt}
      onModeChange={catCombo.handleCatComboModeChange}
      onTargetChange={catCombo.handleCatComboTargetChange}
      onDesiredCardChange={catCombo.handleCatComboDesiredCardChange}
      onConfirm={handleConfirmCatCombo}
      translateCardName={translateCardName}
      styles={styles}
    />
  );

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
