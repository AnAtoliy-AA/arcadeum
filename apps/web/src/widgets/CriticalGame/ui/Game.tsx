'use client';

import { useRef, useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalGameProps, CriticalCard, HandLayoutMode } from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import { useDisplayNames } from '../lib/displayUtils';
import {
  useCriticalState,
  useFullscreen,
  useCriticalModals,
  useRematch,
  useWebGameHaptics,
  useGameRoom,
  useSeeTheFutureFromLogs,
  useOmniscienceFromLogs,
  useGameAutoplayIntegration,
} from '../hooks';
import { useGameHandlers } from '../hooks/useGameHandlers';
import { GameModals } from './GameModals';
import { GameLobby } from './GameLobby';
import { ChatSection } from './ChatSection';
import { GameStatusMessage } from './GameStatusMessage';
import { PlayerHand } from './PlayerHand';
import { GameTableSection } from './GameTableSection';

import { GameContainer, GameBoard, TableArea } from './styles';

import { CriticalGameHeader } from './CriticalGameHeader';

export default function CriticalGame({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
}: CriticalGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  // Layout State
  const [handLayout, setHandLayout] = useState<HandLayoutMode>('grid');

  // Use dynamic room state
  const room = useGameRoom(initialRoom);
  const cardVariant = room.gameOptions?.cardVariant;

  const {
    snapshot,
    actionBusy,
    actionLongPending,
    pendingProgress,
    pendingElapsedSeconds,
    startBusy,
    actions,
    reorderParticipants,
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    canAct,
    canPlayNope,
    aliveOpponents,
    isGameOver,
  } = useCriticalState({
    roomId,
    currentUserId,
    initialSession,
    accessToken,
  });

  useWebGameHaptics(isMyTurn);

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const {
    rematchLoading,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
    invitation,
    invitationTimeLeft,
    handleAcceptInvitation,
    handleDeclineInvitation,
    isAcceptingInvitation,
    handleReinvite,
    handleBlockRematch,
    handleBlockUser,
  } = useRematch({ roomId, gameOptions: room.gameOptions });

  const {
    catComboModal,
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
    handleOpenCatCombo,
    handleCloseCatComboModal,
    handleSelectCat,
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
    // Theft Pack
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
    catComboModal,
    chatMessage,
    chatScope,
    currentPlayerHand: currentPlayer?.hand ?? [],
    actions,
    handleCloseCatComboModal,
    handleOpenCatCombo,
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
    handleConfirmCatCombo,
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
    idleTimer,
    idleTimerTriggered,
    handleStopAutoplay,
    idleTimerEnabled,
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

  // Compute turn status display
  const turnStatusVariant = useMemo(():
    | 'completed'
    | 'yourTurn'
    | 'waiting'
    | 'default' => {
    if (isGameOver) return 'completed';
    if (!currentTurnPlayer) return 'default';
    return currentTurnPlayer.playerId === currentUserId
      ? 'yourTurn'
      : 'waiting';
  }, [isGameOver, currentTurnPlayer, currentUserId]);

  const turnStatusText = useMemo((): string => {
    if (isGameOver) return t('games.table.status.gameCompleted');
    if (!currentTurnPlayer) return 'Game in progress';
    if (currentTurnPlayer.playerId === currentUserId) {
      return t('games.table.players.yourTurn');
    }
    return `${t('games.table.players.waitingFor')}: ${resolveDisplayName(currentTurnPlayer.playerId, 'Player')}`;
  }, [isGameOver, currentTurnPlayer, currentUserId, t, resolveDisplayName]);

  // Game not started yet
  if (!snapshot) {
    return (
      <GameLobby
        room={room}
        isHost={isHost}
        startBusy={startBusy}
        isFullscreen={isFullscreen}
        containerRef={containerRef}
        onToggleFullscreen={toggleFullscreen}
        onStartGame={actions.startCritical}
        onReorderPlayers={reorderParticipants}
        onReinvite={handleReinvite}
        t={t as (key: string) => string}
      />
    );
  }

  // Game in progress
  return (
    <GameContainer
      ref={containerRef}
      $isMyTurn={!!isMyTurn}
      $variant={cardVariant}
    >
      <CriticalGameHeader
        room={room}
        t={t as (key: string, params?: Record<string, unknown>) => string}
        idleTimerEnabled={idleTimerEnabled}
        turnStatusVariant={turnStatusVariant}
        turnStatusText={turnStatusText}
        actionLongPending={actionLongPending}
        pendingProgress={pendingProgress}
        pendingElapsedSeconds={pendingElapsedSeconds}
        isGameOver={isGameOver}
        currentPlayer={currentPlayer ?? undefined}
        idleTimer={idleTimer}
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
              actionBusy={!!actionBusy}
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
              onOpenFavorModal={() => setFavorModal(true)}
              onGiveFavorCard={actions.giveFavorCard}
              onPlayDefuse={actions.playDefuse}
              onOpenCatCombo={handleOpenCatCombo}
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
            isGameOver={isGameOver}
            isHost={isHost}
            rematchLoading={rematchLoading}
            onRematch={openRematchModal}
            t={t as (key: string) => string}
          />
        )}
      </GameBoard>

      <GameModals
        // Rematch Modal
        showRematchModal={showRematchModal}
        players={
          snapshot?.players.map((p) => ({
            playerId: p.playerId,
            displayName: resolveDisplayName(
              p.playerId,
              `Player ${p.playerId.slice(0, 8)}`,
            ),
            alive: p.alive,
          })) ?? []
        }
        currentUserId={currentUserId}
        rematchLoading={rematchLoading}
        onCloseRematchModal={closeRematchModal}
        onConfirmRematch={handleRematch}
        // Rematch Invitation
        invitation={invitation}
        invitationTimeLeft={invitationTimeLeft}
        onAcceptInvitation={handleAcceptInvitation}
        onDeclineInvitation={handleDeclineInvitation}
        onBlockRematch={handleBlockRematch}
        onBlockUser={handleBlockUser}
        isAcceptingInvitation={isAcceptingInvitation}
        // Cat Combo Modal
        catComboModal={catComboModal}
        onCloseCatComboModal={handleCloseCatComboModal}
        selectedMode={selectedMode}
        selectedTarget={selectedTarget}
        selectedCard={selectedCard}
        selectedIndex={selectedIndex}
        selectedDiscardCard={selectedDiscardCard}
        selectedFiverCards={selectedFiverCards}
        aliveOpponents={aliveOpponents}
        selfHand={currentPlayer?.hand ?? []}
        discardPile={snapshot?.discardPile ?? []}
        onSelectCat={handleSelectCat}
        onSelectMode={setSelectedMode}
        onSelectTarget={setSelectedTarget}
        onSelectCard={setSelectedCard}
        onSelectIndex={setSelectedIndex}
        onSelectDiscardCard={setSelectedDiscardCard}
        onToggleFiverCard={handleToggleFiverCard}
        onConfirmCatCombo={handleConfirmCatCombo}
        // See the Future Modal
        seeTheFutureModal={seeTheFutureModal}
        onCloseSeeTheFutureModal={() => setSeeTheFutureModal(null)}
        // Alter the Future
        pendingAlter={snapshot?.pendingAlter ?? null}
        onConfirmAlterFuture={handleConfirmAlterFuture}
        // Targeted Attack Modal
        targetedAttackModal={targetedAttackModal}
        onCloseTargetedAttackModal={handleCloseTargetedAttackModal}
        onConfirmTargetedAttack={handleConfirmTargetedAttack}
        // Favor Modal
        favorModal={favorModal}
        onCloseFavorModal={() => {
          setFavorModal(false);
          setSelectedTarget(null);
        }}
        onConfirmFavor={() => {
          if (selectedTarget) {
            actions.playFavor(selectedTarget);
            setFavorModal(false);
            setSelectedTarget(null);
          }
        }}
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
        onCloseStashModal={() => setStashModal(false)}
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
        onCloseOmniscienceModal={() => setOmniscienceModal(null)}
      />
    </GameContainer>
  );
}
