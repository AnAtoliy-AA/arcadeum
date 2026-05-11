'use client';

import { useCallback, useMemo, type ComponentProps } from 'react';
import type { ActiveGameContent } from './ActiveGameContent';
import { GameBoard, TableArea } from './styles/layout';
import { GameTableSection } from './GameTableSection';
import { PlayerHand } from './PlayerHand';
import { Arena } from './arena/Arena';

export type MatchWidgetProps = ComponentProps<typeof ActiveGameContent> & {
  /**
   * Format a raw `CriticalLogEntry.message` for display. Comes from
   * `useDisplayNames` in `ActiveGameView` — passed down so the FlashBanner
   * inside the new ArenaCenter can surface formatted log entries.
   */
  formatLogMessage: (message?: string | null) => string;
};

/**
 * Widget-mode renderer for an active Critical match (ARC-631 onwards).
 *
 * Layout-wise this mirrors `ActiveGameContent` for now — same `GameBoard >
 * TableArea > GameTableSection + PlayerHand` shell — with one change: the
 * center of the table is rendered by the new `Arena` (draw · center ·
 * discard) instead of the legacy `CenterTableSection`. The HUD pieces and
 * combo intent card move inside `Arena`'s center column in ARC-633.
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

  const currentPlayerName = useMemo(() => {
    const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex];
    if (!turnPlayerId) return '';
    return resolveDisplayName(turnPlayerId, 'Player') ?? 'Player';
  }, [snapshot.playerOrder, snapshot.currentTurnIndex, resolveDisplayName]);

  const hand = currentPlayer?.hand ?? [];

  const arena = (
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
  );

  return (
    <div data-testid="match-widget">
      <GameBoard>
        <TableArea>
          <GameTableSection
            players={snapshot.players}
            playerOrder={snapshot.playerOrder}
            currentTurnIndex={snapshot.currentTurnIndex}
            currentUserId={currentUserId}
            deck={snapshot.deck}
            discardPileLength={snapshot.discardPile.length}
            pendingDraws={snapshot.pendingDraws}
            discardPile={snapshot.discardPile}
            logs={snapshot.logs ?? []}
            resolveDisplayName={(id, fb) => resolveDisplayName(id, fb) ?? fb}
            t={t as (key: string) => string}
            cardVariant={cardVariant}
            centerSlot={arena}
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
