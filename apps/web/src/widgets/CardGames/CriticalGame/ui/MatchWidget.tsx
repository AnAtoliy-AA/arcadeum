'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MatchWidgetGrid } from './styles/layout';
import { Arena } from './arena/Arena';
import { OpponentsRow } from './opponents/OpponentsRow';
import { HandZone } from './hand/HandZone';
import { GameIdleTimer } from '@/features/games/ui';
import { AutoplayControls } from './AutoplayControls';
import { useWidgetFullscreen } from '@/features/games/ui/GameWidgetContainer';
import {
  detectCombo,
  handWithUids,
  asComboCards,
  isTargetedSingle,
  type ComboKind,
} from '../lib/combo';
import { getCardTranslationKey } from '../lib/cardUtils';
import { NarrowViewportProvider } from '../lib/useNarrowViewport';
import { withViewTransition } from '../lib/viewTransition';
import { readHandToggle, writeHandToggle } from '../lib/handToggleStorage';
import { useUrlHashState } from '@/shared/hooks/useUrlHashState';
import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';
import type { UseAutoplayReturn } from '../hooks/useAutoplay';
import type {
  CriticalCard,
  CriticalComboCard,
  CriticalPlayerState,
  CriticalSnapshot,
  GameRoomSummary,
} from '../types';

// Codec for `selectedUids` in the URL hash. CSV (not JSON) so a shared
// link like `#sel=u1,u2,u3` stays readable; uids are short
// alphanumerics so a delimiter collision is not possible.
const SELECTED_UIDS_SERIALIZE = (uids: string[]): string | null =>
  uids.length === 0 ? null : uids.join(',');
const SELECTED_UIDS_DESERIALIZE = (raw: string | null): string[] =>
  raw ? raw.split(',').filter(Boolean) : [];

const DEFUSE_CARDS: readonly CriticalCard[] = [
  'neutralizer',
  'containment_field',
];

export interface MatchWidgetProps {
  room: GameRoomSummary;
  snapshot: CriticalSnapshot;
  currentUserId: string | null;
  currentPlayer: CriticalPlayerState | null;
  cardVariant?: string;
  isGameOver: boolean;
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  resolveDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string | undefined;
  t: (key: string, params?: Record<string, string | number>) => string;
  actions: UseGameActionsReturn;
  handlePlayActionCard: (card: CriticalCard) => void;
  handleOpenEventCombo: (
    cards: CriticalComboCard[],
    hand: CriticalCard[],
  ) => void;
  handleOpenFiverCombo: () => void;
  formatLogMessage: (message?: string | null) => string;
  /**
   * Optional. The hand's fullscreen affordance — when omitted (the widget now
   * renders inside the shared GameWidgetContainer, which owns fullscreen), the
   * hand hides its own fullscreen button.
   */
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  /**
   * Autoplay state + idle-timer wiring. The autoplay menu and the idle
   * countdown badge render at the top of the widget grid. Idle-on-timeout
   * still triggers autoplay even with the menu collapsed.
   */
  autoplayState: UseAutoplayReturn;
  idleTimerEnabled: boolean;
  idleTimerTriggered: boolean;
  handleIdleTimeout: () => void;
  handleStopAutoplay: () => void;
  onOpenRules: () => void;
}

