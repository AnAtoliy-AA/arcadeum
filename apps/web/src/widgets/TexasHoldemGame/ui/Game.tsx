"use client";

import { useState } from "react";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { GameStatus } from "@/features/games/ui/GameStatus";
import { StartButton } from "@/features/games/ui/GameControls";
import { useGameSession, useGameActions } from "@/features/games/hooks";
import type {
  TexasHoldemSnapshot,
  Card,
  Suit,
  GameRoomSummary,
} from "@/shared/types/games";

interface TexasHoldemGameProps {
  roomId: string;
  room: GameRoomSummary;
  isHost: boolean;
  initialSession?: unknown | null;
}

// Poker Table Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  height: 100%;
`;

const PokerTable = styled.div`
  background: linear-gradient(135deg, #0f5132 0%, #0a3622 100%);
  border-radius: 200px;
  padding: 3rem 2rem;
  border: 8px solid #8b4513;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const CommunityCards = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CardElement = styled.div<{ $suit?: Suit }>`
  width: 70px;
  height: 100px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: ${({ $suit }) =>
    $suit === "hearts" || $suit === "diamonds" ? "#dc2626" : "#1f2937"};
  position: relative;

  &::before {
    content: '${({ $suit }) => getSuitSymbol($suit || "spades")}';
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    font-size: 1rem;
  }
`;

const PotInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem 2rem;
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
`;

const PlayersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
`;

const PlayerCard = styled.div<{ $isCurrentTurn?: boolean; $isCurrentUser?: boolean }>`
  background: ${({ $isCurrentUser, theme }) =>
    $isCurrentUser
      ? "linear-gradient(135deg, #3b82f620, #1d4ed820)"
      : theme.surfaces.card.background};
  border: 2px solid ${({ $isCurrentTurn }) => ($isCurrentTurn ? "#fbbf24" : "transparent")};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn ? "0 0 20px rgba(251, 191, 36, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  transition: all 0.3s ease;
`;

const PlayerName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlayerChips = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.25rem;
`;

const PlayerBet = styled.div`
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
`;

const PlayerHand = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const MiniCard = styled.div<{ $suit?: Suit }>`
  width: 40px;
  height: 56px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ $suit }) =>
    $suit === "hearts" || $suit === "diamonds" ? "#dc2626" : "#1f2937"};
`;

const ActionControls = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const ActionButton = styled.button<{ $variant?: "fold" | "check" | "call" | "raise" }>`
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $variant }) => {
    switch ($variant) {
      case "fold":
        return "#dc2626";
      case "check":
        return "#6b7280";
      case "call":
        return "#10b981";
      case "raise":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  }};
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RaiseInput = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.875rem;
  width: 120px;
`;

const InfoText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  margin: 0;
`;

const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 400px;
  padding: 2rem;
`;

// Helper functions
function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  return symbols[suit] || "♠";
}

function renderCard(card: Card): React.ReactNode {
  return (
    <CardElement key={`${card.suit}-${card.rank}`} $suit={card.suit}>
      {card.rank}
    </CardElement>
  );
}

function renderMiniCard(card: Card): React.ReactNode {
  return (
    <MiniCard key={`${card.suit}-${card.rank}`} $suit={card.suit}>
      {card.rank}
    </MiniCard>
  );
}

