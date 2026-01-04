'use client';

import { useRef, useCallback } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ExplodingCatsGameProps, ExplodingCatsCard } from '../types';
import { getCardEmoji, getCardTranslationKey } from '../lib/cardUtils';
import { useDisplayNames } from '../lib/displayUtils';
import {
  useExplodingCatsState,
  useFullscreen,
  useExplodingCatsModals,
  useRematch,
} from '../hooks';
import { CatComboModal } from './modals/CatComboModal';
import { SeeTheFutureModal } from './modals/SeeTheFutureModal';
import { FavorModal } from './modals/FavorModal';
import { GiveFavorModal } from './modals/GiveFavorModal';
import { DefuseModal } from './modals/DefuseModal';
import { RematchModal } from './modals/RematchModal';
import { GameLobby } from './GameLobby';
import { ChatSection } from './ChatSection';
import { GameStatusMessage } from './GameStatusMessage';
import { ServerLoadingNotice } from './ServerLoadingNotice';
import { PlayerHand } from './PlayerHand';

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
  GameTable,
  PlayersRing,
  PlayerPositionWrapper,
  PlayerCard,
  PlayerAvatar,
  PlayerName,
  PlayerCardCount,
  TurnIndicator,
  CenterTable,
  TableInfo,
  TableStat,
  LastPlayedCard,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
} from './styles';

