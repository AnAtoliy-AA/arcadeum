'use client';

import { useRef, useCallback } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

import type {
  ExplodingCatsGameProps,
  ExplodingCatsCatCard,
  ExplodingCatsCard,
} from '../types';
import { CAT_CARDS } from '../types';
import {
  getCardEmoji,
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../lib/cardUtils';
import { useDisplayNames } from '../lib/displayUtils';
import {
  useExplodingCatsState,
  useFullscreen,
  useExplodingCatsModals,
} from '../hooks';
import { CatComboModal } from './modals/CatComboModal';
import { SeeTheFutureModal } from './modals/SeeTheFutureModal';
import { FavorModal } from './modals/FavorModal';
import { DefuseModal } from './modals/DefuseModal';
import { GameLobby } from './GameLobby';
import { ActionsSection } from './ActionsSection';
import { ChatSection } from './ChatSection';
import { GameStatusMessage } from './GameStatusMessage';

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
  CardDescription,
  HandSection,
  InfoCard,
  InfoTitle,
  HandContainer,
  CardsGrid,
  Card,
  CardCountBadge,
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

  const youLabel = t('games.table.players.you') || 'You';
  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room,
    snapshot,
    youLabel,
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
                ? t('games.table.players.yourTurn') || 'Your turn'
                : t('games.table.players.waitingFor') || 'Waiting for player...'
              : 'Game in progress'}
          </TurnStatus>
        </GameInfo>
        <HeaderActions>
          <ChatToggleButton
            type="button"
            onClick={handleToggleChat}
            $active={showChat}
          >
            {showChat
              ? t('games.table.chat.hide') || 'Hide Chat'
              : t('games.table.chat.show') || 'Show Chat'}
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
            <HandSection>
              {isMyTurn && !isGameOver && (
                <ActionsSection
                  currentPlayer={currentPlayer}
                  canAct={canAct}
                  actionBusy={actionBusy}
                  onDraw={actions.drawCard}
                  onPlayActionCard={actions.playActionCard}
                  onOpenFavorModal={() => setFavorModal(true)}
                  onPlaySeeTheFuture={actions.playSeeTheFuture}
                  t={t as (key: string) => string}
                />
              )}

              <HandContainer>
                <InfoCard>
                  <InfoTitle>
                    {t('games.table.hand.title') || 'Your Hand'} (
                    {currentPlayer.hand.length}{' '}
                    {currentPlayer.hand.length === 1
                      ? t('games.table.state.card') || 'card'
                      : t('games.table.state.cards') || 'cards'}
                    )
                  </InfoTitle>
                  <CardsGrid>
                    {(() => {
                      const uniqueCards = Array.from(
                        new Set(currentPlayer.hand),
                      );
                      const cardCounts = new Map<ExplodingCatsCard, number>();
                      currentPlayer.hand.forEach((card) =>
                        cardCounts.set(card, (cardCounts.get(card) || 0) + 1),
                      );

                      return uniqueCards.map((card) => {
                        const count = cardCounts.get(card) || 1;
                        const isCatCard = CAT_CARDS.includes(
                          card as ExplodingCatsCatCard,
                        );
                        const canPlayCombo =
                          isCatCard &&
                          count >= 2 &&
                          canAct &&
                          aliveOpponents.length > 0;

                        return (
                          <Card
                            key={card}
                            $cardType={card}
                            $index={0}
                            onClick={() =>
                              canPlayCombo &&
                              handleOpenCatCombo(
                                card as ExplodingCatsCatCard,
                                currentPlayer.hand,
                              )
                            }
                            style={{
                              cursor: canPlayCombo ? 'pointer' : 'default',
                              opacity: canPlayCombo
                                ? 1
                                : isCatCard && count === 1
                                  ? 0.7
                                  : 1,
                            }}
                          >
                            <CardCorner $position="tl" />
                            <CardCorner $position="tr" />
                            <CardCorner $position="bl" />
                            <CardCorner $position="br" />
                            <CardFrame />
                            <CardInner>
                              <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                              <CardName>
                                {t(getCardTranslationKey(card)) || card}
                              </CardName>
                              <CardDescription>
                                {t(getCardDescriptionKey(card))}
                              </CardDescription>
                            </CardInner>
                            {count > 1 && (
                              <CardCountBadge>{count}</CardCountBadge>
                            )}
                          </Card>
                        );
                      });
                    })()}
                  </CardsGrid>
                </InfoCard>
              </HandContainer>
            </HandSection>
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
            t={t as (key: string) => string}
          />
        )}
      </GameBoard>

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
          setSelectedCard(null);
        }}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        selectedCard={selectedCard}
        onSelectTarget={setSelectedTarget}
        onSelectCard={setSelectedCard}
        onConfirm={() => {
          if (selectedTarget && selectedCard) {
            actions.playFavor(selectedTarget, selectedCard);
            setFavorModal(false);
            setSelectedTarget(null);
            setSelectedCard(null);
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
    </GameContainer>
  );
}
