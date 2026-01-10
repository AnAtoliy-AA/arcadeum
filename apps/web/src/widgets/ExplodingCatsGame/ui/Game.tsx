'use client';

import { useRef, useCallback, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ExplodingCatsGameProps, ExplodingCatsCard } from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import { useDisplayNames } from '../lib/displayUtils';
import {
  useExplodingCatsState,
  useFullscreen,
  useExplodingCatsModals,
  useRematch,
  useWebGameHaptics,
  useIdleTimer,
} from '../hooks';
import { useAutoplay } from '../hooks/useAutoplay';
import { useGameHandlers } from '../hooks/useGameHandlers';
import { IdleTimerDisplay } from './IdleTimerDisplay';
import { AutoplayControls } from './AutoplayControls';
import { GameModals } from './GameModals';
import { GameLobby } from './GameLobby';
import { ChatSection } from './ChatSection';
import { GameStatusMessage } from './GameStatusMessage';
import { ServerLoadingNotice } from './ServerLoadingNotice';
import { PlayerHand } from './PlayerHand';
import { GameTableSection } from './GameTableSection';

import {
  GameContainer,
  GameHeader,
  HeaderActions,
  GameInfo,
  GameTitle,
  TurnStatus,
  FullscreenButton,
  ChatToggleButton,
  GameBoard,
  TableArea,
} from './styles';

import {
  RoomNameBadge,
  RoomNameIcon,
  RoomNameText,
  FastBadge,
} from './styles/lobby';

