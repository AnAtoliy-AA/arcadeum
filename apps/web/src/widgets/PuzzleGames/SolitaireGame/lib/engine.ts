import {
  SUITS,
  type Card,
  type CardColor,
  type GameOutcome,
  type MoveSource,
  type MoveTarget,
  type SolitaireState,
} from '../types';

export const TABLEAU_PILE_COUNT = 7;
export const CARDS_PER_DECK = 52;

const RANK_LABELS: Record<number, string> = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

/** Fisher–Yates shuffle. Deterministic when a seeded RNG is provided. */
export function shuffle<T>(items: T[], rng?: () => number): T[] {
  const result = [...items];
  const random =
    rng ??
    (() =>
      // Native Math.random is the production path; injectable for tests.
      Math.random());
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeck(rng?: () => number): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank += 1) {
      cards.push({ id: `${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  return shuffle(cards, rng);
}

export function deal(rng?: () => number): SolitaireState {
  const deck = createDeck(rng);
  const tableau: Card[][] = [];
  let cursor = 0;
  for (let pile = 0; pile < TABLEAU_PILE_COUNT; pile += 1) {
    const column: Card[] = [];
    for (let cardIndex = 0; cardIndex <= pile; cardIndex += 1) {
      column.push(deck[cursor]);
      cursor += 1;
    }
    column[column.length - 1] = { ...column[column.length - 1], faceUp: true };
    tableau.push(column);
  }
  return {
    stock: deck.slice(cursor).map((card) => ({ ...card, faceUp: false })),
    waste: [],
    foundations: SUITS.map(() => []),
    tableau,
    moves: 0,
    score: 0,
  };
}

export function cardLabel(card: Card): string {
  return RANK_LABELS[card.rank] ?? String(card.rank);
}

export function cardColor(card: Card): CardColor {
  return card.suit === 'hearts' || card.suit === 'diamonds'
    ? 'red'
    : 'black';
}

function topCard(pile: Card[]): Card | undefined {
  return pile[pile.length - 1];
}

function canDropOnTableau(card: Card, pile: Card[]): boolean {
  const target = topCard(pile);
  if (!target) return card.rank === 13;
  return (
    target.faceUp &&
    cardColor(target) !== cardColor(card) &&
    target.rank === card.rank + 1
  );
}

export function foundationSuit(index: number): (typeof SUITS)[number] {
  return SUITS[index] ?? 'spades';
}

function canDropOnFoundation(card: Card, foundationIndex: number, foundations: Card[][]): boolean {
  if (card.suit !== foundationSuit(foundationIndex)) return false;
  const pile = foundations[foundationIndex];
  if (!pile) return false;
  return card.rank === pile.length + 1;
}

/**
 * Cards the player may grab from `source`. For tableau sources this is the
 * descending run starting at `cardIndex`; for waste/foundation it is just the
 * top card.
 */
export function getSourceCards(state: SolitaireState, source: MoveSource): Card[] {
  switch (source.kind) {
    case 'waste': {
      const top = topCard(state.waste);
      return top ? [top] : [];
    }
    case 'foundation': {
      const pile = state.foundations[source.foundationIndex];
      const top = pile ? topCard(pile) : undefined;
      return top ? [top] : [];
    }
    case 'tableau': {
      const pile = state.tableau[source.pileIndex];
      if (!pile || source.cardIndex < 0 || source.cardIndex >= pile.length) {
        return [];
      }
      const run = pile.slice(source.cardIndex);
      return run.every((card) => card.faceUp) ? run : [];
    }
    default:
      return [];
  }
}

export function isValidMove(
  state: SolitaireState,
  source: MoveSource,
  target: MoveTarget,
): boolean {
  const moving = getSourceCards(state, source);
  if (moving.length === 0) return false;
  const lead = moving[0];

  if (target.kind === 'foundation') {
    if (moving.length !== 1) return false;
    if (source.kind === 'foundation') return false;
    return canDropOnFoundation(lead, target.foundationIndex, state.foundations);
  }

  if (source.kind === 'tableau' && source.pileIndex === target.pileIndex) {
    return false;
  }
  return canDropOnTableau(lead, state.tableau[target.pileIndex]);
}

function removeSourceCards(state: SolitaireState, source: MoveSource): {
  next: SolitaireState;
  moved: Card[];
} {
  const next: SolitaireState = {
    ...state,
    stock: [...state.stock],
    waste: [...state.waste],
    foundations: state.foundations.map((pile) => [...pile]),
    tableau: state.tableau.map((pile) => [...pile]),
  };

  let moved: Card[];
  if (source.kind === 'waste') {
    moved = next.waste.splice(next.waste.length - 1, 1);
  } else if (source.kind === 'foundation') {
    const pile = next.foundations[source.foundationIndex];
    moved = pile.splice(pile.length - 1, 1);
  } else {
    const pile = next.tableau[source.pileIndex];
    moved = pile.splice(source.cardIndex);
  }
  return { next, moved };
}

function flipNewlyExposed(state: SolitaireState): number {
  let flips = 0;
  state.tableau = state.tableau.map((pile) => {
    const top = topCard(pile);
    if (top && !top.faceUp) {
      flips += 1;
      return [
        ...pile.slice(0, -1),
        { ...top, faceUp: true },
      ];
    }
    return pile;
  });
  return flips;
}

const SCORE_WASTE_TO_TABLEAU = 5;
const SCORE_TO_FOUNDATION = 10;
const SCORE_TABLEAU_FLIP = 5;
const SCORE_FOUNDATION_TO_TABLEAU = -15;
const MIN_SCORE = 0;

function applyScore(state: SolitaireState, delta: number): void {
  state.score = Math.max(MIN_SCORE, state.score + delta);
}

/**
 * Applies a validated move. Callers must check `isValidMove` first; invalid
 * moves are returned unchanged as a safety net for race-y UI interactions.
 */
export function applyMove(
  state: SolitaireState,
  source: MoveSource,
  target: MoveTarget,
): SolitaireState {
  if (!isValidMove(state, source, target)) return state;
  const { next, moved } = removeSourceCards(state, source);
  // Cards arriving on the layout are always played face up, whatever their
  // previous face-down state in the stock was.
  const played = moved.map((c) => ({ ...c, faceUp: true }));

  if (target.kind === 'foundation') {
    next.foundations[target.foundationIndex].push(...played);
    applyScore(next, SCORE_TO_FOUNDATION);
  } else {
    next.tableau[target.pileIndex].push(...played);
    if (source.kind === 'waste') {
      applyScore(next, SCORE_WASTE_TO_TABLEAU);
    } else if (source.kind === 'foundation') {
      applyScore(next, SCORE_FOUNDATION_TO_TABLEAU);
    }
  }

  const flips = flipNewlyExposed(next);
  if (flips > 0) applyScore(next, flips * SCORE_TABLEAU_FLIP);
  next.moves += 1;
  return next;
}

/** Draws one card from stock to waste; recycles the waste when stock empties. */
export function draw(state: SolitaireState): SolitaireState {
  if (state.stock.length > 0) {
    const next = { ...state, stock: [...state.stock], waste: [...state.waste] };
    const card = next.stock.pop();
    if (card) next.waste.push({ ...card, faceUp: true });
    return next;
  }
  if (state.waste.length === 0) return state;
  const recycled = state.waste
    .slice()
    .reverse()
    .map((card) => ({ ...card, faceUp: false }));
  return {
    ...state,
    stock: recycled,
    waste: [],
    moves: state.moves + 1,
  };
}

export function isWon(state: SolitaireState): boolean {
  return state.foundations.every((pile) => pile.length === 13);
}

/** True when any legal move (including draws/recycle) remains. */
export function hasAvailableMoves(state: SolitaireState): boolean {
  if (state.stock.length > 0 || state.waste.length > 0) return true;

  const tableauTargets = state.tableau.map((_, pileIndex) => ({
    kind: 'tableau' as const,
    pileIndex,
  }));
  const foundationTargets = state.foundations.map((_, foundationIndex) => ({
    kind: 'foundation' as const,
    foundationIndex,
  }));

  for (let p = 0; p < state.tableau.length; p += 1) {
    const pile = state.tableau[p];
    for (let c = 0; c < pile.length; c += 1) {
      if (!pile[c].faceUp) continue;
      const source = { kind: 'tableau' as const, pileIndex: p, cardIndex: c };
      for (const target of foundationTargets) {
        if (isValidMove(state, source, target)) return true;
      }
      for (const target of tableauTargets) {
        if (isValidMove(state, source, target)) return true;
      }
    }
  }
  return false;
}

export function evaluateOutcome(state: SolitaireState): GameOutcome {
  const won = isWon(state);
  return { won, stuck: !won && !hasAvailableMoves(state) };
}