/**
 * Widget-mode renderer for an active Critical match. Three-row stack:
 * `OpponentsRow` (ARC-634) · `Arena` (ARC-632 / ARC-633) · `HandZone`
 * (ARC-635). Owns `selectedUids` so the same selection drives both the
 * arena's `ComboCard` (label + tint) and the rail's `Play` button.
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
  resolveDisplayName,
  t,
  actions,
  handlePlayActionCard,
  handleOpenEventCombo,
  handleOpenFiverCombo,
  formatLogMessage,
  isFullscreen,
  toggleFullscreen,
  autoplayState,
  idleTimerEnabled,
  idleTimerTriggered,
  handleIdleTimeout,
  handleStopAutoplay,
  onOpenRules,
}: MatchWidgetProps) {
  // Read the widget-level fullscreen state from the context owned by
  // GameWidgetContainer. The prop `isFullscreen` is the legacy path;
  // the context is the authoritative source for the sticky bar's z-index.
  const ctxFullscreen = useWidgetFullscreen();
  const effectiveFullscreen = isFullscreen ?? ctxFullscreen;
  // `selectedUids` lives in the URL hash so refresh restores the
  // selection and shareable links carry it. Empty arrays serialize to
  // `null`, keeping the URL clean at idle.
  const [selectedUids, setSelectedUids] = useUrlHashState<string[]>('sel', [], {
    serialize: SELECTED_UIDS_SERIALIZE,
    deserialize: SELECTED_UIDS_DESERIALIZE,
  });
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  // Persist show/hide for the card name + description rows per user. New
  // players see both rows by default (rules text helps them learn);
  // experienced players who collapse to art-only stay collapsed across
  // matches. Storage key is namespaced by user id so multiple accounts
  // on the same browser don't share preferences.
  const togglesStorageKey = currentUserId
    ? `critical:hand-toggles:${currentUserId}`
    : null;
  const [showCardName, setShowCardName] = useState<boolean>(() =>
    readHandToggle(togglesStorageKey, 'name', true),
  );
  const [showCardDescription, setShowCardDescription] = useState<boolean>(() =>
    readHandToggle(togglesStorageKey, 'description', true),
  );
  // Hydration guard for §4.6 + the review's §1.1 follow-up. The
  // `useState` initializer only runs once on mount; if `currentUserId`
  // wasn't available yet (e.g. auth bootstrap hasn't resolved by the
  // time the widget paints), `togglesStorageKey` was `null` and the
  // initializer fell back to the default `true`. This effect re-reads
  // localStorage exactly once when the key transitions from null →
  // string, so persisted preferences actually restore. After hydration
  // the ref stays set so subsequent userId churn doesn't clobber an
  // in-progress toggle. Also doubles as a dirty-flag for the write
  // effects below — without this, a fresh-page write would echo the
  // just-read value straight back into storage on every match start.
  const hydratedFromStorage = useRef(false);
  useEffect(() => {
    if (!togglesStorageKey || hydratedFromStorage.current) return;
    hydratedFromStorage.current = true;
    const name = readHandToggle(togglesStorageKey, 'name', true);
    const desc = readHandToggle(togglesStorageKey, 'description', true);
    setShowCardName(name);
    setShowCardDescription(desc);
  }, [togglesStorageKey]);
  useEffect(() => {
    if (!hydratedFromStorage.current) return;
    writeHandToggle(togglesStorageKey, 'name', showCardName);
  }, [togglesStorageKey, showCardName]);
  useEffect(() => {
    if (!hydratedFromStorage.current) return;
    writeHandToggle(togglesStorageKey, 'description', showCardDescription);
  }, [togglesStorageKey, showCardDescription]);
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
  useEffect(() => {
    // Length-only check missed the same-length-different-uids case: when
    // Nope clears the played card but a fresh draw lands on the same
    // index and reuses the uid, the array length stays the same but the
    // identities shift. Element-wise comparison catches that.
    const drifted =
      validSelectedUids.length !== selectedUids.length ||
      validSelectedUids.some((uid, i) => uid !== selectedUids[i]);
    if (drifted) setSelectedUids(validSelectedUids);
  }, [validSelectedUids, selectedUids, setSelectedUids]);

  const prevIsMyTurn = useRef(isMyTurn);
  useEffect(() => {
    if (prevIsMyTurn.current && !isMyTurn) {
      setTargetPlayerId(null);
      setSelectedUids([]);
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn, setSelectedUids]);

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

  const handleToggleSelect = useCallback(
    (uid: string) => {
      setSelectedUids((prev) =>
        prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid],
      );
    },
    [setSelectedUids],
  );

  const handleDrawAndEnd = useCallback(() => {
    if (!isMyTurn || isGameOver) return;
    // §4.2 — wrap in a view transition so the new card animates into
    // the hand instead of popping in. Falls through synchronously when
    // the browser lacks startViewTransition.
    withViewTransition(() => {
      actions.drawCard();
    });
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
    // §4.2 — animate the play through View Transitions when supported.
    // The browser cross-fades between selected-cards-in-hand and the
    // post-play layout (cards gone, discard top updated). Fallback runs
    // the body synchronously with no animation.
    withViewTransition(() => {
      if (detected.kind === 'single') {
        const cardId = detected.selected[0].id;
        // Targeted singles bypass the legacy modal entirely — the
        // widget already has an armed target, so pass it through to
        // the server in one shot. The fall-through
        // `handlePlayActionCard(id)` for un-targeted cards keeps the
        // existing behaviour (sets + playActionCard / opens a
        // non-target modal for stash, etc.).
        if (isTargetedSingle(cardId)) {
          if (!targetPlayerId) return;
          // `trade` (Favor) has a dedicated socket on the BE — the
          // generic play_action gateway rejects it via
          // isSimpleActionCard. The rest of the targeted singles ride
          // the play_action path.
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
    });
  }, [
    canPlay,
    detected,
    hand,
    targetPlayerId,
    actions,
    handlePlayActionCard,
    handleOpenEventCombo,
    handleOpenFiverCombo,
    setSelectedUids,
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

  const handleClearSelection = useCallback(() => {
    setSelectedUids([]);
    setTargetPlayerId(null);
  }, [setSelectedUids]);

  // Double-click / double-tap on a card selects it and immediately plays.
  // We queue the uid in a ref, set selectedUids, and let the effect below
  // fire handlePlay on the next render when `detected` has recomputed.
  const pendingDoubleClickUid = useRef<string | null>(null);
  const handleDoubleClickCard = useCallback(
    (uid: string) => {
      if (isGameOver || !canAct) return;
      pendingDoubleClickUid.current = uid;
      setSelectedUids([uid]);
    },
    [isGameOver, canAct, setSelectedUids],
  );
  useEffect(() => {
    if (!pendingDoubleClickUid.current) return;
    pendingDoubleClickUid.current = null;
    if (canPlay) handlePlay();
  }, [selectedUids, canPlay, handlePlay]);

  const showHand = !!currentPlayer && currentPlayer.alive && !isGameOver;

  const showAutoplayBar = !isGameOver && !!currentPlayer;

  return (
    <div data-testid="match-widget">
      <NarrowViewportProvider maxWidth={480}>
        <MatchWidgetGrid data-testid="match-widget-grid">
          {showAutoplayBar && (
            <div
              data-testid="match-widget-autoplay-bar"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <GameIdleTimer
                enabled={idleTimerEnabled}
                isMyTurn={isMyTurn}
                canAct={canAct}
                onTimeout={handleIdleTimeout}
                autoplayTriggered={idleTimerTriggered}
                onStop={handleStopAutoplay}
              />
              <AutoplayControls autoplayState={autoplayState} t={t} />
            </div>
          )}
          <OpponentsRow
            opponents={opponents}
            currentTurnPlayerId={turnPlayerId}
            targetPlayerId={targetPlayerId}
            onSelectTarget={
              isMyTurn && !isGameOver && canAct ? handleSelectTarget : undefined
            }
            resolveDisplayName={tileResolveName}
            logs={snapshot.logs ?? []}
          />
          <Arena
            deck={snapshot.deck}
            discardPile={snapshot.discardPile}
            cardVariant={cardVariant}
            isMyTurn={isMyTurn}
            isGameOver={isGameOver}
            onDrawAndEnd={handleDrawAndEnd}
            onClearSelection={handleClearSelection}
            hand={hand}
            allowActionCardCombos={allowActionCardCombos}
            combo={combo}
            currentPlayerName={currentPlayerName}
            pendingDraws={snapshot.pendingDraws}
            logs={snapshot.logs ?? []}
            formatLogMessage={formatLogMessage}
            resolveDisplayName={tileResolveName}
            serverOverloadOdds={snapshot.overloadOdds}
            criticalsRemaining={snapshot.criticalsRemaining}
            hiddenCount={snapshot.hiddenCount}
          />

          {showHand && (
            <HandZone
              cards={handCards}
              selectedUids={validSelectedUids}
              onToggleSelect={handleToggleSelect}
              onClearSelection={handleClearSelection}
              combo={combo}
              defuseCount={defuseCount}
              canPlay={canPlay}
              canDraw={isMyTurn && !isGameOver}
              canNope={canPlayNope}
              cardVariant={cardVariant}
              isFullscreen={effectiveFullscreen}
              showCardName={showCardName}
              showCardDescription={showCardDescription}
              onPlay={handlePlay}
              onDraw={handleDrawAndEnd}
              onNope={actions.playNope}
              onOpenRules={onOpenRules}
              onToggleFullscreen={toggleFullscreen}
              onToggleCardName={handleToggleCardName}
              onToggleCardDescription={handleToggleCardDescription}
              onDoubleClickCard={handleDoubleClickCard}
            />
          )}
        </MatchWidgetGrid>
      </NarrowViewportProvider>
    </div>
  );
}
