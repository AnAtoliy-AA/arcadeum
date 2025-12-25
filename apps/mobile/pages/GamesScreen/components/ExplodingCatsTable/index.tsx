import React, { useMemo, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ExplodingCatsCard as ExplodingCatsArtwork } from '@/components/cards';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  useHorizontalDragScroll,
  useVerticalDragScroll,
} from '@/hooks/useDragScroll';
import { useTranslation } from '@/lib/i18n';

// Import local modules
import type {
  ExplodingCatsTableProps,
  LogVisibility,
  ExplodingCatsLogEntry,
} from './types';
import { CARD_ART_SETTINGS } from './constants';
import {
  useGameState,
  useCardAnimations,
  useCatCombo,
  useTableLayout,
  useGridColumns,
  useGameLabels,
  useMessageHandling,
  useCatComboHandling,
  useHandCardRenderer,
} from './hooks';
import {
  GameHeader,
  PlayerSeat,
  TableStats,
  HandView,
  GameLogs,
  CatComboModal,
  CardDecor,
  DefuseModal,
} from './components';
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
  onPlayDefuse,
  onPostHistoryNote,
  fullScreen = false,
  tableOnly = false,
}: ExplodingCatsTableProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const showHeader = !tableOnly;
  const showStats = !tableOnly;
  const showHandHeader = fullScreen || !tableOnly;
  const showLogs = true;

  // State management
  const [handViewMode, setHandViewMode] = useState<'row' | 'grid'>('row');

  // Custom hooks
  const gameState = useGameState(session, currentUserId);
  const animations = useCardAnimations(actionBusy);
  const catCombo = useCatCombo(
    gameState.selfPlayer?.hand,
    gameState.otherPlayers.filter((p) => p.alive),
  );

  const layout = useTableLayout(styles);
  const gridColumns = useGridColumns(
    layout.maxColumnsByWidth,
    layout.gridContainerWidth,
    layout.handGridSpacing,
  );

  const {
    snapshot,
    otherPlayers,
    selfPlayer,
    playerNameMap,
    tableSeats,
    deckCount,
    discardTop,
    pendingDraws,
    isMyTurn,
  } = gameState;

  const pendingDefuse = snapshot?.pendingDefuse ?? null;
  const mustDefuse = pendingDefuse === currentUserId;

  const handleDefuseConfirm = (position: number) => {
    onPlayDefuse(position);
  };

  const gridCardWidth = gridColumns.gridCardDimensions.width;
  const gridCardHeight = gridColumns.gridCardDimensions.height;

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
      (entry: ExplodingCatsLogEntry) =>
        entry.scope !== 'players' || isCurrentUserPlayer,
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

  const formatLogMessage = (message: string) => {
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
  };

  const labels = useGameLabels(
    t,
    session,
    room ?? undefined,
    isHost,
    pendingDraws,
  );
  const messageHandling = useMessageHandling(
    session?.id,
    isCurrentUserPlayer,
    onPostHistoryNote as
      | ((message: string, visibility: LogVisibility) => Promise<void>)
      | undefined,
  );
  const catComboHandling = useCatComboHandling(
    catCombo,
    actionBusy,
    onPlayCatCombo as (params: {
      cat: string;
      mode: 'pair' | 'trio';
      targetPlayerId: string;
      desiredCard?: string;
    }) => void,
  );
  const renderHandCard = useHandCardRenderer(
    isSessionActive,
    isMyTurn,
    selfPlayer?.alive ?? false,
    canPlaySkip,
    canPlayAttack,
    actionBusy,
    gridCardWidth,
    gridCardHeight,
    animations,
    catCombo,
    t,
    labels.translateCardName,
    labels.translateCardDescription,
    onPlay,
    styles,
  );

  const activeEffect = animations.activeEffect;

  const tableContent = (
    <>
      {showHeader ? (
        <GameHeader
          statusLabel={labels.statusLabel}
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
                      ? labels.translateCardName(discardTop)
                      : t('games.table.info.empty')}
                  </ThemedText>
                </View>
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
                pendingDraws={labels.pendingDrawsLabel}
                pendingDrawsCaption={labels.pendingDrawsCaption}
                deckPulseScale={animations.deckPulseScale}
                styles={styles}
              />
            ) : null}
          </View>

          <HandView
            selfPlayer={selfPlayer}
            handViewMode={handViewMode}
            onViewModeChange={setHandViewMode}
            gridColumns={gridColumns.gridColumns}
            onGridColumnsChange={gridColumns.handleGridColumnsChange}
            maxColumnsByWidth={layout.maxColumnsByWidth}
            showHandHeader={showHandHeader}
            canDraw={canDraw}
            canPlaySkip={canPlaySkip}
            canPlayAttack={canPlayAttack}
            actionBusy={actionBusy}
            onDraw={onDraw}
            onPlay={onPlay}
            renderHandCard={renderHandCard}
            handScrollRef={handScrollRef}
            gridContainerWidth={layout.gridContainerWidth}
            onGridContainerLayout={layout.setGridContainerWidth}
            styles={styles}
          />
        </>
      ) : (
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            {labels.placeholderText}
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
          messageDraft={messageHandling.messageDraft}
          onMessageChange={messageHandling.setMessageDraft}
          messageVisibility={messageHandling.messageVisibility}
          onVisibilityToggle={messageHandling.toggleMessageVisibility}
          historySending={messageHandling.historySending}
          canSendHistoryMessage={messageHandling.canSendHistoryMessage}
          onSend={messageHandling.handleSendHistoryNote}
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
      catComboBusy={catComboHandling.catComboBusy}
      comboConfirmDisabled={catComboHandling.comboConfirmDisabled}
      onClose={catCombo.closeCatComboPrompt}
      onModeChange={catCombo.handleCatComboModeChange}
      onTargetChange={catCombo.handleCatComboTargetChange}
      onDesiredCardChange={catCombo.handleCatComboDesiredCardChange}
      onConfirm={catComboHandling.handleConfirmCatCombo}
      translateCardName={labels.translateCardName}
      styles={styles}
    />
  );

  const defuseModal = (
    <DefuseModal
      visible={mustDefuse && !actionBusy}
      deckSize={deckCount}
      onConfirm={handleDefuseConfirm}
    />
  );

  if (fullScreen) {
    return (
      <>
        <ThemedView style={[styles.card, styles.cardFullScreen]}>
          <CardDecor
            gradientColors={layout.cardGradientColors}
            gradientCoords={layout.cardGradientCoords}
            styles={styles}
          />
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
        {defuseModal}
      </>
    );
  }

  return (
    <>
      <ThemedView style={styles.card}>
        <CardDecor
          gradientColors={layout.cardGradientColors}
          gradientCoords={layout.cardGradientCoords}
          styles={styles}
        />
        <ScrollView
          style={
            layout.cardScrollStyle as import('react-native').StyleProp<
              import('react-native').ViewStyle
            >
          }
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
      {defuseModal}
    </>
  );
}
