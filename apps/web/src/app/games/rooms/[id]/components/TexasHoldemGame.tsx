"use client";

import React, { useState } from "react";
import styled from "styled-components";
import type {
  GameRoomSummary,
  GameSessionSummary,
  Card,
  Suit,
  Rank,
  TexasHoldemSnapshot,
  TexasHoldemPlayerState,
} from "@/shared/types/games";

interface TexasHoldemGameProps {
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onStart: (startingChips?: number) => void;
  onAction: (action: "fold" | "check" | "call" | "raise", raiseAmount?: number) => void;
  onPostHistoryNote: (message: string, scope: "all" | "players") => void;
  actionBusy: string | null;
  startBusy: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
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
  background: ${({ $isCurrentUser }) =>
    $isCurrentUser
      ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
      : "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)"};
  border: 3px solid
    ${({ $isCurrentTurn }) => ($isCurrentTurn ? "#fbbf24" : "transparent")};
  border-radius: 12px;
  padding: 1rem;
  color: white;
  box-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn
      ? "0 0 20px rgba(251, 191, 36, 0.5)"
      : "0 4px 12px rgba(0, 0, 0, 0.3)"};
`;

const PlayerHand = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: center;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ variant }) => {
    if (variant === "danger") return "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
    if (variant === "secondary") return "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
    return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
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
  border: 2px solid #d1d5db;
  font-size: 1rem;
  width: 120px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const InfoText = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $status }) => {
    if ($status === "folded") return "#dc2626";
    if ($status === "all-in") return "#f59e0b";
    return "#10b981";
  }};
  color: white;
  margin-left: 0.5rem;
`;

function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  return symbols[suit];
}

function renderCard(card: Card): React.ReactNode {
  return (
    <CardElement key={`${card.suit}-${card.rank}`} $suit={card.suit}>
      {card.rank}
    </CardElement>
  );
}

export default function TexasHoldemGame({
  room,
  session,
  currentUserId,
  isHost,
  onStart,
  onAction,
  onPostHistoryNote,
  actionBusy,
  startBusy,
}: TexasHoldemGameProps) {
  const [raiseAmount, setRaiseAmount] = useState<number>(20);

  if (!session || session.status === "waiting") {
    return (
      <Container>
        <PokerTable>
          <PotInfo>Waiting for game to start...</PotInfo>
          {isHost && (
            <Controls>
              <Button
                variant="primary"
                onClick={() => onStart(1000)}
                disabled={startBusy}
              >
                {startBusy ? "Starting..." : "Start Texas Hold'em"}
              </Button>
            </Controls>
          )}
          {!isHost && (
            <InfoText>Waiting for host to start the game...</InfoText>
          )}
        </PokerTable>
      </Container>
    );
  }

  const stateData = session.state as any;
  const snapshot = stateData?.snapshot as TexasHoldemSnapshot | undefined;

  if (!snapshot) {
    return (
      <Container>
        <PokerTable>
          <PotInfo>Loading game state...</PotInfo>
        </PokerTable>
      </Container>
    );
  }

  const currentPlayer = snapshot.players.find((p) => p.playerId === currentUserId);
  const isCurrentTurn =
    currentUserId && snapshot.playerOrder[snapshot.currentTurnIndex] === currentUserId;
  const canAct = isCurrentTurn && currentPlayer && !currentPlayer.folded && !currentPlayer.allIn;

  const callAmount = currentPlayer
    ? snapshot.currentBet - currentPlayer.currentBet
    : 0;

  return (
    <Container>
      <PokerTable>
        {/* Pot */}
        <PotInfo>
          Pot: ${snapshot.pot} | Round: {snapshot.bettingRound}
        </PotInfo>

        {/* Community Cards */}
        {snapshot.communityCards.length > 0 && (
          <CommunityCards>
            {snapshot.communityCards.map((card) => renderCard(card))}
          </CommunityCards>
        )}

        {/* Current Bet */}
        {snapshot.currentBet > 0 && (
          <InfoText>Current Bet: ${snapshot.currentBet}</InfoText>
        )}
      </PokerTable>

      {/* Players */}
      <PlayersContainer>
        {snapshot.players.map((player, idx) => {
          const isCurrent = player.playerId === currentUserId;
          const isTurn = snapshot.playerOrder[snapshot.currentTurnIndex] === player.playerId;
          const isDealer = snapshot.playerOrder[snapshot.dealerIndex] === player.playerId;

          return (
            <PlayerCard
              key={player.playerId}
              $isCurrentTurn={isTurn}
              $isCurrentUser={isCurrent}
            >
              <div>
                <strong>{player.playerId}</strong>
                {isDealer && " 🎯"}
                {player.folded && <StatusBadge $status="folded">Folded</StatusBadge>}
                {player.allIn && <StatusBadge $status="all-in">All-In</StatusBadge>}
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                Chips: ${player.chips}
              </div>
              <div style={{ fontSize: "0.875rem" }}>
                Bet: ${player.currentBet}
              </div>

              {/* Player's hand (only show to current user) */}
              {isCurrent && player.hand.length > 0 && (
                <PlayerHand>
                  {player.hand.map((card) => renderCard(card))}
                </PlayerHand>
              )}
            </PlayerCard>
          );
        })}
      </PlayersContainer>

      {/* Controls */}
      {canAct && (
        <Controls>
          <Button
            variant="danger"
            onClick={() => onAction("fold")}
            disabled={actionBusy === "fold"}
          >
            {actionBusy === "fold" ? "Folding..." : "Fold"}
          </Button>

          {callAmount === 0 ? (
            <Button
              variant="secondary"
              onClick={() => onAction("check")}
              disabled={actionBusy === "check"}
            >
              {actionBusy === "check" ? "Checking..." : "Check"}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => onAction("call")}
              disabled={actionBusy === "call"}
            >
              {actionBusy === "call" ? "Calling..." : `Call $${callAmount}`}
            </Button>
          )}

          <RaiseInput
            type="number"
            min={snapshot.currentBet + 10}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            placeholder="Raise"
          />
          <Button
            variant="primary"
            onClick={() => onAction("raise", raiseAmount)}
            disabled={actionBusy === "raise"}
          >
            {actionBusy === "raise" ? "Raising..." : `Raise to $${raiseAmount}`}
          </Button>
        </Controls>
      )}

      {!canAct && currentPlayer && !currentPlayer.folded && (
        <InfoText>
          {isCurrentTurn ? "Waiting for your action..." : "Waiting for other players..."}
        </InfoText>
      )}

      {session.status === "completed" && (
        <PotInfo style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
          Game Over!
        </PotInfo>
      )}
    </Container>
  );
}
