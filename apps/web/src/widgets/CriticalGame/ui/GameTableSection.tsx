'use client';

import React, { type ReactNode } from 'react';
import { useMedia, XStack } from 'tamagui';
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
import { OpponentTile } from './opponents/OpponentTile';

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
  centerSlot?: ReactNode;
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
  centerSlot,
}: GameTableSectionProps) {
  const media = useMedia();
  const isMobile = media.sm;
  const center = centerSlot ?? (
    <XStack data-testid="center-table-row">
      <CenterTableSection
        discardPile={discardPile}
        deck={deck}
        cardVariant={cardVariant}
        t={t}
      />
    </XStack>
  );
  const myIndex = playerOrder.findIndex((id) => id === currentUserId);
  const viewerIndex = myIndex >= 0 ? myIndex : 0;

  // On mobile, use the dedicated OpponentTile component in the strip.
  // On desktop, continue using the TablePlayer positioned in the ring.
  const visibleOrder = isMobile
    ? playerOrder.filter((id) => id !== currentUserId)
    : playerOrder;

  const currentTurnPlayerId = playerOrder[currentTurnIndex] ?? null;

  const playerNodes = visibleOrder.map((playerId) => {
    const player = players.find((p) => p.playerId === playerId);
    if (!player) return null;

    if (isMobile) {
      return (
        <OpponentTile
          key={playerId}
          player={player}
          isCurrentTurn={playerId === currentTurnPlayerId}
          resolveDisplayName={resolveDisplayName}
        />
      );
    }

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
          {center}
        </PlayersRing>
      )}
      {isMobile && center}
      <TableStats
        deckCount={deck.length}
        discardPileCount={discardPileLength}
        pendingDraws={pendingDraws}
        cardVariant={cardVariant}
      />
    </GameTable>
  );
}