export default function ExplodingCatsGame({
  roomId,
  room,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
}: ExplodingCatsGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

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
  } = useExplodingCatsState({
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
  } = useExplodingCatsModals({
    chatMessagesRef,
    chatLogCount: snapshot?.logs?.length ?? 0,
  });

  const youLabel = t('games.table.players.you');
  const seeTheFutureLabel = t('games.table.cards.seeTheFuture');
  const translateCardType = useCallback(
    (cardType: ExplodingCatsCard) => t(getCardTranslationKey(cardType)),
    [t],
  );
  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room,
    snapshot,
    youLabel,
    translateCardType,
    seeTheFutureLabel,
  });

  const { handleConfirmCatCombo, handleSendChatMessage, handleOpenFiverCombo } =
    useGameHandlers({
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
      clearChatMessage,
    });

  const handlePlayActionCard = useCallback(
    (card: ExplodingCatsCard) => {
      if (card === 'targeted_attack') {
        setTargetedAttackModal(true);
      } else {
        actions.playActionCard(card);
      }
    },
    [actions, setTargetedAttackModal],
  );

  const handleCloseTargetedAttackModal = useCallback(() => {
    setTargetedAttackModal(false);
    setSelectedTarget(null);
  }, [setTargetedAttackModal, setSelectedTarget]);

  const handleConfirmTargetedAttack = useCallback(() => {
    if (selectedTarget) {
      actions.playActionCard('targeted_attack', {
        targetPlayerId: selectedTarget,
      });
      setTargetedAttackModal(false);
      setSelectedTarget(null);
    }
  }, [selectedTarget, actions, setTargetedAttackModal, setSelectedTarget]);

  // Autoplay hook
  const autoplayState = useAutoplay({
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    canPlayNope: !!canPlayNope,
    hand: currentPlayer?.hand ?? [],
    logs: snapshot?.logs ?? [],
    pendingAction: snapshot?.pendingAction ?? null,
    pendingFavor: snapshot?.pendingFavor ?? null,
    pendingDefuse: snapshot?.pendingDefuse ?? null,
    deckSize: snapshot?.deck?.length ?? 0,
    playerOrder: snapshot?.playerOrder ?? [],
    currentUserId,
    onDraw: actions.drawCard,
    onPlayActionCard: handlePlayActionCard,
    onPlayNope: actions.playNope,
    onGiveFavorCard: actions.giveFavorCard,
    onPlayDefuse: actions.playDefuse,
  });

  const { setAllEnabled } = autoplayState;

  // Idle timer autoplay
  const idleTimerEnabled = room.gameOptions?.idleTimerEnabled ?? false;
  const [idleTimerTriggered, setIdleTimerTriggered] = useState(false);

  const handleIdleTimeout = useCallback(() => {
    setIdleTimerTriggered(true);
    setAllEnabled(true);
  }, [setAllEnabled]);

  const idleTimer = useIdleTimer({
    enabled: idleTimerEnabled,
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    onTimeout: handleIdleTimeout,
  });

  const handleStopAutoplay = useCallback(() => {
    setIdleTimerTriggered(false);
    setAllEnabled(false);
    idleTimer.reset();
  }, [idleTimer, setAllEnabled]);

  // Note: idleTimerTriggered is reset when allEnabled becomes false
  // This is derived behavior - we use a ref to track the triggered state
  // and reset it when conditions change

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
        onStartGame={actions.startExplodingCats}
        onReorderPlayers={reorderParticipants}
        t={t as (key: string) => string}
      />
    );
  }

  // Game in progress
  return (
    <GameContainer ref={containerRef} $isMyTurn={!!isMyTurn}>
      <GameHeader>
        <GameInfo>
          <GameTitle>{t('games.exploding_kittens_v1.name')}</GameTitle>
          <RoomNameBadge>
            <RoomNameIcon>🎲</RoomNameIcon>
            <RoomNameText>{room.name}</RoomNameText>
          </RoomNameBadge>
          {idleTimerEnabled && (
            <FastBadge>
              <span>⚡</span>
              <span>{t('games.rooms.fastRoom')}</span>
            </FastBadge>
          )}
          <TurnStatus>
            {currentTurnPlayer
              ? currentTurnPlayer.playerId === currentUserId
                ? t('games.table.players.yourTurn')
                : t('games.table.players.waitingFor')
              : 'Game in progress'}
          </TurnStatus>
          {actionLongPending && (
            <ServerLoadingNotice
              pendingProgress={pendingProgress}
              pendingElapsedSeconds={pendingElapsedSeconds}
            />
          )}
        </GameInfo>
        <HeaderActions>
          {!isGameOver && currentPlayer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 10,
              }}
            >
              <IdleTimerDisplay
                secondsRemaining={idleTimer.secondsRemaining}
                isActive={idleTimer.isActive && !autoplayState.allEnabled}
                isRunning={idleTimer.isRunning}
                autoplayTriggered={idleTimerTriggered}
                onStop={handleStopAutoplay}
                t={
                  t as (key: string, params?: Record<string, unknown>) => string
                }
              />
              <AutoplayControls
                autoplayState={autoplayState}
                t={t as (key: string) => string}
              />
            </div>
          )}
          <ChatToggleButton
            type="button"
            onClick={handleToggleChat}
            $active={showChat}
          >
            {showChat ? t('games.table.chat.hide') : t('games.table.chat.show')}
          </ChatToggleButton>
          <FullscreenButton
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </FullscreenButton>
        </HeaderActions>
      </GameHeader>

      <GameBoard>
        <TableArea $showChat={showChat}>
          <GameTableSection
            players={snapshot.players}
            playerOrder={snapshot.playerOrder}
            currentTurnIndex={snapshot.currentTurnIndex}
            currentUserId={currentUserId}
            deckLength={snapshot.deck.length}
            discardPileLength={snapshot.discardPile.length}
            pendingDraws={snapshot.pendingDraws}
            discardPile={snapshot.discardPile}
            resolveDisplayName={resolveDisplayName}
            t={t as (key: string) => string}
          />

          {currentPlayer && currentPlayer.alive && !isGameOver && (
            <PlayerHand
              currentPlayer={currentPlayer}
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
              resolveDisplayName={resolveDisplayName}
              formatLogMessage={formatLogMessage}
              t={t as (key: string) => string}
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
        deckSize={snapshot?.deck?.length ?? 0}
        // Give Favor Modal
        pendingFavor={snapshot?.pendingFavor ?? null}
        myHand={currentPlayer?.hand ?? []}
        onGiveFavorCard={actions.giveFavorCard}
        // Shared
        resolveDisplayName={resolveDisplayName}
        t={t as (key: string, params?: Record<string, unknown>) => string}
      />
    </GameContainer>
  );
}
