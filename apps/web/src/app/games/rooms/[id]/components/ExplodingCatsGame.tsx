"use client";

import { useMemo, useCallback } from "react";
import styled from "styled-components";
import type {
  GameRoomSummary,
  GameSessionSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
} from "@/shared/types/games";
import { useTranslation } from "@/shared/lib/useTranslation";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 16px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  min-height: 500px;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GameTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const GameStatus = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const StartButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoCard = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
`;

const InfoTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
`;

const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlayerItem = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean }>`
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.gradientStart : "transparent"};
  color: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.text.primary};
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.5)};
  border: 1px solid
    ${({ $isCurrentTurn, theme }) =>
      $isCurrentTurn ? "transparent" : theme.surfaces.panel.border};
  font-weight: ${({ $isCurrentTurn }) => ($isCurrentTurn ? "600" : "400")};
`;

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
`;

const Card = styled.div<{ $cardType?: string }>`
  aspect-ratio: 2/3;
  border-radius: 8px;
  background: ${({ $cardType }) => {
    if ($cardType === "exploding_cat") return "#DC2626";
    if ($cardType === "defuse") return "#10B981";
    if ($cardType === "attack") return "#F59E0B";
    if ($cardType === "skip") return "#3B82F6";
    return "#8B5CF6";
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant, theme }) => {
    if (variant === "danger") {
      return `
        background: #DC2626;
        color: white;
      `;
    }
    if (variant === "secondary") {
      return `
        background: ${theme.buttons.secondary.background};
        color: ${theme.buttons.secondary.text};
        border: 1px solid ${theme.buttons.secondary.border};
      `;
    }
    return `
      background: ${theme.buttons.primary.gradientStart};
      color: ${theme.buttons.primary.text};
    `;
  }}

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GameLog = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const LogEntry = styled.div<{ $type?: string }>`
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $type, theme }) => {
    if ($type === "action") return theme.surfaces.panel.background;
    if ($type === "system") return theme.background.base;
    return "transparent";
  }};
  color: ${({ theme }) => theme.text.secondary};
  border-left: 3px solid
    ${({ $type }) => {
      if ($type === "action") return "#3B82F6";
      if ($type === "system") return "#8B5CF6";
      return "transparent";
    }};
  padding-left: 0.75rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
  text-align: center;
`;

interface ExplodingCatsGameProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlayCard: (card: "skip" | "attack") => void;
  actionBusy: string | null;
  startBusy: boolean;
}

function getCardTranslationKey(card: ExplodingCatsCard): string {
  const keys: Record<ExplodingCatsCard, string> = {
    exploding_cat: "games.table.cards.explodingCat",
    defuse: "games.table.cards.defuse",
    attack: "games.table.cards.attack",
    skip: "games.table.cards.skip",
    tacocat: "games.table.cards.tacocat",
    hairy_potato_cat: "games.table.cards.hairyPotatoCat",
    rainbow_ralphing_cat: "games.table.cards.rainbowRalphingCat",
    cattermelon: "games.table.cards.cattermelon",
    bearded_cat: "games.table.cards.beardedCat",
  };
  return keys[card] || "games.table.cards.generic";
}

function getCardEmoji(card: ExplodingCatsCard): string {
  const emojis: Record<ExplodingCatsCard, string> = {
    exploding_cat: "💣",
    defuse: "🛡️",
    attack: "⚔️",
    skip: "⏭️",
    tacocat: "🌮",
    hairy_potato_cat: "🥔",
    rainbow_ralphing_cat: "🌈",
    cattermelon: "🍉",
    bearded_cat: "🧔",
  };
  return emojis[card] || "🐱";
}

