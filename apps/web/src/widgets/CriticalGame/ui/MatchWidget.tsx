'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import type { ActiveGameContent } from './ActiveGameContent';
import { MatchWidgetGrid } from './styles/layout';
import { Arena } from './arena/Arena';
import { OpponentsRow } from './opponents/OpponentsRow';
import { HandZone } from './hand/HandZone';
import { RulesModal } from './RulesModal';
import {
  detectCombo,
  handWithUids,
  asComboCards,
  isTargetedSingle,
  type ComboKind,
} from '../lib/combo';
import { getCardTranslationKey } from '../lib/cardUtils';
import { NarrowViewportProvider } from '../lib/useNarrowViewport';
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
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  // Per-session show/hide for the card name + description rows. Default
  // both ON so first-time players see the rules text; experienced
  // players can collapse to art-only via the rail toggles.
  const [showCardName, setShowCardName] = useState(true);
  const [showCardDescription, setShowCardDescription] = useState(true);
  const handleOpenRules = useCallback(() => setRulesOpen(true), []);
  const handleCloseRules = useCallback(() => setRulesOpen(false), []);
  const handleToggleCardName = useCallback(
    () => setShowCardName((v) => !v),
    [],
  );
  const handleToggleCardDescription = useCallback(
    () => setShowCardDescription((v) => !v),
    [],
  );

  // Memoize hand so downstream useCallback / useMemo deps are stable when
  // the parent re-renders without `currentPlayer.hand` actually changing.
  const hand = useMemo(() => currentPlayer?.hand ?? [], [currentPlayer?.hand]);
  const handCards = useMemo(() => handWithUids(hand), [hand]);
  const selectedSet = useMemo(() => new Set(selectedUids), [selectedUids]);
  const selectedCards = useMemo(
    () => handCards.filter((c) => selectedSet.has(c.uid)),
    [handCards, selectedSet],
  );
  // Drop stale uids when the hand shrinks (cards played / lost) so the
  // Play button never references nothing. `validSelectedUids` is what we
  // pass downstream; the effect below re-syncs `selectedUids` state so
  // pruned uids don't linger as ghost selections after Favor/Nope side
  // effects (ARC-644).
  const validSelectedUids = useMemo(
    () => selectedCards.map((c) => c.uid),
    [selectedCards],
  );
  /* eslint-disable react-hooks/set-state-in-effect --
   * State sync with derived data:
   * 1. Hand-shrink: when Favor/Nope strips a card mid-turn, selectedUids
   *    holds a uid that no longer matches the hand. If a new card lands
   *    on the same index it reuses the uid and silently re-selects.
   *    We must mirror `validSelectedUids` back into state.
   * 2. Turn-flip: armed target + selection only make sense while it's
   *    my turn. Clearing on `!isMyTurn` avoids carrying intent across
   *    turns.
   * Both are external-event syncs (server snapshot pushes), not the
   * cascading-renders pattern the rule guards against.
   */
  useEffect(() => {
    // Length-only check missed the same-length-different-uids case: when
    // Nope clears the played card but a fresh draw lands on the same
    // index and reuses the uid, the array length stays the same but the
    // identities shift. Element-wise comparison catches that.
    const drifted =
      validSelectedUids.length !== selectedUids.length ||
      validSelectedUids.some((uid, i) => uid !== selectedUids[i]);
    if (drifted) setSelectedUids(validSelectedUids);
  }, [validSelectedUids, selectedUids]);

  const prevIsMyTurn = useRef(isMyTurn);
  useEffect(() => {
    if (prevIsMyTurn.current && !isMyTurn) {
      setTargetPlayerId(null);
      setSelectedUids([]);
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSelectTarget = useCallback(
    (id: string) => setTargetPlayerId((curr) => (curr === id ? null : id)),
    [],
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

  // A targeted single (e.g. `targeted_strike`) needs an armed opponent
  // before it can play. Surface this in the combo label so the rail's
  // Play button reads "Pick a target" instead of the disabled card name.
  const requiresTarget =
    detected.kind === 'single' && isTargetedSingle(detected.selected[0].id);
  const needsTargetPick = requiresTarget && !targetPlayerId;

  const comboLabel = useMemo(() => {
    if (needsTargetPick) return tCompat('games.table.hud.combo.pickTarget');
    const name = detected.cardId
      ? tCompat(getCardTranslationKey(detected.cardId, cardVariant))
      : '';
    return tCompat(detected.labelKey, name ? { name } : undefined);
  }, [detected, tCompat, cardVariant, needsTargetPick]);

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
    const validKind =
      detected.kind === 'single' ||
      detected.kind === 'pair' ||
      detected.kind === 'triple' ||
      detected.kind === 'five';
    if (!validKind) return false;
    if (requiresTarget && !targetPlayerId) return false;
    return true;
  }, [
    isMyTurn,
    isGameOver,
    canAct,
    detected.kind,
    requiresTarget,
    targetPlayerId,
  ]);

  const handlePlay = useCallback(() => {
    if (!canPlay) return;
    if (detected.kind === 'single') {
      const cardId = detected.selected[0].id;
      // Targeted singles bypass the legacy modal entirely — the widget
      // already has an armed target, so pass it through to the server in
      // one shot. The fall-through `handlePlayActionCard(id)` for
      // un-targeted cards keeps the existing behaviour (sets +
      // playActionCard / opens a non-target modal for stash, etc.).
      if (isTargetedSingle(cardId)) {
        if (!targetPlayerId) return;
        // `trade` (Favor) has a dedicated socket on the BE — the generic
        // play_action gateway rejects it via isSimpleActionCard. The rest
        // of the targeted singles ride the play_action path.
        if (cardId === 'trade') {
          actions.playFavor(targetPlayerId);
        } else {
          actions.playActionCard(cardId, { targetPlayerId });
        }
      } else {
        handlePlayActionCard(cardId);
      }
    } else if (detected.kind === 'pair' || detected.kind === 'triple') {
      handleOpenEventCombo(asComboCards(detected.selected), hand);
    } else if (detected.kind === 'five') {
      handleOpenFiverCombo();
    }
    setSelectedUids([]);
    setTargetPlayerId(null);
  }, [
    canPlay,
    detected,
    hand,
    targetPlayerId,
    actions,
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
      <NarrowViewportProvider maxWidth={480}>
        <MatchWidgetGrid data-testid="match-widget-grid">
          <OpponentsRow
            opponents={opponents}
            currentTurnPlayerId={turnPlayerId}
            targetPlayerId={targetPlayerId}
            onSelectTarget={
              isMyTurn && !isGameOver && canAct ? handleSelectTarget : undefined
            }
            resolveDisplayName={tileResolveName}
          />
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
            serverOverloadOdds={snapshot.overloadOdds}
            hiddenCount={snapshot.hiddenCount}
          />

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
              showCardName={showCardName}
              showCardDescription={showCardDescription}
              onPlay={handlePlay}
              onDraw={handleDrawAndEnd}
              onNope={actions.playNope}
              onOpenRules={handleOpenRules}
              onToggleFullscreen={toggleFullscreen}
              onToggleCardName={handleToggleCardName}
              onToggleCardDescription={handleToggleCardDescription}
            />
          )}
        </MatchWidgetGrid>
      </NarrowViewportProvider>
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
