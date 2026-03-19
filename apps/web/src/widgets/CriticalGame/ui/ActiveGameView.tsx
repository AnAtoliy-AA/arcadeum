'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useGameChatStore, useLatestChatMessage, ChatMessagePopup } from '@/widgets/GameChat';
import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  CriticalCard,
  HandLayoutMode,
  CriticalPlayerState,
  GameRoomSummary,
  CriticalSnapshot,
} from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import { useDisplayNames } from '../lib/displayUtils';
import {
  useCriticalModals,
  useWebGameHaptics,
  useSeeTheFutureFromLogs,
  useOmniscienceFromLogs,
  useGameAutoplayIntegration,
  useTurnStatus,
} from '../hooks';
import { useGameHandlers } from '../hooks/useGameHandlers';
import { GameModals } from './GameModals';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { GameStatusMessage } from './GameStatusMessage';
import { ActiveGameContent } from './ActiveGameContent';
import { CriticalGameHeader } from './CriticalGameHeader';
import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';
import type { RematchInvitation } from '../hooks/useRematch';

interface ActiveGameViewProps {
  currentUserId: string | null;
  room: GameRoomSummary;
  snapshot: CriticalSnapshot;
  isHost: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  // From useCriticalState
  actionBusy: string | null;
  actions: UseGameActionsReturn;
  currentPlayer: CriticalPlayerState | null;
  currentTurnPlayer: CriticalPlayerState | undefined;
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  aliveOpponents: CriticalPlayerState[];
  isGameOver: boolean;
  // Rematch props
  rematch: {
    rematchLoading: boolean;
    showRematchModal: boolean;
    openRematchModal: () => void;
    closeRematchModal: () => void;
    handleRematch: (
      participantIds: string[],
      message?: string,
    ) => Promise<void>;
    invitation: RematchInvitation | null;
    invitationTimeLeft: number;
    handleAcceptInvitation: () => void;
    handleDeclineInvitation: () => void;
    isAcceptingInvitation: boolean;
    handleReinvite: (userIds: string[]) => void;
    handleBlockRematch: (roomId: string) => void;
    handleBlockUser: (userId: string) => void;
  };
}

