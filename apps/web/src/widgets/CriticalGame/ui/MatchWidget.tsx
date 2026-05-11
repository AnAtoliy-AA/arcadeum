'use client';

import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import type { ActiveGameContent } from './ActiveGameContent';
import { GameBoard, TableArea } from './styles/layout';
import { Arena } from './arena/Arena';
import { OpponentsRow } from './opponents/OpponentsRow';
import { HandZone } from './hand/HandZone';
import { RulesModal } from './RulesModal';
import {
  detectCombo,
  handWithUids,
  asComboCards,
  type ComboKind,
} from '../lib/combo';
import { getCardTranslationKey } from '../lib/cardUtils';
import type { CriticalCard } from '../types';

const DEFUSE_CARDS: readonly CriticalCard[] = [
  'neutralizer',
  'containment_field',
];

export type MatchWidgetProps = ComponentProps<typeof ActiveGameContent> & {
  /**
   * Format a raw `CriticalLogEntry.message` for display. Comes from
   * `useDisplayNames` in `ActiveGameView` — passed down so the FlashBanner
   * inside the new ArenaCenter can surface formatted log entries.
   */
  formatLogMessage: (message?: string | null) => string;
  /**
   * Fullscreen state + toggle, sourced from `useFullscreen` in the
   * parent. The HandRail menu (ARC-636) exposes the toggle so widget
   * mode doesn't need the legacy `CriticalGameHeader` to access it.
   */
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};

/**
 * Widget-mode renderer for an active Critical match. Three-row stack:
 * `OpponentsRow` (ARC-634) · `Arena` (ARC-632 / ARC-633) · `HandZone`
 * (ARC-635). Owns `selectedUids` so the same selection drives both the
 * arena's `ComboCard` (label + tint) and the rail's `Play` button.
 */
export function MatchWidget({
  room,
  snapshot,
  currentUserId,
  currentPlayer,
  cardVariant,
  isGameOver,
  isMyTurn,
  canAct,
  canPlayNope,
  actionBusy: _actionBusy,
  aliveOpponents: _aliveOpponents,
  handLayout: _handLayout,
  setHandLayout: _setHandLayout,
  resolveDisplayName,
  t,
  actions,
  idleTimerTriggered: _idleTimerTriggered,
  autoplayState: _autoplayState,
  handleUnstash: _handleUnstash,
  handlePlayActionCard,
  handleOpenFavorModal: _handleOpenFavorModal,
  handleOpenEventCombo,
  handleOpenFiverCombo,
  formatLogMessage,
  isFullscreen,
  toggleFullscreen,
}: MatchWidgetProps) {
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const handleOpenRules = useCallback(() => setRulesOpen(true), []);
  const handleCloseRules = useCallback(() => setRulesOpen(false), []);

  // Memoize hand so downstream useCallback / useMemo deps are stable when
  // the parent re-renders without `currentPlayer.hand` actually changing.
  const hand = useMemo(() => currentPlayer?.hand ?? [], [currentPlayer?.hand]);
  const handCards = useMemo(() => handWithUids(hand), [hand]);
  const selectedSet = useMemo(() => new Set(selectedUids), [selectedUids]);
  const selectedCards = useMemo(
    () => handCards.filter((c) => selectedSet.has(c.uid)),
    [handCards, selectedSet],
  );
  // Drop stale uids when the hand shrinks (cards played / lost). Keeping
  // them in state would leave the Play button referring to nothing.
  const validSelectedUids = useMemo(
    () => selectedCards.map((c) => c.uid),
    [selectedCards],
  );

  const allowActionCardCombos = snapshot.allowActionCardCombos ?? false;
  const detected = useMemo(
    () => detectCombo(selectedCards, allowActionCardCombos),
    [selectedCards, allowActionCardCombos],
  );

  const tCompat = t as unknown as (
    key: string,
    params?: Record<string, string | number>,
  ) => string;

  const comboLabel = useMemo(() => {
    const name = detected.cardId
      ? tCompat(getCardTranslationKey(detected.cardId, cardVariant))
      : '';
    return tCompat(detected.labelKey, name ? { name } : undefined);
  }, [detected, tCompat, cardVariant]);

  const combo: { kind: ComboKind; label: string } = {
    kind: detected.kind,
    label: comboLabel,
  };

  const handleToggleSelect = useCallback((uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid],
    );
  }, []);

  const handleDrawAndEnd = useCallback(() => {
    if (!isMyTurn || isGameOver) return;
    actions.drawCard();
  }, [actions, isMyTurn, isGameOver]);

  const canPlay = useMemo(() => {
    if (!isMyTurn || isGameOver || !canAct) return false;
    return (
      detected.kind === 'single' ||
      detected.kind === 'pair' ||
      detected.kind === 'triple' ||
      detected.kind === 'five'
    );
  }, [isMyTurn, isGameOver, canAct, detected.kind]);

  const handlePlay = useCallback(() => {
    if (!canPlay) return;
    if (detected.kind === 'single') {
      handlePlayActionCard(detected.selected[0].id);
    } else if (detected.kind === 'pair' || detected.kind === 'triple') {
      handleOpenEventCombo(asComboCards(detected.selected), hand);
    } else if (detected.kind === 'five') {
      handleOpenFiverCombo();
    }
    setSelectedUids([]);
  }, [
    canPlay,
    detected,
    hand,
    handlePlayActionCard,
    handleOpenEventCombo,
    handleOpenFiverCombo,
  ]);

  const defuseCount = useMemo(
    () => hand.filter((c) => DEFUSE_CARDS.includes(c)).length,
    [hand],
  );

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

  const showHand = !!currentPlayer && currentPlayer.alive && !isGameOver;

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
            allowActionCardCombos={allowActionCardCombos}
            combo={combo}
            currentPlayerName={currentPlayerName}
            pendingDraws={snapshot.pendingDraws}
            logs={snapshot.logs ?? []}
            formatLogMessage={formatLogMessage}
          />
        </TableArea>

        {showHand && (
          <HandZone
            cards={handCards}
            selectedUids={validSelectedUids}
            onToggleSelect={handleToggleSelect}
            combo={combo}
            defuseCount={defuseCount}
            canPlay={canPlay}
            canDraw={isMyTurn && !isGameOver}
            canNope={canPlayNope}
            cardVariant={cardVariant}
            isFullscreen={isFullscreen}
            onPlay={handlePlay}
            onDraw={handleDrawAndEnd}
            onNope={actions.playNope}
            onOpenRules={handleOpenRules}
            onToggleFullscreen={toggleFullscreen}
          />
        )}
      </GameBoard>
      <RulesModal
        isOpen={rulesOpen}
        onClose={handleCloseRules}
        currentVariant={cardVariant || 'default'}
        isPrivate={room?.visibility === 'private'}
        t={t}
      />
    </div>
  );
}
