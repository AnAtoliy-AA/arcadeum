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
  const myIndex = playerOrder.findIndex((id) => id === currentUserId);
  const viewerIndex = myIndex >= 0 ? myIndex : 0; // Default to 0 if spectating

  return (
    <GameTable>
      <TableBackground $variant={cardVariant} />
      <TableDecorations variant={cardVariant} />
      <PlayersRing $playerCount={playerOrder.length}>
        {playerOrder.map((playerId, index) => {
          const player = players.find((p) => p.playerId === playerId);
          if (!player) return null;

          // Calculate index relative to the viewer so viewer is always 0
          const relativeIndex =
            (index - viewerIndex + playerOrder.length) % playerOrder.length;

          return (
            <TablePlayer
              key={playerId}
              player={player}
              index={index}
              relativeIndex={relativeIndex}
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