export function ActiveGameView({
  currentUserId,
  room,
  snapshot,
  isHost,
  isFullscreen,
  toggleFullscreen,
  actionBusy,
  actions,
  currentPlayer,
  currentTurnPlayer,
  isMyTurn,
  canAct,
  canPlayNope,
  aliveOpponents,
  isGameOver,
  rematch,
}: ActiveGameViewProps) {
  const { t } = useTranslation();

  // Layout State
  const [handLayout, setHandLayout] = useState<HandLayoutMode>('grid');
  const cardVariant = room.gameOptions?.cardVariant;

  // Sync modal dismissal state with game over state
  const [modalDismissed, setModalDismissed] = useState(false);
  const [prevIsGameOver, setPrevIsGameOver] = useState(isGameOver);

  // Reset modal dismissal when game over state changes (e.g. new game starts or current game ends)
  if (isGameOver !== prevIsGameOver) {
    setPrevIsGameOver(isGameOver);
    setModalDismissed(false);
  }

  const showResultModal = isGameOver && !modalDismissed;

  useWebGameHaptics(isMyTurn);

  const {
    eventComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedDiscardCard,
    selectedFiverCards,
    setSelectedMode,
    setSelectedTarget,
    setSelectedCard,
    setSelectedIndex,
    setSelectedDiscardCard,
    handleOpenEventCombo,
    handleCloseEventComboModal,
    handleSelectComboCard,
    handleToggleFiverCard,
    favorModal,
    handleOpenFavorModal,
    handleCloseFavorModal,
    handleConfirmFavor,
    targetedAttackModal,
    setTargetedAttackModal,
    seeTheFutureModal,
    handleCloseSeeTheFutureModal,
    stashModal,
    handleCloseStashModal,
    markModal,
    handleCloseMarkModal,
    stealDrawModal,
    handleCloseStealDrawModal,
    smiteModal,
    handleCloseSmiteModal,
    omniscienceModal,
    handleCloseOmniscienceModal,
  } = useCriticalModals({
    playFavor: actions.playFavor,
  });

  // Sync logs to gameChatStore
  useEffect(() => {
    useGameChatStore.getState().setLogs(snapshot?.logs ?? []);
  }, [snapshot?.logs]);

  // Register sendMessage on mount, clear on unmount
  useEffect(() => {
    useGameChatStore.getState().registerSendMessage(actions.postHistoryNote);
    return () => useGameChatStore.getState().clear();
  }, [actions.postHistoryNote]);

  const { latestMessage, dismiss: dismissPopup } = useLatestChatMessage(
    snapshot?.logs ?? [],
  );

  // Monitor logs for seeTheFuture.reveal and omniscience.reveal entries
  useSeeTheFutureFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setSeeTheFutureModal: (_val: unknown) => {
      // Compatibility if needed, but useCriticalModals should handle it
    },
  });
  useOmniscienceFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setOmniscienceModal: (_val: unknown) => {
      // Compatibility
    },
  });

  const youLabel = t('games.table.players.you');
  const seeTheFutureLabel = t('games.table.cards.insight');
  const translateCardType = useCallback(
    (cardType: CriticalCard) => t(getCardTranslationKey(cardType, cardVariant)),
    [t, cardVariant],
  );
  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room,
    snapshot,
    youLabel,
    translateCardType,
    seeTheFutureLabel,
  });

  const gameHandlers = useGameHandlers({
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedFiverCards,
    selectedDiscardCard,
    eventComboModal,
    currentPlayerHand: currentPlayer?.hand ?? [],
    discardPile: snapshot?.discardPile ?? [],
    actions,
    handleCloseEventComboModal,
    handleOpenEventCombo,
    setSelectedMode,
    setSelectedTarget,
    setStashModal: () => {}, // Handled by useCriticalModals
    setMarkModal: () => {},
    setStealDrawModal: () => {},
    setSmiteModal: () => {},
    setTargetedAttackModal,
  });

  const {
    handleConfirmEventCombo,
    handleOpenFiverCombo,
    handleConfirmStash,
    handleConfirmMark,
    handleConfirmStealDraw,
    handleUnstash,
    handlePlayActionCard,
    handleCloseTargetedAttackModal,
    handleConfirmTargetedAttack,
    handleConfirmAlterFuture,
    handleConfirmSmite,
  } = gameHandlers;

  // Autoplay hook integration
  const {
    autoplayState,
    idleTimerTriggered,
    handleStopAutoplay,
    idleTimerEnabled,
    handleIdleTimeout,
  } = useGameAutoplayIntegration({
    room,
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    canPlayNope: !!canPlayNope,
    currentPlayer,
    snapshot,
    currentUserId,
    actions,
    handlePlayActionCard,
  });

  const { turnStatusVariant, turnStatusText } = useTurnStatus({
    isGameOver: !!isGameOver,
    currentTurnPlayer: currentTurnPlayer ?? undefined,
    currentUserId: currentUserId || '',
    resolveDisplayName,
    t: t as (key: string) => string,
  });

  const modalPlayers = useMemo(
    () =>
      snapshot.players.map((p: CriticalPlayerState) => ({
        playerId: p.playerId,
        displayName: resolveDisplayName(
          p.playerId,
          `Player ${p.playerId.slice(0, 8)}`,
        ),
        alive: p.alive,
      })),
    [snapshot.players, resolveDisplayName],
  );

  return (
    <>
      <CriticalGameHeader
        room={room}
        t={
          t as unknown as (
            key: string,
            params?: Record<string, string | number>,
          ) => string
        }
        idleTimerEnabled={idleTimerEnabled}
        turnStatusVariant={turnStatusVariant}
        turnStatusText={turnStatusText}
        actionBusy={actionBusy}
        isGameOver={!!isGameOver}
        currentPlayer={currentPlayer ?? undefined}
        canAct={!!canAct}
        isMyTurn={!!isMyTurn}
        handleIdleTimeout={handleIdleTimeout}
        autoplayState={autoplayState}
        idleTimerTriggered={idleTimerTriggered}
        handleStopAutoplay={handleStopAutoplay}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      <ActiveGameContent
        room={room}
        snapshot={snapshot}
        currentUserId={currentUserId}
        currentPlayer={currentPlayer}
        cardVariant={cardVariant}
        isGameOver={!!isGameOver}
        isMyTurn={!!isMyTurn}
        canAct={!!canAct}
        canPlayNope={!!canPlayNope}
        actionBusy={actionBusy}
        aliveOpponents={aliveOpponents}
        handLayout={handLayout}
        setHandLayout={setHandLayout}
        resolveDisplayName={resolveDisplayName}
        t={
          t as unknown as (
            key: string,
            params?: Record<string, string | number>,
          ) => string
        }
        actions={actions}
        idleTimerTriggered={idleTimerTriggered}
        autoplayState={autoplayState}
        handleUnstash={handleUnstash}
        handlePlayActionCard={handlePlayActionCard}
        handleOpenFavorModal={handleOpenFavorModal}
        handleOpenEventCombo={handleOpenEventCombo}
        handleOpenFiverCombo={handleOpenFiverCombo}
      />

      {currentPlayer && (
        <GameStatusMessage
          currentPlayerAlive={currentPlayer.alive}
          isGameOver={!!isGameOver}
          t={t as (key: string) => string}
        />
      )}

      {latestMessage && (
        <ChatMessagePopup
          key={latestMessage.id}
          senderName={latestMessage.senderName}
          message={latestMessage.message}
          visible={!!latestMessage}
          onDismiss={dismissPopup}
        />
      )}

      <GameModals
        // Rematch Modal
        showRematchModal={rematch.showRematchModal}
        players={modalPlayers}
        currentUserId={currentUserId}
        rematchLoading={rematch.rematchLoading}
        onCloseRematchModal={rematch.closeRematchModal}
        onConfirmRematch={rematch.handleRematch}
        // Rematch Invitation
        invitation={rematch.invitation}
        invitationTimeLeft={rematch.invitationTimeLeft}
        onAcceptInvitation={rematch.handleAcceptInvitation}
        onDeclineInvitation={rematch.handleDeclineInvitation}
        onBlockRematch={rematch.handleBlockRematch}
        onBlockUser={rematch.handleBlockUser}
        isAcceptingInvitation={rematch.isAcceptingInvitation}
        // Event Combo Modal
        eventComboModal={eventComboModal}
        onCloseEventComboModal={handleCloseEventComboModal}
        selectedMode={selectedMode}
        selectedTarget={selectedTarget}
        selectedCard={selectedCard}
        selectedIndex={selectedIndex}
        selectedDiscardCard={selectedDiscardCard}
        selectedFiverCards={selectedFiverCards}
        aliveOpponents={aliveOpponents}
        selfHand={currentPlayer?.hand ?? []}
        discardPile={snapshot?.discardPile ?? []}
        onSelectComboCard={handleSelectComboCard}
        onSelectMode={setSelectedMode}
        onSelectTarget={setSelectedTarget}
        onSelectCard={setSelectedCard}
        onSelectIndex={setSelectedIndex}
        onSelectDiscardCard={setSelectedDiscardCard}
        onToggleFiverCard={handleToggleFiverCard}
        onConfirmEventCombo={handleConfirmEventCombo}
        // See the Future Modal
        seeTheFutureModal={seeTheFutureModal}
        onCloseSeeTheFutureModal={handleCloseSeeTheFutureModal}
        // Alter the Future
        pendingAlter={snapshot?.pendingAlter ?? null}
        onConfirmAlterFuture={handleConfirmAlterFuture}
        // Targeted Attack Modal
        targetedAttackModal={targetedAttackModal}
        onCloseTargetedAttackModal={handleCloseTargetedAttackModal}
        onConfirmTargetedAttack={handleConfirmTargetedAttack}
        // Favor Modal
        favorModal={favorModal}
        onCloseFavorModal={handleCloseFavorModal}
        onConfirmFavor={handleConfirmFavor}
        // Defuse Modal
        pendingDefuse={snapshot?.pendingDefuse ?? null}
        onPlayDefuse={actions.playDefuse}
        deck={snapshot?.deck ?? []}
        // Give Favor Modal
        pendingFavor={snapshot?.pendingFavor ?? null}
        myHand={currentPlayer?.hand ?? []}
        onGiveFavorCard={actions.giveFavorCard}
        // Shared
        resolveDisplayName={resolveDisplayName}
        t={t as (key: string, params?: Record<string, unknown>) => string}
        cardVariant={cardVariant}
        // Theft Pack
        stashModal={stashModal}
        onCloseStashModal={handleCloseStashModal}
        onConfirmStash={handleConfirmStash}
        markModal={markModal}
        onCloseMarkModal={handleCloseMarkModal}
        onConfirmMark={handleConfirmMark}
        onCloseStealDrawModal={handleCloseStealDrawModal}
        onConfirmStealDraw={handleConfirmStealDraw}
        smiteModal={smiteModal}
        onCloseSmiteModal={handleCloseSmiteModal}
        onConfirmSmite={handleConfirmSmite}
        // Omniscience Modal
        omniscienceModal={omniscienceModal}
        onCloseOmniscienceModal={handleCloseOmniscienceModal}
        stealDrawModal={stealDrawModal}
      />

      <GameResultModal
        isOpen={!!showResultModal}
        data-testid="game-result-modal"
        result={
          snapshot.players.find((p) => p.alive)?.playerId === currentUserId
            ? 'victory'
            : 'defeat'
        }
        onRematch={isHost ? rematch.openRematchModal : undefined}
        onClose={() => setModalDismissed(true)}
        rematchLoading={rematch.rematchLoading}
        t={t}
      />
    </>
  );
}
