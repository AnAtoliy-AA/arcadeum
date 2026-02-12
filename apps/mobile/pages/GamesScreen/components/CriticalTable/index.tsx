import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  useHorizontalDragScroll,
  useVerticalDragScroll,
} from '@/hooks/useDragScroll';
import { useTranslation } from '@/lib/i18n';
import { useSettings } from '@/stores/settings';

// Import local modules
import { CARD_ART_SETTINGS } from './constants';
import type {
  CriticalTableProps,
  ChatScope,
  CriticalCatComboInput,
} from './types';
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
  useGameHaptics,
  useActionPermissions,
  useGameLogs,
  useIdleTimer,
} from './hooks';
import {
  GameHeader,
  TableStats,
  HandView,
  GameLogs,
  CardDecor,
  TableCenter,
  AutoplayControls,
  CriticalModals,
  IdleTimerDisplay,
  GamePlaceholder,
} from './components';
import { createStyles } from './styles';

export function CriticalTable({
  room,
  session,
  currentUserId,
  actionBusy,
  startBusy,
  isHost,
  onStart,
  onDraw,
  onPlay,
  onPlayNope,
  onPlayFavor,
  onGiveFavorCard,
  onPlaySeeTheFuture,
  onPlayCatCombo,
  onPlayDefuse,
  onPostHistoryNote,
  fullScreen = false,
  tableOnly = false,
  roomName,
  idleTimerEnabled = false,
  cardVariant,
}: CriticalTableProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const showHeader = !tableOnly;
  const showStats = !tableOnly;
  const showHandHeader = fullScreen || !tableOnly;
  const showLogs = true;

  // State management
  const { hapticsEnabled } = useSettings();
  const [handViewMode, setHandViewMode] = useState<'row' | 'grid'>('row');
  const [targetedActionPrompt, setTargetedActionPrompt] = useState<{
    card: import('./types').CriticalCard;
  } | null>(null);
  const [idleTimerTriggered, setIdleTimerTriggered] = useState(false);

  // Custom hooks
  const gameState = useGameState(session, currentUserId);
  const animations = useCardAnimations(actionBusy);
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

  const allowActionCardCombos = snapshot?.allowActionCardCombos ?? false;

  const catCombo = useCatCombo(
    gameState.selfPlayer?.hand,
    gameState.otherPlayers.filter((p) => p.alive),
    allowActionCardCombos,
  );

  const layout = useTableLayout(styles);
  const gridColumns = useGridColumns(
    layout.maxColumnsByWidth,
    layout.gridContainerWidth,
    layout.handGridSpacing,
  );

  // Haptic feedback for turn
  useGameHaptics({ isMyTurn, enabled: hapticsEnabled });

  // Idle timer for auto-enabling autoplay
  const handleIdleTimeout = React.useCallback(() => {
    setIdleTimerTriggered(true);
  }, []);

  const handleStopAutoplay = React.useCallback(() => {
    setIdleTimerTriggered(false);
  }, []);

  const handleAutoplayEnabledChange = React.useCallback((enabled: boolean) => {
    if (!enabled) {
      setIdleTimerTriggered(false);
    }
  }, []);

  const pendingDefuse = snapshot?.pendingDefuse ?? null;
  const mustDefuse = !!currentUserId && pendingDefuse === currentUserId;

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
    ? (CARD_ART_SETTINGS[discardTop] ?? CARD_ART_SETTINGS.critical_event)
    : null;

  const {
    isSessionActive,
    isSessionCompleted,
    canDraw,
    canPlaySkip,
    canPlayAttack,
    canPlaySeeTheFuture,
    canPlayShuffle,
    canPlayNope,
    canStart,
    isCurrentUserPlayer,
  } = useActionPermissions({
    session,
    snapshot,
    selfPlayer: selfPlayer ?? undefined,
    isMyTurn,
    isHost,
    pendingDraws,
  });

  // Idle timer hook (after canDraw is defined)
  const idleTimer = useIdleTimer({
    enabled: idleTimerEnabled,
    isMyTurn,
    canAct: canDraw,
    onTimeout: handleIdleTimeout,
  });

  const labels = useGameLabels(
    t,
    session,
    room ?? undefined,
    isHost,
    pendingDraws,
  );

  const { logs, formatLogMessage } = useGameLogs({
    snapshot,
    isCurrentUserPlayer,
    playerNameMap,
    t: t as (key: string) => string,
    translateCardName: labels.translateCardName,
  });

  const logsScrollRef = useVerticalDragScroll<ScrollView>({
    dependencyKey: logs.length,
  });

  const messageHandling = useMessageHandling(
    session?.id,
    isCurrentUserPlayer,
    onPostHistoryNote as
      | ((message: string, visibility: ChatScope) => Promise<void>)
      | undefined,
  );
  const catComboHandling = useCatComboHandling(
    catCombo,
    actionBusy,
    onPlayCatCombo as (params: CriticalCatComboInput) => void,
  );

  const handlePlayTargetedAction = (card: import('./types').CriticalCard) => {
    setTargetedActionPrompt({ card });
  };

  const handleConfirmTargetedAction = (targetPlayerId: string) => {
    if (targetedActionPrompt) {
      onPlay(targetedActionPrompt.card as 'targeted_strike', {
        targetPlayerId,
      });
      setTargetedActionPrompt(null);
    }
  };

  const renderHandCard = useHandCardRenderer(
    isSessionActive,
    isMyTurn,
    selfPlayer?.alive ?? false,
    canPlaySkip,
    canPlayAttack,
    canPlaySeeTheFuture,
    canPlayShuffle,
    actionBusy,
    gridCardWidth,
    gridCardHeight,
    animations,
    catCombo,
    t,
    labels.translateCardName,
    labels.translateCardDescription,
    onPlay,
    onPlaySeeTheFuture,
    handlePlayTargetedAction,
    styles,
    cardVariant,
  );

  const activeEffect = animations.activeEffect;

  const pendingFavor = snapshot?.pendingFavor ?? null;
  const mustGiveFavor =
    !!currentUserId && pendingFavor?.targetId === currentUserId;
  const favorRequesterName = pendingFavor?.requesterId
    ? (playerNameMap.get(pendingFavor.requesterId) ?? 'Player')
    : 'Player';

  const tableContent = (
    <>
      {showHeader ? (
        <GameHeader
          statusLabel={labels.statusLabel}
          isCompleted={session?.status === 'completed'}
          styles={styles}
          roomName={roomName}
          idleTimerEnabled={idleTimerEnabled}
        />
      ) : null}

      {snapshot ? (
        <>
          <View style={styles.tableSection}>
            <View style={styles.tableRing}>
              <TableCenter
                discardTop={discardTop}
                discardArt={discardArt}
                activeEffect={activeEffect}
                animations={animations}
                tableSeats={tableSeats}
                isSessionActive={isSessionActive}
                isSessionCompleted={isSessionCompleted}
                translateCardName={labels.translateCardName}
                emptyLabel={t('games.table.info.empty')}
                styles={styles}
              />
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
            canPlayNope={canPlayNope}
            canPlaySeeTheFuture={canPlaySeeTheFuture}
            actionBusy={actionBusy}
            onDraw={onDraw}
            onPlay={onPlay}
            onPlayNope={onPlayNope}
            onPlaySeeTheFuture={onPlaySeeTheFuture}
            renderHandCard={renderHandCard}
            handScrollRef={handScrollRef}
            gridContainerWidth={layout.gridContainerWidth}
            onGridContainerLayout={layout.setGridContainerWidth}
            styles={styles}
          />

          {idleTimerEnabled && selfPlayer?.alive && (
            <IdleTimerDisplay
              secondsRemaining={idleTimer.secondsRemaining}
              isActive={idleTimer.isActive}
              autoplayTriggered={idleTimerTriggered}
              onStop={handleStopAutoplay}
              t={t as (key: string, params?: Record<string, unknown>) => string}
            />
          )}

          {selfPlayer?.alive && (
            <AutoplayControls
              isMyTurn={isMyTurn}
              canAct={canDraw}
              canPlayNope={canPlayNope}
              hand={selfPlayer.hand}
              logs={snapshot?.logs ?? []}
              pendingAction={snapshot?.pendingAction ?? null}
              pendingFavor={snapshot?.pendingFavor ?? null}
              pendingDefuse={pendingDefuse}
              deckSize={deckCount}
              playerOrder={snapshot?.playerOrder ?? []}
              currentUserId={currentUserId}
              t={t as (key: string) => string}
              onDraw={onDraw}
              onPlayActionCard={onPlay}
              onPlayNope={onPlayNope}
              onGiveFavorCard={onGiveFavorCard}
              onPlayDefuse={onPlayDefuse}
              forceEnableAutoplay={idleTimerTriggered}
              onAutoplayEnabledChange={handleAutoplayEnabledChange}
            />
          )}
        </>
      ) : (
        <GamePlaceholder
          placeholderText={labels.placeholderText}
          canStart={canStart}
          startBusy={startBusy}
          onStart={onStart}
          t={t as (key: string) => string}
          styles={styles}
        />
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

  const modals = (
    <CriticalModals
      catComboPrompt={catCombo.catComboPrompt}
      aliveOpponents={otherPlayers.filter((p) => p.alive)}
      catComboBusy={catComboHandling.catComboBusy}
      comboConfirmDisabled={catComboHandling.comboConfirmDisabled}
      onCloseCatCombo={catCombo.closeCatComboPrompt}
      onModeChange={catCombo.handleCatComboModeChange}
      onTargetChange={catCombo.handleCatComboTargetChange}
      onDesiredCardChange={catCombo.handleCatComboDesiredCardChange}
      onConfirmCatCombo={catComboHandling.handleConfirmCatCombo}
      translateCardName={labels.translateCardName}
      styles={styles}
      mustDefuse={mustDefuse}
      actionBusy={actionBusy}
      deckCount={deckCount}
      onConfirmDefuse={handleDefuseConfirm}
      mustGiveFavor={mustGiveFavor}
      favorRequesterName={favorRequesterName}
      myHand={selfPlayer?.hand ?? []}
      onGiveFavorCard={onGiveFavorCard}
      targetedActionPrompt={targetedActionPrompt}
      otherPlayers={otherPlayers}
      onCloseTargetedAction={() => setTargetedActionPrompt(null)}
      onConfirmTargetedAction={handleConfirmTargetedAction}
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
        {modals}
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
      {modals}
    </>
  );
}

export type { ChatScope };
export type { CriticalActionCard } from './types';
