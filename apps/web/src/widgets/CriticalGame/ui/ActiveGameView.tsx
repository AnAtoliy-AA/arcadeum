'use client';

import { useRef, useCallback, useMemo, useState } from 'react';
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
import { ChatSection } from './ChatSection';
import { GameStatusMessage } from './GameStatusMessage';
import { PlayerHand } from './PlayerHand';
import { GameTableSection } from './GameTableSection';
import { GameBoard, TableArea } from './styles';
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
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

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
    setFavorModal,
    targetedAttackModal,
    setTargetedAttackModal,
    seeTheFutureModal,
    setSeeTheFutureModal,
    chatMessage,
    setChatMessage,
    chatScope,
    setChatScope,
    showChat,
    handleToggleChat,
    clearChatMessage,
    stashModal,
    setStashModal,
    markModal,
    setMarkModal,
    stealDrawModal,
    setStealDrawModal,
    smiteModal,
    setSmiteModal,
    omniscienceModal,
    setOmniscienceModal,
  } = useCriticalModals({
    chatMessagesRef,
    chatLogCount: snapshot?.logs?.length ?? 0,
  });

  // Monitor logs for seeTheFuture.reveal and omniscience.reveal entries
  useSeeTheFutureFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setSeeTheFutureModal,
  });
  useOmniscienceFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setOmniscienceModal,
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
    chatMessage,
    chatScope,
    currentPlayerHand: currentPlayer?.hand ?? [],
    discardPile: snapshot?.discardPile ?? [],
    actions,
    handleCloseEventComboModal,
    handleOpenEventCombo,
    setSelectedMode,
    setSelectedTarget,
    setStashModal,
    setMarkModal,
    setStealDrawModal,
    setSmiteModal,
    clearChatMessage,
    setTargetedAttackModal,
  });

  const {
    handleConfirmEventCombo,
    handleSendChatMessage,
    handleOpenFiverCombo,
    handleConfirmStash,
    handleConfirmMark,
    handleConfirmStealDraw,
    handleUnstash,
    handlePlayActionCard,
    handleCloseTargetedAttackModal,
    handleCloseMarkModal,
    handleCloseStealDrawModal,
    handleConfirmTargetedAttack,
    handleConfirmAlterFuture,
    handleCloseSmiteModal,
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

  const handleOpenFavorModal = useCallback(
    () => setFavorModal(true),
    [setFavorModal],
  );
  const handleCloseFavorModal = useCallback(() => {
    setFavorModal(false);
    setSelectedTarget(null);
  }, [setFavorModal, setSelectedTarget]);
  const handleConfirmFavor = useCallback(() => {
    if (selectedTarget) {
      actions.playFavor(selectedTarget);
      setFavorModal(false);
      setSelectedTarget(null);
    }
  }, [selectedTarget, actions, setFavorModal, setSelectedTarget]);
  const handleCloseSeeTheFutureModal = useCallback(
    () => setSeeTheFutureModal(null),
    [setSeeTheFutureModal],
  );
  const handleCloseStashModal = useCallback(
    () => setStashModal(false),
    [setStashModal],
  );
  const handleCloseOmniscienceModal = useCallback(
    () => setOmniscienceModal(null),
    [setOmniscienceModal],
  );

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
        t={t as (key: string, params?: Record<string, unknown>) => string}
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
        showChat={showChat}
        handleToggleChat={handleToggleChat}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      <GameBoard>
        <TableArea $showChat={showChat}>
          <GameTableSection
            players={snapshot.players}
            playerOrder={snapshot.playerOrder}
            currentTurnIndex={snapshot.currentTurnIndex}
            currentUserId={currentUserId}
            deck={snapshot.deck}
            discardPileLength={snapshot.discardPile.length}
            pendingDraws={snapshot.pendingDraws}
            discardPile={snapshot.discardPile}
            logs={snapshot.logs ?? []}
            resolveDisplayName={resolveDisplayName}
            t={t as (key: string) => string}
            cardVariant={cardVariant}
          />

          {currentPlayer && currentPlayer.alive && !isGameOver && (
            <PlayerHand
              currentPlayer={currentPlayer}
              onUnstashCard={handleUnstash}
              isMyTurn={!!isMyTurn}
              isGameOver={!!isGameOver}
              canAct={!!canAct}
              canPlayNope={!!canPlayNope}
              actionBusy={actionBusy}
              aliveOpponents={aliveOpponents}
              discardPileLength={snapshot?.discardPile?.length ?? 0}
              logs={snapshot?.logs ?? []}
              pendingAction={snapshot?.pendingAction ?? null}
              pendingFavor={snapshot?.pendingFavor ?? null}
              pendingDefuse={snapshot?.pendingDefuse ?? null}
              deckSize={snapshot?.deck?.length ?? 0}
              playerOrder={snapshot?.playerOrder ?? []}
              currentUserId={currentUserId}
              allowActionCardCombos={snapshot?.allowActionCardCombos ?? false}
              t={t as (key: string) => string}
              onDraw={actions.drawCard}
              onPlayActionCard={handlePlayActionCard}
              onPlayNope={actions.playNope}
              onPlaySeeTheFuture={actions.playSeeTheFuture}
              onOpenFavorModal={handleOpenFavorModal}
              onGiveFavorCard={actions.giveFavorCard}
              onPlayDefuse={actions.playDefuse}
              onOpenEventCombo={handleOpenEventCombo}
              onOpenFiverCombo={handleOpenFiverCombo}
              forceEnableAutoplay={idleTimerTriggered}
              onAutoplayEnabledChange={autoplayState.setAllEnabled}
              cardVariant={cardVariant}
              handLayout={handLayout}
              setHandLayout={setHandLayout}
            />
          )}

          {showChat && (
            <ChatSection
              logs={snapshot.logs ?? []}
              chatMessagesRef={chatMessagesRef}
              chatMessage={chatMessage}
              onChatMessageChange={setChatMessage}
              chatScope={chatScope}
              onChatScopeChange={setChatScope}
              onSendMessage={handleSendChatMessage}
              currentUserId={currentUserId}
              turnStatus={turnStatusText}
              resolveDisplayName={resolveDisplayName}
              formatLogMessage={formatLogMessage}
              t={t as (key: string) => string}
              cardVariant={cardVariant}
              onClose={handleToggleChat}
            />
          )}
        </TableArea>

        {currentPlayer && (
          <GameStatusMessage
            currentPlayerAlive={currentPlayer.alive}
            isGameOver={!!isGameOver}
            t={t as (key: string) => string}
          />
        )}
      </GameBoard>

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
        stealDrawModal={stealDrawModal}
        onCloseStealDrawModal={handleCloseStealDrawModal}
        onConfirmStealDraw={handleConfirmStealDraw}
        smiteModal={smiteModal}
        onCloseSmiteModal={handleCloseSmiteModal}
        onConfirmSmite={handleConfirmSmite}
        // Omniscience Modal
        omniscienceModal={omniscienceModal}
        onCloseOmniscienceModal={handleCloseOmniscienceModal}
      />

      <GameResultModal
        isOpen={!!showResultModal}
        result={currentPlayer?.alive ? 'victory' : 'defeat'}
        onRematch={isHost ? rematch.openRematchModal : undefined}
        onClose={() => setModalDismissed(true)}
        rematchLoading={rematch.rematchLoading}
        t={t}
      />
    </>
  );
}