export default function TexasHoldemGame({ roomId, room, isHost, initialSession }: TexasHoldemGameProps) {
  const [raiseAmount, setRaiseAmount] = useState<number>(20);
  const { snapshot: userSession } = useSessionTokens();

  // Use hooks to get session and actions
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const actions = useGameActions({
    roomId,
    userId: userSession.userId,
    gameType: "texas_holdem_v1",
    onActionComplete: () => setActionBusy(null),
  });

  const currentUserId = userSession.userId;

  // Lobby state - waiting for game to start
  if (!session || session.status === "waiting") {
    return (
      <Container>
        <GameStatus room={room} session={session} />

        <PokerTable>
          <LobbyContainer>
            <PotInfo>🃏 Texas Holdem Poker</PotInfo>
            <InfoText>
              {room.status !== "lobby"
                ? `Loading game state... (Room: ${room.status}, Session: ${session?.status || 'none'})`
                : isHost
                ? "You're the host. Start the game when ready!"
                : "Waiting for host to start the game..."}
            </InfoText>
            {isHost && room.status === "lobby" && (
              <StartButton onClick={() => actions.startHoldem(1000)} disabled={startBusy} />
            )}
          </LobbyContainer>
        </PokerTable>
      </Container>
    );
  }

  // Parse game state
  const stateData = session.state as Record<string, unknown>;
  const snapshot = stateData?.snapshot as TexasHoldemSnapshot | undefined;

  if (!snapshot) {
    return (
      <Container>
        <PokerTable>
          <PotInfo>
            Loading game state...
            <br />
            <small style={{ fontSize: '0.75rem', opacity: 0.7 }}>
              Session: {session.status}, Has state: {session.state ? 'yes' : 'no'}
            </small>
          </PotInfo>
        </PokerTable>
      </Container>
    );
  }

  // Game state
  const currentPlayer = snapshot.players.find((p) => p.playerId === currentUserId);
  const isCurrentTurn =
    currentUserId && snapshot.playerOrder[snapshot.currentTurnIndex] === currentUserId;
  const canAct = isCurrentTurn && currentPlayer && !currentPlayer.folded && !currentPlayer.allIn;

  const callAmount = currentPlayer ? snapshot.currentBet - currentPlayer.currentBet : 0;

  return (
    <Container>
      <GameStatus room={room} session={session} />

      <PokerTable>
        {/* Pot */}
        <PotInfo>
          💰 Pot: ${snapshot.pot} | Round: {snapshot.bettingRound}
          {isCurrentTurn && (
            <>
              <br />
              <span style={{ fontSize: '0.875rem', color: '#fbbf24' }}>
                ⚡ YOUR TURN - Make your move!
              </span>
            </>
          )}
        </PotInfo>

        {/* Community Cards */}
        {snapshot.communityCards.length > 0 && (
          <CommunityCards>{snapshot.communityCards.map((card) => renderCard(card))}</CommunityCards>
        )}

        {/* Current Bet */}
        {snapshot.currentBet > 0 && <InfoText>Current Bet: ${snapshot.currentBet}</InfoText>}
      </PokerTable>

      {/* Players */}
      <PlayersContainer>
        {snapshot.players.map((player, idx) => {
          const isCurrent = player.playerId === currentUserId;
          const isTurn = snapshot.playerOrder[snapshot.currentTurnIndex] === player.playerId;
          const isDealer = snapshot.playerOrder[snapshot.dealerIndex] === player.playerId;

          return (
            <PlayerCard key={player.playerId} $isCurrentTurn={isTurn} $isCurrentUser={isCurrent}>
              <PlayerName>
                {isCurrent ? "You" : `Player ${idx + 1}`}
                {isDealer && " 🔘 (Dealer)"}
                {isTurn && " ⏳ TURN"}
              </PlayerName>
              <PlayerChips>
                💵 Chips: ${player.chips}
                {player.allIn && " (ALL-IN)"}
              </PlayerChips>
              <PlayerBet>Current Bet: ${player.currentBet}</PlayerBet>
              {player.folded && <InfoText style={{ color: "#dc2626" }}>Folded</InfoText>}

              {/* Show player's own hand */}
              {isCurrent && player.hand && player.hand.length > 0 && (
                <PlayerHand>{player.hand.map((card) => renderMiniCard(card))}</PlayerHand>
              )}
            </PlayerCard>
          );
        })}
      </PlayersContainer>

      {/* Action Controls */}
      {canAct && (
        <ActionControls>
          <ActionButton $variant="fold" onClick={() => actions.holdemAction("fold")} disabled={!!actionBusy}>
            Fold
          </ActionButton>

          {callAmount === 0 && (
            <ActionButton $variant="check" onClick={() => actions.holdemAction("check")} disabled={!!actionBusy}>
              Check
            </ActionButton>
          )}

          {callAmount > 0 && (
            <ActionButton $variant="call" onClick={() => actions.holdemAction("call")} disabled={!!actionBusy}>
              Call ${callAmount}
            </ActionButton>
          )}

          <RaiseInput
            type="number"
            min={snapshot.currentBet + 10}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            placeholder="Raise amount"
          />

          <ActionButton
            $variant="raise"
            onClick={() => actions.holdemAction("raise", raiseAmount)}
            disabled={!!actionBusy || raiseAmount < (snapshot.currentBet || 0) + 10}
          >
            Raise to ${raiseAmount}
          </ActionButton>
        </ActionControls>
      )}

      {!canAct && currentPlayer && !currentPlayer.folded && (
        <InfoText>
          ⏳ Waiting for other player to act...
          <br />
          <small style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            Current turn: Player {snapshot.currentTurnIndex + 1} of {snapshot.playerOrder.length}
          </small>
        </InfoText>
      )}

      {currentPlayer?.folded && (
        <InfoText style={{ color: '#dc2626' }}>
          You folded this round. Waiting for the hand to complete...
        </InfoText>
      )}

      {currentPlayer?.allIn && (
        <InfoText style={{ color: '#fbbf24' }}>
          You are all-in! Waiting for other players...
        </InfoText>
      )}
    </Container>
  );
}
