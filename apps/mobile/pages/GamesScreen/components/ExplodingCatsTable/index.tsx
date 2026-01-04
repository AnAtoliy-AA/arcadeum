import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  useHorizontalDragScroll,
  useVerticalDragScroll,
} from '@/hooks/useDragScroll';
import { useTranslation } from '@/lib/i18n';

// Import local modules
import { CARD_ART_SETTINGS } from './constants';
import type {
  ExplodingCatsTableProps,
  ChatScope,
  ExplodingCatsLogEntry,
  ExplodingCatsCard,
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
} from './hooks';
import {
  GameHeader,
  TableStats,
  HandView,
  GameLogs,
  CatComboModal,
  CardDecor,
  DefuseModal,
  GiveFavorModal,
  TableCenter,
} from './components';
import { createStyles } from './styles';

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
  onPlayNope,
  onPlayFavor,
  onGiveFavorCard,
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
    ? (CARD_ART_SETTINGS[discardTop] ?? CARD_ART_SETTINGS.exploding_cat)
    : null;

  const isSessionActive = session?.status === 'active';
  const isSessionCompleted = session?.status === 'completed';
  const canDraw =
    isSessionActive &&
    isMyTurn &&
    (selfPlayer?.alive ?? false) &&
    pendingDraws > 0;
  const hasSkip = (selfPlayer?.hand ?? []).includes('skip');
  const hasAttack = (selfPlayer?.hand ?? []).includes('attack');
  const hasNope = (selfPlayer?.hand ?? []).includes('nope');
  const hasSeeTheFuture = (selfPlayer?.hand ?? []).includes('see_the_future');
  const hasShuffle = (selfPlayer?.hand ?? []).includes('shuffle');
  const canPlaySkip =
    isSessionActive && isMyTurn && hasSkip && (selfPlayer?.alive ?? false);
  const canPlayAttack =
    isSessionActive && isMyTurn && hasAttack && (selfPlayer?.alive ?? false);
  const canPlaySeeTheFuture =
    isSessionActive &&
    isMyTurn &&
    hasSeeTheFuture &&
    (selfPlayer?.alive ?? false);
  const canPlayShuffle =
    isSessionActive && isMyTurn && hasShuffle && (selfPlayer?.alive ?? false);
  // Nope can be played anytime when there's a pending action (handled by backend)
  // For now, show button if player has nope and is in an active session
  const canPlayNope =
    isSessionActive && hasNope && (selfPlayer?.alive ?? false);
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

  const labels = useGameLabels(
    t,
    session,
    room ?? undefined,
    isHost,
    pendingDraws,
  );

  const formatLogMessage = (message: string) => {
    if (!message) {
      return message;
    }
    let next = message;

    // Handle seeTheFuture.reveal:cards:card1,cards:card2,cards:card3 format
    if (next.startsWith('seeTheFuture.reveal:')) {
      const cardKeysStr = next.slice('seeTheFuture.reveal:'.length);
      const cardKeys = cardKeysStr.split(',');
      const translatedCards = cardKeys.map((key) => {
        // key format is "cards:card_type"
        if (key.startsWith('cards:')) {
          const cardType = key.slice('cards:'.length);
          return labels.translateCardName(cardType as ExplodingCatsCard);
        }
        return key;
      });
      return `${t('games.table.cards.seeTheFuture')} 🔮: ${translatedCards.join(', ')}`;
    }

    // Replace player IDs with display names
    playerNameMap.forEach((displayName, playerId) => {
      if (playerId && displayName && playerId !== displayName) {
        next = next.split(playerId).join(displayName);
      }
    });
    return next;
  };

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

  const pendingFavor = snapshot?.pendingFavor ?? null;
  const mustGiveFavor =
    !!currentUserId && pendingFavor?.targetId === currentUserId;
  const favorRequesterName = pendingFavor?.requesterId
    ? (playerNameMap.get(pendingFavor.requesterId) ?? 'Player')
    : 'Player';
  const giveFavorModal = (
    <GiveFavorModal
      visible={mustGiveFavor && !actionBusy}
      requesterName={favorRequesterName}
      myHand={selfPlayer?.hand ?? []}
      onGiveCard={onGiveFavorCard}
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
        {giveFavorModal}
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
      {giveFavorModal}
    </>
  );
}

export type { ChatScope };
