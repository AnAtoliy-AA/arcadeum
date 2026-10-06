import { describe, expect, it } from 'vitest';
import {
  applyMove,
  deal,
  draw,
  isAllCardsOpen,
  isWon,
  nextAutoPlaceAction,
} from './engine';
import { SUITS, type Card, type SolitaireState, type Suit } from '../types';

/** Deterministic RNG for reproducible deals. */
function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function altRun(first: Suit, second: Suit): Card[] {
  return Array.from({ length: 13 }, (_, index) => {
    const suit = index % 2 === 0 ? first : second;
    const rank = 13 - index;
    return { id: `${suit}-${rank}`, suit, rank, faceUp: true };
  });
}

function allOpenState(): SolitaireState {
  return {
    stock: [],
    waste: [],
    foundations: SUITS.map(() => []),
    tableau: [
      altRun('spades', 'hearts'),
      altRun('hearts', 'spades'),
      altRun('diamonds', 'clubs'),
      altRun('clubs', 'diamonds'),
      [],
      [],
      [],
    ],
    moves: 0,
    score: 0,
  };
}

function takeCard(state: SolitaireState, suit: Suit, rank: number): Card {
  for (const pile of state.tableau) {
    const index = pile.findIndex((c) => c.suit === suit && c.rank === rank);
    if (index >= 0) return pile.splice(index, 1)[0];
  }
  throw new Error(`card ${suit}-${rank} not in tableau`);
}

function runAutoPlace(state: SolitaireState): SolitaireState {
  let current = state;
  for (let step = 0; step < 3000; step += 1) {
    const action = nextAutoPlaceAction(current);
    if (!action) return current;
    current =
      action.kind === 'draw'
        ? draw(current)
        : applyMove(current, action.source, action.target);
  }
  throw new Error('auto-place did not terminate');
}

describe('isAllCardsOpen', () => {
  it('is false for a fresh deal with a face-down stock', () => {
    expect(isAllCardsOpen(deal(seededRng(20)))).toBe(false);
  });

  it('is true when the stock is empty and every tableau card is face up', () => {
    expect(isAllCardsOpen(allOpenState())).toBe(true);
  });

  it('is false when the stock is empty but a tableau card is face down', () => {
    const state = allOpenState();
    state.tableau[0][0] = { ...state.tableau[0][0], faceUp: false };
    expect(isAllCardsOpen(state)).toBe(false);
  });

  it('is false while any card remains in the stock', () => {
    const state = allOpenState();
    state.stock = [
      { id: 'spades-13', suit: 'spades', rank: 13, faceUp: false },
    ];
    expect(isAllCardsOpen(state)).toBe(false);
  });
});

describe('nextAutoPlaceAction', () => {
  it('moves an exposed ace to its foundation', () => {
    const state = allOpenState();
    const action = nextAutoPlaceAction(state);
    expect(action).not.toBeNull();
    expect(action?.kind).toBe('move');
    if (action?.kind !== 'move') throw new Error('expected a move');
    expect(action.target).toEqual({ kind: 'foundation', foundationIndex: 0 });
    expect(action.source).toEqual({
      kind: 'tableau',
      pileIndex: 0,
      cardIndex: 12,
    });
  });

  it('draws when no foundation move exists but the waste can be recycled', () => {
    const state = allOpenState();
    const aceSpades = takeCard(state, 'spades', 1);
    const aceHearts = takeCard(state, 'hearts', 1);
    const aceDiamonds = takeCard(state, 'diamonds', 1);
    const aceClubs = takeCard(state, 'clubs', 1);
    const jackSpades = takeCard(state, 'spades', 11);
    state.waste = [aceSpades, aceHearts, aceDiamonds, aceClubs, jackSpades];

    const action = nextAutoPlaceAction(state);
    expect(action).toEqual({ kind: 'draw' });
  });

  it('returns null on a won game', () => {
    const state = allOpenState();
    state.foundations = SUITS.map((suit) =>
      Array.from({ length: 13 }, (_, index) => ({
        id: `${suit}-${index + 1}`,
        suit,
        rank: index + 1,
        faceUp: true,
      })),
    );
    state.tableau = [[], [], [], [], [], [], []];
    expect(nextAutoPlaceAction(state)).toBeNull();
  });

  it('returns null when nothing can progress', () => {
    const state = allOpenState();
    state.tableau = [
      [{ id: 'sq', suit: 'spades', rank: 12, faceUp: true }],
      [],
      [],
      [],
      [],
      [],
      [],
    ];
    expect(nextAutoPlaceAction(state)).toBeNull();
  });

  it('wins a fully open layout', () => {
    const finished = runAutoPlace(allOpenState());
    expect(isWon(finished)).toBe(true);
    expect(finished.foundations.flat()).toHaveLength(52);
    expect(finished.score).toBe(520);
  });

  it('wins a fully open layout with aces buried in the waste', () => {
    const state = allOpenState();
    state.waste = [
      takeCard(state, 'spades', 1),
      takeCard(state, 'hearts', 1),
      takeCard(state, 'diamonds', 1),
      takeCard(state, 'clubs', 1),
      takeCard(state, 'spades', 11),
    ];
    const finished = runAutoPlace(state);
    expect(isWon(finished)).toBe(true);
    expect(finished.stock).toHaveLength(0);
    expect(finished.waste).toHaveLength(0);
  });
});
