'use client';

import { useCallback, useMemo, type ComponentProps } from 'react';
import type { ActiveGameContent } from './ActiveGameContent';
import { GameBoard, TableArea } from './styles/layout';
import { PlayerHand } from './PlayerHand';
import { Arena } from './arena/Arena';
import { OpponentsRow } from './opponents/OpponentsRow';

export type MatchWidgetProps = ComponentProps<typeof ActiveGameContent> & {
  /**
   * Format a raw `CriticalLogEntry.message` for display. Comes from
   * `useDisplayNames` in `ActiveGameView` — passed down so the FlashBanner
   * inside the new ArenaCenter can surface formatted log entries.
   */
  formatLogMessage: (message?: string | null) => string;
};

/**
 * Widget-mode renderer for an active Critical match.
 *
 * Layout: a three-row stack — `OpponentsRow` (ARC-634) above the `Arena`
 * (ARC-632 / ARC-633), with the legacy `PlayerHand` at the bottom until
 * ARC-635 swaps in `HandZone`. No longer uses `GameTableSection`'s ring
 * layout; opponents are now a horizontal strip / FFA grid.
 */
export function MatchWidget({
  room: _room,
  snapshot,
  currentUserId,
  currentPlayer,
  cardVariant,
  isGameOver,
  isMyTurn,
  canAct,
  canPlayNope,
  actionBusy,
  aliveOpponents,
  handLayout,
  setHandLayout,
  resolveDisplayName,
  t,
  actions,
  idleTimerTriggered,
  autoplayState,
  handleUnstash,
  handlePlayActionCard,
  handleOpenFavorModal,
  handleOpenEventCombo,
  handleOpenFiverCombo,
  formatLogMessage,
}: MatchWidgetProps) {
  const handleDrawAndEnd = useCallback(() => {
    if (!isMyTurn || isGameOver) return;
    actions.drawCard();
  }, [actions, isMyTurn, isGameOver]);

  const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex] ?? null;
  const currentPlayerName = useMemo(() => {
    if (!turnPlayerId) return '';
    return resolveDisplayName(turnPlayerId, 'Player') ?? 'Player';
  }, [turnPlayerId, resolveDisplayName]);

  const opponents = useMemo(
    () => snapshot.players.filter((p) => p.playerId !== currentUserId),
    [snapshot.players, currentUserId],
  );
  const tileResolveName = useCallback(
    (id: string, fb: string) => resolveDisplayName(id, fb) ?? fb,
    [resolveDisplayName],
  );

  const hand = currentPlayer?.hand ?? [];

  return (
    <div data-testid="match-widget">
      <GameBoard>
        <OpponentsRow
          opponents={opponents}
          currentTurnPlayerId={turnPlayerId}
          resolveDisplayName={tileResolveName}
        />
        <TableArea>
          <Arena
            deck={snapshot.deck}
            discardPile={snapshot.discardPile}
            cardVariant={cardVariant}
            isMyTurn={isMyTurn}
            isGameOver={isGameOver}
            onDrawAndEnd={handleDrawAndEnd}
            hand={hand}
            allowActionCardCombos={snapshot.allowActionCardCombos ?? false}
            currentPlayerName={currentPlayerName}
            pendingDraws={snapshot.pendingDraws}
            logs={snapshot.logs ?? []}
            formatLogMessage={formatLogMessage}
          />
        </TableArea>

        {currentPlayer && currentPlayer.alive && !isGameOver && (
          <PlayerHand
            currentPlayer={currentPlayer}
            onUnstashCard={handleUnstash}
            isMyTurn={isMyTurn}
            isGameOver={isGameOver}
            canAct={canAct}
            canPlayNope={canPlayNope}
            actionBusy={actionBusy}
            aliveOpponents={aliveOpponents}
            discardPileLength={snapshot?.discardPile?.length ?? 0}
            logs={snapshot?.logs ?? []}
            pendingAction={snapshot?.pendingAction ?? null}
            pendingFavor={snapshot?.pendingFavor ?? null}
            pendingDefuse={snapshot?.pendingDefuse ?? null}
            deckSize={snapshot?.deck?.length ?? 0}
            playerOrder={snapshot?.playerOrder ?? []}
            currentUserId={currentUserId}
            allowActionCardCombos={snapshot?.allowActionCardCombos ?? false}
            t={t as (key: string) => string}
            onDraw={actions.drawCard}
            onPlayActionCard={handlePlayActionCard}
            onPlayNope={actions.playNope}
            onPlaySeeTheFuture={actions.playSeeTheFuture}
            onOpenFavorModal={handleOpenFavorModal}
            onGiveFavorCard={actions.giveFavorCard}
            onPlayDefuse={actions.playDefuse}
            onOpenEventCombo={handleOpenEventCombo}
            onOpenFiverCombo={handleOpenFiverCombo}
            forceEnableAutoplay={idleTimerTriggered}
            onAutoplayEnabledChange={autoplayState.setAllEnabled}
            cardVariant={cardVariant}
            handLayout={handLayout}
            setHandLayout={setHandLayout}
          />
        )}
      </GameBoard>
    </div>
  );
}
