import React from 'react';
import { useMedia } from 'tamagui';
import { TableStats } from './TableStats';
import {
  GameTable,
  TableBackground,
  PlayersRing,
  OpponentStrip,
} from './styles';
import type { GameVariant } from '@arcadeum/ui';

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
  const media = useMedia();
  const isMobile = media.sm;
  const myIndex = playerOrder.findIndex((id) => id === currentUserId);
  const viewerIndex = myIndex >= 0 ? myIndex : 0; // Default to 0 if spectating

  // On mobile, exclude the viewer from the chip strip — their stats live in
  // the hand zone. On desktop, render every seat around the table circle.
  const visibleOrder = isMobile
    ? playerOrder.filter((id) => id !== currentUserId)
    : playerOrder;

  const playerNodes = visibleOrder.map((playerId) => {
    const player = players.find((p) => p.playerId === playerId);
    if (!player) return null;

    const fullIndex = playerOrder.indexOf(playerId);
    const relativeIndex =
      (fullIndex - viewerIndex + playerOrder.length) % playerOrder.length;

    return (
      <TablePlayer
        key={playerId}
        player={player}
        index={fullIndex}
        relativeIndex={relativeIndex}
        totalPlayers={playerOrder.length}
        currentTurnIndex={currentTurnIndex}
        currentUserId={currentUserId}
        logs={logs}
        resolveDisplayName={resolveDisplayName}
        cardVariant={cardVariant}
      />
    );
  });

  return (
    <GameTable>
      <TableBackground $variant={cardVariant as GameVariant} />
      <TableDecorations $variant={cardVariant as GameVariant} />
      {isMobile ? (
        <OpponentStrip data-testid="opponent-strip">
          {playerNodes}
        </OpponentStrip>
      ) : (
        <PlayersRing>
          {playerNodes}
          <CenterTableSection
            discardPile={discardPile}
            deck={deck}
            cardVariant={cardVariant}
            t={t}
          />
        </PlayersRing>
      )}
      {isMobile && (
        <CenterTableSection
          discardPile={discardPile}
          deck={deck}
          cardVariant={cardVariant}
          t={t}
        />
      )}
      <TableStats
        deckCount={deck.length}
        discardPileCount={discardPileLength}
        pendingDraws={pendingDraws}
        cardVariant={cardVariant}
      />
    </GameTable>
  );
}
