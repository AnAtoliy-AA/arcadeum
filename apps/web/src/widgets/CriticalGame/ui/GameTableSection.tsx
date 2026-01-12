import { TableStats } from './TableStats';
import { LastPlayedCardDisplay } from './LastPlayedCardDisplay';

import { GameTable, TableBackground, PlayersRing, CenterTable } from './styles';

import type { CriticalCard, CriticalLogEntry } from '../types';
import { TablePlayer } from './TablePlayer';

interface PlayerState {
  playerId: string;
  alive: boolean;
  hand: CriticalCard[];
}

interface GameTableSectionProps {
  players: PlayerState[];
  playerOrder: string[];
  currentTurnIndex: number;
  currentUserId: string | null;
  deckLength: number;
  discardPileLength: number;
  pendingDraws: number;
  discardPile: CriticalCard[];
  logs?: CriticalLogEntry[];
  resolveDisplayName: (playerId: string, fallback: string) => string;
  t: (key: string) => string;
  cardVariant?: string;
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
  logs = [],
  resolveDisplayName,
  t,
  cardVariant,
}: GameTableSectionProps) {
  return (
    <GameTable>
      <TableBackground />
      <PlayersRing $playerCount={playerOrder.length}>
        {playerOrder.map((playerId, index) => {
          const player = players.find((p) => p.playerId === playerId);
          if (!player) return null;

          return (
            <TablePlayer
              key={playerId}
              player={player}
              index={index}
              totalPlayers={playerOrder.length}
              currentTurnIndex={currentTurnIndex}
              currentUserId={currentUserId}
              logs={logs}
              resolveDisplayName={resolveDisplayName}
            />
          );
        })}

        <CenterTable>
          <LastPlayedCardDisplay
            discardPile={discardPile}
            t={t}
            cardVariant={cardVariant}
          />
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
