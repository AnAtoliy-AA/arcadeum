import { TableStats } from './TableStats';
import { GameTable, TableBackground, PlayersRing } from './styles';

import { TableDecorations } from './TableDecorations';
import { CenterTableSection } from './CenterTableSection';

import type {
  CriticalCard,
  CriticalLogEntry,
  CriticalPlayerTableState,
} from '../types';
import { TablePlayer } from './TablePlayer';

interface GameTableSectionProps {
  players: CriticalPlayerTableState[];
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
      <TableDecorations variant={cardVariant} />
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

        <CenterTableSection
          discardPile={discardPile}
          deck={deck}
          cardVariant={cardVariant}
          t={t}
        />
      </PlayersRing>
      <TableStats
        deckCount={deck.length}
        discardPileCount={discardPileLength}
        pendingDraws={pendingDraws}
        cardVariant={cardVariant}
      />
    </GameTable>
  );
}
