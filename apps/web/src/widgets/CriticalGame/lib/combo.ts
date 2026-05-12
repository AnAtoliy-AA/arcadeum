import { COMBO_CARDS, FIVER_COMBO_SIZE } from '../types';
import type { CriticalCard, CriticalComboCard } from '../types';

/**
 * Per-instance card identity for hand selection. The hand is a
 * `CriticalCard[]` with duplicates allowed, so we derive a stable uid
 * from the card type + its index in the hand. Selection is client-only
 * and resolves to `cardType + count` on submit, so the server never sees
 * these uids.
 */
export interface HandCardInstance {
  uid: string;
  id: CriticalCard;
  index: number;
}

export function handWithUids(hand: CriticalCard[]): HandCardInstance[] {
  return hand.map((card, index) => ({
    uid: `${card}-${index}`,
    id: card,
    index,
  }));
}

export type ComboKind =
  | 'none'
  | 'single'
  | 'pair'
  | 'triple'
  | 'five'
  | 'invalid';

export interface DetectedCombo {
  kind: ComboKind;
  /** Stable i18n key for the contextual play label. */
  labelKey:
    | 'games.table.hud.combo.placeholder'
    | 'games.table.hud.combo.playSingle'
    | 'games.table.hud.combo.playPair'
    | 'games.table.hud.combo.playTriple'
    | 'games.table.hud.combo.playFiver'
    | 'games.table.hud.combo.invalid';
  /** Card type that drives the label (e.g. the matched name for pair/triple). */
  cardId?: CriticalCard;
  selected: HandCardInstance[];
}

const COMBO_SET = new Set<CriticalCard>(COMBO_CARDS);

function allSameId(cards: HandCardInstance[]): boolean {
  if (cards.length < 2) return false;
  const first = cards[0].id;
  return cards.every((c) => c.id === first);
}

function allDifferentIds(cards: HandCardInstance[]): boolean {
  return new Set(cards.map((c) => c.id)).size === cards.length;
}

/**
 * Classify a selection of card instances. Mirrors the gameplay validity
 * rules:
 *   - 0 cards    → none (placeholder label)
 *   - 1 card     → single (will play immediately)
 *   - 2 same     → pair combo (steal a random card)
 *   - 3 same     → triple combo (name a card)
 *   - 5 distinct → five combo (pick from discard)
 *   - anything else → invalid
 *
 * `allowActionCardCombos` is a house rule from the snapshot. When false,
 * combos require the canonical combo card family — non-combo cards
 * (strike, evade, ...) can never form a combo even if they match.
 */
export function detectCombo(
  selected: HandCardInstance[],
  allowActionCardCombos: boolean,
): DetectedCombo {
  if (selected.length === 0) {
    return {
      kind: 'none',
      labelKey: 'games.table.hud.combo.placeholder',
      selected,
    };
  }
  if (selected.length === 1) {
    return {
      kind: 'single',
      labelKey: 'games.table.hud.combo.playSingle',
      cardId: selected[0].id,
      selected,
    };
  }

  const sameId = allSameId(selected);
  const eligibleForCombo =
    allowActionCardCombos || selected.every((c) => COMBO_SET.has(c.id));

  if (selected.length === 2 && sameId && eligibleForCombo) {
    return {
      kind: 'pair',
      labelKey: 'games.table.hud.combo.playPair',
      cardId: selected[0].id,
      selected,
    };
  }
  if (selected.length === 3 && sameId && eligibleForCombo) {
    return {
      kind: 'triple',
      labelKey: 'games.table.hud.combo.playTriple',
      cardId: selected[0].id,
      selected,
    };
  }
  if (selected.length === FIVER_COMBO_SIZE && allDifferentIds(selected)) {
    return {
      kind: 'five',
      labelKey: 'games.table.hud.combo.playFiver',
      selected,
    };
  }

  return {
    kind: 'invalid',
    labelKey: 'games.table.hud.combo.invalid',
    selected,
  };
}

/**
 * Cast the selected card instances to the combo-card subtype expected by
 * `onOpenEventCombo`. Caller MUST validate kind is `pair` or `triple`
 * first — types don't enforce that.
 */
export function asComboCards(
  selected: HandCardInstance[],
): CriticalComboCard[] {
  return selected.map((s) => s.id as CriticalComboCard);
}

/**
 * Action cards that consume an armed target player when played as a
 * single. Mirrors `useGameHandlers.handlePlayActionCard` — cards that
 * route to a target-selection modal in the legacy flow. In widget mode,
 * the target is armed up-front by clicking an opponent tile and these
 * cards play directly with `{ targetPlayerId }` instead of opening a
 * modal.
 */
export const TARGETED_SINGLE_CARDS: ReadonlySet<CriticalCard> =
  new Set<CriticalCard>(['targeted_strike', 'mark', 'steal_draw', 'smite']);

export function isTargetedSingle(id: CriticalCard): boolean {
  return TARGETED_SINGLE_CARDS.has(id);
}