export function ExplodingCatsGame({
  room,
  session,
  currentUserId,
  isHost,
  onStart,
  onDraw,
  onPlayCard,
  actionBusy,
  startBusy,
}: ExplodingCatsGameProps) {
  const { t } = useTranslation();

  const snapshot: ExplodingCatsSnapshot | null = useMemo(() => {
    if (!session?.state?.snapshot) return null;
    return session.state.snapshot as ExplodingCatsSnapshot;
  }, [session]);

  const currentPlayer: ExplodingCatsPlayerState | null = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId) || null;
  }, [snapshot, currentUserId]);

  const currentTurnPlayer = useMemo(() => {
    if (!snapshot) return null;
    const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex];
    return snapshot.players.find((p) => p.playerId === turnPlayerId);
  }, [snapshot]);

  const isMyTurn = useMemo(() => {
    return currentTurnPlayer?.playerId === currentUserId;
  }, [currentTurnPlayer, currentUserId]);

  const canAct = useMemo(() => {
    return isMyTurn && !actionBusy && currentPlayer?.alive;
  }, [isMyTurn, actionBusy, currentPlayer]);

  const resolveDisplayName = useCallback(
    (userId?: string | null, fallback?: string | null) => {
      if (!userId) {
        return fallback ?? "";
      }
      if (userId === currentUserId) {
        return t("games.table.players.you") || "You";
      }
      if (room.host?.id === userId) {
        return room.host.displayName || room.host.id;
      }
      const member = room.members?.find((candidate) => candidate.id === userId);
      if (member) {
        return member.displayName || member.id;
      }
      return (
        fallback ||
        (userId.length > 8
          ? `${userId.slice(0, 8)}…`
          : userId)
      );
    },
    [currentUserId, room.host, room.members, t]
  );

  const participantReplacements = useMemo(() => {
    const entries = new Map<string, string>();
    const register = (userId?: string | null, fallback?: string | null) => {
      if (!userId) {
        return;
      }
      if (entries.has(userId)) {
        return;
      }
      entries.set(userId, resolveDisplayName(userId, fallback));
    };

    register(room.host?.id, room.host?.displayName ?? null);
    room.members?.forEach((member) =>
      register(
        member.id,
        member.displayName ?? null
      )
    );
    snapshot?.players.forEach((player) =>
      register(
        player.playerId,
        player.playerId === currentUserId
          ? t("games.table.players.you") || "You"
          : `Player ${player.playerId.slice(0, 8)}`
      )
    );

    return Array.from(entries.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );
  }, [currentUserId, resolveDisplayName, room.host, room.members, snapshot?.players, t]);

  const formatLogMessage = useCallback(
    (message?: string | null) => {
      if (!message || participantReplacements.length === 0) {
        return message || "";
      }
      return participantReplacements.reduce((acc, [id, name]) => {
        if (!id || !name || id === name || !acc.includes(id)) {
          return acc;
        }
        return acc.split(id).join(name);
      }, message);
    },
    [participantReplacements]
  );

  // Game not started yet
  if (!snapshot) {
    return (
      <GameContainer>
        <GameHeader>
          <GameInfo>
            <GameTitle>Exploding Cats</GameTitle>
            <GameStatus>
              {room.playerCount} {t("games.table.lobby.playersInLobby") || "players in lobby"}
            </GameStatus>
          </GameInfo>
          {isHost && (
            <StartButton onClick={onStart} disabled={startBusy || room.playerCount < 2}>
              {startBusy
                ? t("games.table.actions.starting") || "Starting..."
                : t("games.table.actions.start") || "Start Game"}
            </StartButton>
          )}
        </GameHeader>
        <EmptyState>
          <div style={{ fontSize: "3rem" }}>🎮</div>
          <div>
            <strong>{t("games.table.lobby.waitingToStart") || "Waiting for game to start..."}</strong>
          </div>
          <div style={{ fontSize: "0.875rem" }}>
            {room.playerCount < 2
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
    <GameContainer>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
          <GameStatus>
            {currentTurnPlayer
              ? `${
                  currentTurnPlayer.playerId === currentUserId
                    ? t("games.table.players.yourTurn") || "Your turn"
                    : t("games.table.players.waitingFor") || "Waiting for player..."
                }`
              : "Game in progress"}
          </GameStatus>
        </GameInfo>
      </GameHeader>

      <GameBoard>
        <LeftPanel>
          <InfoCard>
            <InfoTitle>
              {t("games.table.state.deck") || "Game State"}
            </InfoTitle>
            <InfoContent>
              <div>
                {t("games.table.state.deck") || "Deck"}: {snapshot.deck.length}{" "}
                {t("games.table.state.cards") || "cards"}
              </div>
              <div>
                {t("games.table.state.discard") || "Discard"}: {snapshot.discardPile.length}{" "}
                {t("games.table.state.cards") || "cards"}
              </div>
              <div>
                {t("games.table.state.pendingDraws") || "Pending draws"}: {snapshot.pendingDraws}
              </div>
            </InfoContent>
          </InfoCard>

          <InfoCard>
            <InfoTitle>{t("games.rooms.participants") || "Players"}</InfoTitle>
            <PlayersList>
              {snapshot.playerOrder.map((playerId, index) => {
                const player = snapshot.players.find((p) => p.playerId === playerId);
                if (!player) return null;

                const isCurrent = index === snapshot.currentTurnIndex;
                const displayName = resolveDisplayName(
                  playerId,
                  playerId === currentUserId
                    ? t("games.table.players.you") || "You"
                    : `Player ${playerId.slice(0, 8)}`
                );

                return (
                  <PlayerItem
                    key={playerId}
                    $isCurrentTurn={isCurrent}
                    $isAlive={player.alive}
                  >
                    {displayName} {!player.alive && "💀"}
                    {player.alive &&
                      ` (${player.hand.length} ${
                        player.hand.length === 1
                          ? t("games.table.state.card") || "card"
                          : t("games.table.state.cards") || "cards"
                      })`}
                  </PlayerItem>
                );
              })}
            </PlayersList>
          </InfoCard>

          {snapshot.logs && snapshot.logs.length > 0 && (
            <InfoCard>
              <InfoTitle>{t("games.table.log.title") || "Game Log"}</InfoTitle>
              <GameLog>
                {snapshot.logs.slice(-10).map((log) => {
                  const senderDisplay = resolveDisplayName(
                    log.senderId ?? undefined,
                    log.senderName ?? undefined
                  );
                  const renderedMessage = formatLogMessage(log.message);

                  return (
                    <LogEntry key={log.id} $type={log.type}>
                      {senderDisplay && <strong>{senderDisplay}: </strong>}
                      {renderedMessage}
                    </LogEntry>
                  );
                })}
              </GameLog>
            </InfoCard>
          )}
        </LeftPanel>

        <RightPanel>
          {currentPlayer && currentPlayer.alive && (
            <HandContainer>
              <InfoCard>
                <InfoTitle>
                  {t("games.table.hand.title") || "Your Hand"} ({currentPlayer.hand.length}{" "}
                  {currentPlayer.hand.length === 1
                    ? t("games.table.state.card") || "card"
                    : t("games.table.state.cards") || "cards"}
                  )
                </InfoTitle>
                <CardsGrid>
                  {currentPlayer.hand.map((card, index) => (
                    <Card key={`${card}-${index}`} $cardType={card}>
                      {getCardEmoji(card)} {t(getCardTranslationKey(card) as any) || card}
                    </Card>
                  ))}
                </CardsGrid>
              </InfoCard>

              {isMyTurn && (
                <InfoCard>
                  <InfoTitle>{t("games.table.actions.start") || "Actions"}</InfoTitle>
                  <ActionButtons>
                    <ActionButton
                      onClick={onDraw}
                      disabled={!canAct || actionBusy === "draw"}
                    >
                      {actionBusy === "draw"
                        ? t("games.table.actions.drawing") || "Drawing..."
                        : t("games.table.actions.draw") || "Draw Card"}
                    </ActionButton>
                    {currentPlayer.hand.includes("skip") && (
                      <ActionButton
                        variant="secondary"
                        onClick={() => onPlayCard("skip")}
                        disabled={!canAct || actionBusy === "skip"}
                      >
                        {actionBusy === "skip"
                          ? t("games.table.actions.playingSkip") || "Playing..."
                          : t("games.table.actions.playSkip") || "Play Skip"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("attack") && (
                      <ActionButton
                        variant="danger"
                        onClick={() => onPlayCard("attack")}
                        disabled={!canAct || actionBusy === "attack"}
                      >
                        {actionBusy === "attack"
                          ? t("games.table.actions.playingAttack") || "Playing..."
                          : t("games.table.actions.playAttack") || "Play Attack"}
                      </ActionButton>
                    )}
                  </ActionButtons>
                </InfoCard>
              )}
            </HandContainer>
          )}

          {currentPlayer && !currentPlayer.alive && (
            <EmptyState>
              <div style={{ fontSize: "3rem" }}>💀</div>
              <div>
                <strong>{t("games.table.eliminated.title") || "You have been eliminated!"}</strong>
              </div>
              <div style={{ fontSize: "0.875rem" }}>
                {t("games.table.eliminated.message") ||
                  "Watch the remaining players battle it out"}
              </div>
            </EmptyState>
          )}
        </RightPanel>
      </GameBoard>
    </GameContainer>
  );
}
