"use client";

import { useRef, useCallback } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";

import type { ExplodingCatsGameProps, ExplodingCatsCatCard, ExplodingCatsCard } from "../types";
import { CAT_CARDS } from "../types";
import { getCardEmoji, getCardTranslationKey } from "../lib/cardUtils";
import { useDisplayNames } from "../lib/displayUtils";
import { useExplodingCatsState, useFullscreen, useExplodingCatsModals } from "../hooks";

import {
  GameContainer,
  GameHeader,
  HeaderActions,
  GameInfo,
  GameTitle,
  TurnStatus,
  StartButton,
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
  HandSection,
  InfoCard,
  InfoTitle,
  ActionButtons,
  ActionButton,
  HandContainer,
  CardsGrid,
  Card,
  CardCountBadge,
  ChatCard,
  ChatMessages,
  LogEntry,
  ScopeToggle,
  ScopeOption,
  ChatInput,
  ChatControls,
  ChatHint,
  ChatSendButton,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
} from "./styles";

export default function ExplodingCatsGame({ 
  roomId, 
  room, 
  session: initialSession, 
  currentUserId, 
  isHost 
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

  const youLabel = t("games.table.players.you") || "You";
  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room,
    snapshot,
    youLabel,
  });

  const handleConfirmCatCombo = useCallback(() => {
    if (!catComboModal || !selectedMode || !selectedTarget) return;
    if (selectedMode === "trio" && !selectedCard) return;

    actions.playCatCombo(
      catComboModal.cat,
      selectedMode,
      selectedTarget,
      selectedMode === "trio" ? selectedCard! : undefined,
    );
    handleCloseCatComboModal();
  }, [catComboModal, selectedMode, selectedTarget, selectedCard, actions, handleCloseCatComboModal]);

  const handleSendChatMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;
    actions.postHistoryNote(trimmed, chatScope);
    clearChatMessage();
  }, [chatMessage, chatScope, actions, clearChatMessage]);

  const canSendChatMessage = chatMessage.trim().length > 0;

  // Game not started yet
  if (!snapshot) {
    return (
      <GameContainer ref={containerRef}>
        <GameHeader>
          <GameInfo>
            <GameTitle>Exploding Cats</GameTitle>
            <TurnStatus>
              {room.playerCount} {t("games.table.lobby.playersInLobby") || "players in lobby"}
            </TurnStatus>
          </GameInfo>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <FullscreenButton
              onClick={toggleFullscreen}
              title={isFullscreen ? t("games.table.fullscreen.exit") || "Exit fullscreen" : t("games.table.fullscreen.enter") || "Enter fullscreen"}
            >
              {isFullscreen ? "⤓" : "⤢"}
            </FullscreenButton>
            {isHost && room.status === "lobby" && (
              <StartButton onClick={actions.startExplodingCats} disabled={startBusy || room.playerCount < 2}>
                {startBusy ? t("games.table.actions.starting") || "Starting..." : t("games.table.actions.start") || "Start Game"}
              </StartButton>
            )}
          </div>
        </GameHeader>
        <EmptyState>
          <div style={{ fontSize: "3rem" }}>🎮</div>
          <div><strong>{t("games.table.lobby.waitingToStart") || "Waiting for game to start..."}</strong></div>
          <div style={{ fontSize: "0.875rem" }}>
            {room.status !== "lobby"
              ? "Game is loading..."
              : room.playerCount < 2
              ? t("games.table.lobby.needTwoPlayers") || "Need at least 2 players to start"
              : isHost
              ? t("games.table.lobby.hostCanStart") || "Click 'Start Game' when ready"
              : t("games.table.lobby.waitingForHost") || "Waiting for host to start the game"}
          </div>
        </EmptyState>
      </GameContainer>
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
                ? t("games.table.players.yourTurn") || "Your turn"
                : t("games.table.players.waitingFor") || "Waiting for player..."
              : "Game in progress"}
          </TurnStatus>
        </GameInfo>
        <HeaderActions>
          <ChatToggleButton type="button" onClick={handleToggleChat} $active={showChat}>
            {showChat ? t("games.table.chat.hide") || "Hide Chat" : t("games.table.chat.show") || "Show Chat"}
          </ChatToggleButton>
          <FullscreenButton onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            {isFullscreen ? "⤓" : "⤢"}
          </FullscreenButton>
        </HeaderActions>
      </GameHeader>

      <GameBoard>
        <TableArea $showChat={showChat}>
          <GameTable>
            <PlayersRing $playerCount={snapshot.playerOrder.length}>
              {snapshot.playerOrder.map((playerId, index) => {
                const player = snapshot.players.find((p) => p.playerId === playerId);
                if (!player) return null;
                const isCurrent = index === snapshot.currentTurnIndex;
                const isCurrentUserCard = playerId === currentUserId;
                const displayName = resolveDisplayName(playerId, `Player ${playerId.slice(0, 8)}`);

                return (
                  <PlayerPositionWrapper key={playerId} $position={index} $total={snapshot.playerOrder.length}>
                    <PlayerCard $isCurrentTurn={isCurrent} $isAlive={player.alive} $isCurrentUser={isCurrentUserCard}>
                      {isCurrent && <TurnIndicator>⭐</TurnIndicator>}
                      <PlayerAvatar $isCurrentTurn={isCurrent} $isAlive={player.alive}>
                        {player.alive ? "🎮" : "💀"}
                      </PlayerAvatar>
                      <PlayerName $isCurrentTurn={isCurrent}>{displayName}</PlayerName>
                      {player.alive && <PlayerCardCount $isCurrentTurn={isCurrent}>🃏 {player.hand.length}</PlayerCardCount>}
                    </PlayerCard>
                  </PlayerPositionWrapper>
                );
              })}

              <CenterTable>
                {snapshot.discardPile.length > 0 && (
                  <LastPlayedCard $cardType={snapshot.discardPile[snapshot.discardPile.length - 1]} $isAnimating={false}>
                    <CardCorner $position="tl" /><CardCorner $position="tr" />
                    <CardCorner $position="bl" /><CardCorner $position="br" />
                    <CardFrame />
                    <CardInner>
                      <CardEmoji>{getCardEmoji(snapshot.discardPile[snapshot.discardPile.length - 1])}</CardEmoji>
                      <CardName>{t(getCardTranslationKey(snapshot.discardPile[snapshot.discardPile.length - 1]))}</CardName>
                    </CardInner>
                  </LastPlayedCard>
                )}
                <TableInfo>
                  <TableStat>
                    <div style={{ fontSize: "1.2rem" }}>🎴</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{snapshot.deck.length}</div>
                  </TableStat>
                  <TableStat>
                    <div style={{ fontSize: "1.2rem" }}>🗑️</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{snapshot.discardPile.length}</div>
                  </TableStat>
                  <TableStat>
                    <div style={{ fontSize: "1.2rem" }}>⏳</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#DC2626" }}>{snapshot.pendingDraws}</div>
                  </TableStat>
                </TableInfo>
              </CenterTable>
            </PlayersRing>
          </GameTable>

          {currentPlayer && currentPlayer.alive && (
            <HandSection>
              {isMyTurn && (
                <InfoCard>
                  <InfoTitle>{t("games.table.actions.start") || "Actions"}</InfoTitle>
                  <ActionButtons>
                    <ActionButton onClick={actions.drawCard} disabled={!canAct || actionBusy === "draw"}>
                      {actionBusy === "draw" ? t("games.table.actions.drawing") || "Drawing..." : t("games.table.actions.draw") || "Draw Card"}
                    </ActionButton>
                    {currentPlayer.hand.includes("skip") && (
                      <ActionButton variant="secondary" onClick={() => actions.playActionCard("skip")} disabled={!canAct || actionBusy === "skip"}>
                        {actionBusy === "skip" ? "Playing..." : t("games.table.actions.playSkip") || "Play Skip"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("attack") && (
                      <ActionButton variant="danger" onClick={() => actions.playActionCard("attack")} disabled={!canAct || actionBusy === "attack"}>
                        {actionBusy === "attack" ? "Playing..." : t("games.table.actions.playAttack") || "Play Attack"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("shuffle") && (
                      <ActionButton variant="secondary" onClick={() => actions.playActionCard("shuffle")} disabled={!canAct || actionBusy === "shuffle"}>
                        {actionBusy === "shuffle" ? "Playing..." : "🔀 Shuffle"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("favor") && (
                      <ActionButton variant="primary" onClick={() => setFavorModal(true)} disabled={!canAct || actionBusy === "favor"}>
                        {actionBusy === "favor" ? "Playing..." : "🤝 Favor"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("see_the_future") && (
                      <ActionButton variant="primary" onClick={actions.playSeeTheFuture} disabled={!canAct || actionBusy === "see_the_future"}>
                        {actionBusy === "see_the_future" ? "Playing..." : "🔮 See Future"}
                      </ActionButton>
                    )}
                  </ActionButtons>
                </InfoCard>
              )}

              <HandContainer>
                <InfoCard>
                  <InfoTitle>
                    {t("games.table.hand.title") || "Your Hand"} ({currentPlayer.hand.length} {currentPlayer.hand.length === 1 ? t("games.table.state.card") || "card" : t("games.table.state.cards") || "cards"})
                  </InfoTitle>
                  <CardsGrid>
                    {(() => {
                      const uniqueCards = Array.from(new Set(currentPlayer.hand));
                      const cardCounts = new Map<ExplodingCatsCard, number>();
                      currentPlayer.hand.forEach((card) => cardCounts.set(card, (cardCounts.get(card) || 0) + 1));

                      return uniqueCards.map((card) => {
                        const count = cardCounts.get(card) || 1;
                        const isCatCard = CAT_CARDS.includes(card as ExplodingCatsCatCard);
                        const canPlayCombo = isCatCard && count >= 2 && canAct && aliveOpponents.length > 0;

                        return (
                          <Card
                            key={card}
                            $cardType={card}
                            $index={0}
                            onClick={() => canPlayCombo && handleOpenCatCombo(card as ExplodingCatsCatCard, currentPlayer.hand)}
                            style={{ cursor: canPlayCombo ? "pointer" : "default", opacity: canPlayCombo ? 1 : isCatCard && count === 1 ? 0.7 : 1 }}
                          >
                            <CardCorner $position="tl" /><CardCorner $position="tr" />
                            <CardCorner $position="bl" /><CardCorner $position="br" />
                            <CardFrame />
                            <CardInner>
                              <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                              <CardName>{t(getCardTranslationKey(card)) || card}</CardName>
                            </CardInner>
                            {count > 1 && <CardCountBadge>{count}</CardCountBadge>}
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
            <ChatCard>
              <InfoTitle>{t("games.table.chat.title") || "Table Chat"}</InfoTitle>
              {snapshot.logs && snapshot.logs.length > 0 ? (
                <ChatMessages ref={chatMessagesRef}>
                  {snapshot.logs.map((log) => (
                    <LogEntry key={log.id} $type={log.type}>
                      {resolveDisplayName(log.senderId ?? undefined, log.senderName ?? undefined) && (
                        <strong>{resolveDisplayName(log.senderId ?? undefined, log.senderName ?? undefined)}: </strong>
                      )}
                      {formatLogMessage(log.message)}
                    </LogEntry>
                  ))}
                </ChatMessages>
              ) : (
                <ChatHint>{t("games.table.chat.empty") || "No messages yet. Break the ice!"}</ChatHint>
              )}
              <ScopeToggle>
                <ScopeOption type="button" $active={chatScope === "all"} onClick={() => setChatScope("all")}>
                  {t("games.table.chat.scope.all") || "All"}
                </ScopeOption>
                <ScopeOption type="button" $active={chatScope === "players"} onClick={() => setChatScope("players")}>
                  {t("games.table.chat.scope.players") || "Players"}
                </ScopeOption>
              </ScopeToggle>
              <ChatInput
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={chatScope === "all" ? t("games.table.chat.placeholderAll") || "Send a note to everyone" : t("games.table.chat.placeholderPlayers") || "Send a note to players"}
                disabled={!currentUserId}
              />
              <ChatControls>
                <ChatHint>{chatScope === "all" ? t("games.table.chat.hintAll") || "Visible to everyone" : t("games.table.chat.hintPlayers") || "Visible to players only"}</ChatHint>
                <ChatSendButton type="button" onClick={handleSendChatMessage} disabled={!currentUserId || !canSendChatMessage}>
                  {t("games.table.chat.send") || "Send"}
                </ChatSendButton>
              </ChatControls>
            </ChatCard>
          )}
        </TableArea>

        {currentPlayer && !currentPlayer.alive && (
          <EmptyState>
            <div style={{ fontSize: "4rem" }}>💀</div>
            <div><strong style={{ fontSize: "1.25rem" }}>{t("games.table.eliminated.title") || "You have been eliminated!"}</strong></div>
            <div style={{ fontSize: "1rem" }}>{t("games.table.eliminated.message") || "Watch the remaining players battle it out"}</div>
          </EmptyState>
        )}
      </GameBoard>

      {/* Cat Combo Modal */}
      {catComboModal && (
        <Modal onClick={handleCloseCatComboModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{getCardEmoji(catComboModal.cat)} Play Cat Combo</ModalTitle>
              <CloseButton onClick={handleCloseCatComboModal}>×</CloseButton>
            </ModalHeader>
            <ModalSection>
              <SectionLabel>Select Combo Mode</SectionLabel>
              <OptionGrid>
                {catComboModal.availableModes.includes("pair") && (
                  <OptionButton $selected={selectedMode === "pair"} onClick={() => setSelectedMode("pair")}>
                    <div style={{ fontSize: "1.5rem" }}>🎴🎴</div>
                    <div>Pair</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Random card from target</div>
                  </OptionButton>
                )}
                {catComboModal.availableModes.includes("trio") && (
                  <OptionButton $selected={selectedMode === "trio"} onClick={() => setSelectedMode("trio")}>
                    <div style={{ fontSize: "1.5rem" }}>🎴🎴🎴</div>
                    <div>Trio</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Choose specific card</div>
                  </OptionButton>
                )}
              </OptionGrid>
            </ModalSection>
            <ModalSection>
              <SectionLabel>Select Target Player</SectionLabel>
              <OptionGrid>
                {aliveOpponents.map((opponent) => (
                  <OptionButton key={opponent.playerId} $selected={selectedTarget === opponent.playerId} onClick={() => setSelectedTarget(opponent.playerId)}>
                    <div style={{ fontSize: "1.5rem" }}>🎮</div>
                    <div>{resolveDisplayName(opponent.playerId, `Player ${opponent.playerId.slice(0, 8)}`)}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{opponent.hand.length} cards</div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
            {selectedMode === "trio" && (
              <ModalSection>
                <SectionLabel>Select Card to Request</SectionLabel>
                <OptionGrid>
                  {["defuse", "attack", "skip", "favor", "shuffle", "see_the_future", ...CAT_CARDS].map((card) => (
                    <OptionButton key={card} $selected={selectedCard === card} onClick={() => setSelectedCard(card as ExplodingCatsCard)}>
                      <div style={{ fontSize: "1.5rem" }}>{getCardEmoji(card as ExplodingCatsCard)}</div>
                      <div style={{ fontSize: "0.75rem" }}>{t(getCardTranslationKey(card as ExplodingCatsCard)) || card}</div>
                    </OptionButton>
                  ))}
                </OptionGrid>
              </ModalSection>
            )}
            <ModalActions>
              <ModalButton variant="secondary" onClick={handleCloseCatComboModal}>Cancel</ModalButton>
              <ModalButton onClick={handleConfirmCatCombo} disabled={!selectedTarget || (selectedMode === "trio" && !selectedCard)}>
                Play Combo
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* See the Future Modal */}
      {seeTheFutureModal && (
        <Modal onClick={() => setSeeTheFutureModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🔮 Top 3 Cards</ModalTitle>
              <CloseButton onClick={() => setSeeTheFutureModal(null)}>×</CloseButton>
            </ModalHeader>
            <OptionGrid>
              {seeTheFutureModal.cards.map((card, index) => (
                <OptionButton key={`${card}-${index}`} $selected={false}>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>#{index + 1}</div>
                  <div style={{ fontSize: "2rem" }}>{getCardEmoji(card)}</div>
                  <div style={{ fontSize: "0.75rem" }}>{t(getCardTranslationKey(card)) || card}</div>
                </OptionButton>
              ))}
            </OptionGrid>
            <ModalActions>
              <ModalButton onClick={() => setSeeTheFutureModal(null)}>Got it!</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Favor Modal */}
      {favorModal && (
        <Modal onClick={() => setFavorModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🤝 Request Favor</ModalTitle>
              <CloseButton onClick={() => setFavorModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalSection>
              <SectionLabel>Select Player</SectionLabel>
              <OptionGrid>
                {aliveOpponents.map((opponent) => (
                  <OptionButton
                    key={opponent.playerId}
                    $selected={selectedTarget === opponent.playerId}
                    onClick={() => setSelectedTarget(opponent.playerId)}
                    disabled={opponent.hand.length === 0}
                  >
                    <div style={{ fontSize: "1.5rem" }}>🎮</div>
                    <div>{resolveDisplayName(opponent.playerId, `Player ${opponent.playerId.slice(0, 8)}`)}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{opponent.hand.length} cards</div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
            <ModalSection>
              <SectionLabel>Select Card to Request</SectionLabel>
              <OptionGrid>
                {["defuse", "attack", "skip", "favor", "shuffle", "see_the_future", ...CAT_CARDS].map((card) => (
                  <OptionButton key={card} $selected={selectedCard === card} onClick={() => setSelectedCard(card as ExplodingCatsCard)}>
                    <div style={{ fontSize: "1.5rem" }}>{getCardEmoji(card as ExplodingCatsCard)}</div>
                    <div style={{ fontSize: "0.75rem" }}>{t(getCardTranslationKey(card as ExplodingCatsCard)) || card}</div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
            <ModalActions>
              <ModalButton variant="secondary" onClick={() => { setFavorModal(false); setSelectedTarget(null); setSelectedCard(null); }}>Cancel</ModalButton>
              <ModalButton 
                onClick={() => {
                  if (selectedTarget && selectedCard) {
                    actions.playFavor(selectedTarget, selectedCard);
                    setFavorModal(false);
                    setSelectedTarget(null);
                    setSelectedCard(null);
                  }
                }} 
                disabled={!selectedTarget || !selectedCard}
              >
                Request Card
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </GameContainer>
  );
}
