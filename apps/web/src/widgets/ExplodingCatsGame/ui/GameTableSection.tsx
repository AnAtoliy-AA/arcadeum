import { TableStats } from './TableStats';
import { LastPlayedCardDisplay } from './LastPlayedCardDisplay';

import {
  GameTable,
  PlayersRing,
  PlayerPositionWrapper,
  PlayerCard,
  PlayerAvatar,
  PlayerName,
  PlayerCardCount,
  TurnIndicator,
  CenterTable,
} from './styles';

import type { ExplodingCatsCard } from '../types';

interface PlayerState {
  playerId: string;
  alive: boolean;
  hand: ExplodingCatsCard[];
}

interface GameTableSectionProps {
  players: PlayerState[];
  playerOrder: string[];
  currentTurnIndex: number;
  currentUserId: string | null;
  deckLength: number;
  discardPileLength: number;
  pendingDraws: number;
  discardPile: ExplodingCatsCard[];
  resolveDisplayName: (playerId: string, fallback: string) => string;
  t: (key: string) => string;
}

export function GameTableSection({
  players,
  playerOrder,
  currentTurnIndex,
  currentUserId,
  deckLength,
  discardPileLength,
  pendingDraws,
  discardPile,
  resolveDisplayName,
  t,
}: GameTableSectionProps) {
  return (
    <GameTable>
      <PlayersRing $playerCount={playerOrder.length}>
        {playerOrder.map((playerId, index) => {
          const player = players.find((p) => p.playerId === playerId);
          if (!player) return null;
          const isCurrent = index === currentTurnIndex;
          const isCurrentUserCard = playerId === currentUserId;
          const displayName = resolveDisplayName(
            playerId,
            `Player ${playerId.slice(0, 8)}`,
          );

          return (
            <PlayerPositionWrapper
              key={playerId}
              $position={index}
              $total={playerOrder.length}
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
          <LastPlayedCardDisplay discardPile={discardPile} t={t} />
        </CenterTable>
      </PlayersRing>
      <TableStats
        deckCount={deckLength}
        discardPileCount={discardPileLength}
        pendingDraws={pendingDraws}
      />
    </GameTable>
  );
}