export default function ExplodingCatsGame({
  roomId,
  room,
  session: initialSession,
  currentUserId,
  isHost,
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
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    canAct,
    aliveOpponents,
    isGameOver,
  } = useExplodingCatsState({ roomId, currentUserId, initialSession });

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const {
    rematchLoading,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
  } = useRematch({ roomId });

  const {
    catComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    setSelectedMode,
    setSelectedTarget,
    setSelectedCard,
    handleOpenCatCombo,
    handleCloseCatComboModal,
    favorModal,
    setFavorModal,
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

  const handleConfirmCatCombo = useCallback(() => {
    if (!catComboModal || !selectedMode || !selectedTarget) return;
    if (selectedMode === 'trio' && !selectedCard) return;

    actions.playCatCombo(
      catComboModal.cat,
      selectedMode,
      selectedTarget,
      selectedMode === 'trio' ? selectedCard! : undefined,
    );
    handleCloseCatComboModal();
  }, [
    catComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    actions,
    handleCloseCatComboModal,
  ]);

  const handleSendChatMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;
    actions.postHistoryNote(trimmed, chatScope);
    clearChatMessage();
  }, [chatMessage, chatScope, actions, clearChatMessage]);

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
        t={t as (key: string) => string}
      />
    );
  }

  // Game in progress
  return (
    <GameContainer ref={containerRef}>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
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
          <GameTable>
            <PlayersRing $playerCount={snapshot.playerOrder.length}>
              {snapshot.playerOrder.map((playerId, index) => {
                const player = snapshot.players.find(
                  (p) => p.playerId === playerId,
                );
                if (!player) return null;
                const isCurrent = index === snapshot.currentTurnIndex;
                const isCurrentUserCard = playerId === currentUserId;
                const displayName = resolveDisplayName(
                  playerId,
                  `Player ${playerId.slice(0, 8)}`,
                );

                return (
                  <PlayerPositionWrapper
                    key={playerId}
                    $position={index}
                    $total={snapshot.playerOrder.length}
                  >
                    <PlayerCard
                      $isCurrentTurn={isCurrent}
                      $isAlive={player.alive}
                      $isCurrentUser={isCurrentUserCard}
                    >
                      {isCurrent && <TurnIndicator>⭐</TurnIndicator>}
                      <PlayerAvatar
                        $isCurrentTurn={isCurrent}
                        $isAlive={player.alive}
                      >
                        {player.alive ? '🎮' : '💀'}
                      </PlayerAvatar>
                      <PlayerName $isCurrentTurn={isCurrent}>
                        {displayName}
                      </PlayerName>
                      {player.alive && (
                        <PlayerCardCount $isCurrentTurn={isCurrent}>
                          🃏 {player.hand.length}
                        </PlayerCardCount>
                      )}
                    </PlayerCard>
                  </PlayerPositionWrapper>
                );
              })}

              <CenterTable>
                {snapshot.discardPile.length > 0 && (
                  <LastPlayedCard
                    $cardType={
                      snapshot.discardPile[snapshot.discardPile.length - 1]
                    }
                    $isAnimating={false}
                  >
                    <CardCorner $position="tl" />
                    <CardCorner $position="tr" />
                    <CardCorner $position="bl" />
                    <CardCorner $position="br" />
                    <CardFrame />
                    <CardInner>
                      <CardEmoji>
                        {getCardEmoji(
                          snapshot.discardPile[snapshot.discardPile.length - 1],
                        )}
                      </CardEmoji>
                      <CardName>
                        {t(
                          getCardTranslationKey(
                            snapshot.discardPile[
                              snapshot.discardPile.length - 1
                            ],
                          ),
                        )}
                      </CardName>
                    </CardInner>
                  </LastPlayedCard>
                )}
              </CenterTable>
            </PlayersRing>
            <TableInfo>
              <TableStat>
                <div style={{ fontSize: '1.1rem' }}>🎴</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {snapshot.deck.length}
                </div>
              </TableStat>
              <TableStat>
                <div style={{ fontSize: '1.1rem' }}>🗑️</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {snapshot.discardPile.length}
                </div>
              </TableStat>
              <TableStat>
                <div style={{ fontSize: '1.1rem' }}>⏳</div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#DC2626',
                  }}
                >
                  {snapshot.pendingDraws}
                </div>
              </TableStat>
            </TableInfo>
          </GameTable>

          {currentPlayer && currentPlayer.alive && !isGameOver && (
            <PlayerHand
              currentPlayer={currentPlayer}
              isMyTurn={!!isMyTurn}
              isGameOver={!!isGameOver}
              canAct={!!canAct}
              actionBusy={!!actionBusy}
              aliveOpponents={aliveOpponents}
              t={t as (key: string) => string}
              onDraw={actions.drawCard}
              onPlayActionCard={actions.playActionCard}
              onPlayNope={actions.playNope}
              onPlaySeeTheFuture={actions.playSeeTheFuture}
              onOpenFavorModal={() => setFavorModal(true)}
              onOpenCatCombo={handleOpenCatCombo}
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

      {/* Rematch Modal */}
      <RematchModal
        isOpen={showRematchModal}
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
        onClose={closeRematchModal}
        onConfirm={handleRematch}
        t={t as (key: string) => string}
      />

      {/* Cat Combo Modal */}
      <CatComboModal
        isOpen={!!catComboModal}
        onClose={handleCloseCatComboModal}
        catComboModal={catComboModal}
        selectedMode={selectedMode}
        selectedTarget={selectedTarget}
        selectedCard={selectedCard}
        aliveOpponents={aliveOpponents}
        onSelectMode={setSelectedMode}
        onSelectTarget={setSelectedTarget}
        onSelectCard={setSelectedCard}
        onConfirm={handleConfirmCatCombo}
        resolveDisplayName={resolveDisplayName}
        t={t}
      />

      {/* See the Future Modal */}
      <SeeTheFutureModal
        isOpen={!!seeTheFutureModal}
        onClose={() => setSeeTheFutureModal(null)}
        cards={seeTheFutureModal?.cards || []}
        t={t}
      />

      {/* Favor Modal */}
      <FavorModal
        isOpen={favorModal}
        onClose={() => {
          setFavorModal(false);
          setSelectedTarget(null);
        }}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        onSelectTarget={setSelectedTarget}
        onConfirm={() => {
          if (selectedTarget) {
            actions.playFavor(selectedTarget);
            setFavorModal(false);
            setSelectedTarget(null);
          }
        }}
        resolveDisplayName={resolveDisplayName}
        t={t}
      />

      {/* Defuse Modal - shows when player must defuse */}
      <DefuseModal
        isOpen={!!currentUserId && snapshot?.pendingDefuse === currentUserId}
        onDefuse={(position) => {
          actions.playDefuse(position);
        }}
        deckSize={snapshot?.deck?.length ?? 0}
        t={t as (key: string) => string}
      />

      {/* Give Favor Modal - shows when someone requested a favor from current user */}
      <GiveFavorModal
        isOpen={
          !!currentUserId &&
          !!snapshot?.pendingFavor &&
          snapshot.pendingFavor.targetId === currentUserId
        }
        requesterName={
          snapshot?.pendingFavor
            ? resolveDisplayName(snapshot.pendingFavor.requesterId, 'Player')
            : 'Player'
        }
        myHand={currentPlayer?.hand ?? []}
        onGiveCard={(card) => {
          actions.giveFavorCard(card);
        }}
        t={t}
      />
    </GameContainer>
  );
}
