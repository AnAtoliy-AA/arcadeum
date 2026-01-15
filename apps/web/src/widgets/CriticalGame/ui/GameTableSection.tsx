import { TableStats } from './TableStats';
import { LastPlayedCardDisplay } from './LastPlayedCardDisplay';
import { DeckDisplay } from './DeckDisplay';
import {
  GameTable,
  TableBackground,
  PlayersRing,
  CenterTable,
  CardSlot,
} from './styles';

import type { CriticalCard, CriticalLogEntry, MarkedCardInfo } from '../types';
import { TablePlayer } from './TablePlayer';

interface PlayerState {
  playerId: string;
  alive: boolean;
  hand: CriticalCard[];
  stash?: CriticalCard[];
  markedCards?: MarkedCardInfo[];
}

interface GameTableSectionProps {
  players: PlayerState[];
  playerOrder: string[];
  currentTurnIndex: number;
  currentUserId: string | null;
  deck: CriticalCard[];
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
  deck,
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
      <TableBackground $variant={cardVariant} />
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
              cardVariant={cardVariant}
            />
          );
        })}

        <CenterTable $variant={cardVariant}>
          <CardSlot>
            <LastPlayedCardDisplay
              discardPile={discardPile}
              t={t}
              cardVariant={cardVariant}
            />
          </CardSlot>
          <CardSlot>
            <DeckDisplay deck={deck} t={t} cardVariant={cardVariant} />
          </CardSlot>
        </CenterTable>
      </PlayersRing>
      <TableStats
        deckCount={deck.length}
        discardPileCount={discardPileLength}
        pendingDraws={pendingDraws}
      />
    </GameTable>
  );
}
