import { describe, expect, it } from 'vitest';
import {
  applyMove,
  cardColor,
  deal,
  draw,
  evaluateOutcome,
  getSourceCards,
  hasAvailableMoves,
  isWon,
  isValidMove,
  shuffle,
} from './engine';
import { SUITS, type SolitaireState } from '../types';

/** Deterministic RNG for reproducible deals. */
function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function card(state: SolitaireState, suit: string, rank: number) {
  const found = [...state.stock, ...state.waste, ...state.foundations.flat(), ...state.tableau.flat()]
    .find((c) => c.suit === suit && c.rank === rank);
  if (!found) throw new Error(`card ${suit}-${rank} not found`);
  return found;
}

describe('shuffle', () => {
  it('is deterministic with a seeded rng', () => {
    const a = shuffle([1, 2, 3, 4, 5], seededRng(42));
    const b = shuffle([1, 2, 3, 4, 5], seededRng(42));
    expect(a).toEqual(b);
  });

  it('keeps every element', () => {
    const result = shuffle([1, 2, 3, 4, 5], seededRng(7));
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('deal', () => {
  it('produces a full 52-card layout', () => {
    const state = deal(seededRng(1));
    const total =
      state.stock.length +
      state.waste.length +
      state.foundations.flat().length +
      state.tableau.flat().length;
    expect(total).toBe(52);
    expect(state.tableau).toHaveLength(7);
    expect(state.stock).toHaveLength(24);
  });

  it('sizes tableau piles 1..7 with only the top card face up', () => {
    const state = deal(seededRng(2));
    state.tableau.forEach((pile, index) => {
      expect(pile).toHaveLength(index + 1);
      expect(pile[pile.length - 1].faceUp).toBe(true);
      pile.slice(0, -1).forEach((c) => expect(c.faceUp).toBe(false));
    });
  });

  it('has no duplicate cards', () => {
    const state = deal(seededRng(3));
    const ids = [...state.stock, ...state.tableau.flat()].map((c) => c.id);
    expect(new Set(ids).size).toBe(52);
  });
});

describe('cardColor', () => {
  it('maps suits correctly', () => {
    expect(cardColor({ id: 'x', suit: 'hearts', rank: 5, faceUp: true })).toBe('red');
    expect(cardColor({ id: 'x', suit: 'diamonds', rank: 5, faceUp: true })).toBe('red');
    expect(cardColor({ id: 'x', suit: 'spades', rank: 5, faceUp: true })).toBe('black');
    expect(cardColor({ id: 'x', suit: 'clubs', rank: 5, faceUp: true })).toBe('black');
  });
});

describe('isValidMove / applyMove — tableau', () => {
  it('accepts descending alternating-color stacks', () => {
    const state = deal(seededRng(4));
    // Force a known configuration: red 6 on top of black 7.
    const six = card(state, 'hearts', 6);
    const seven = card(state, 'spades', 7);
    state.waste = [six];
    state.tableau[0] = [{ ...seven, faceUp: true }];

    const source = { kind: 'waste' as const };
    const target = { kind: 'tableau' as const, pileIndex: 0 };
    expect(isValidMove(state, source, target)).toBe(true);

    const next = applyMove(state, source, target);
    expect(next.tableau[0][next.tableau[0].length - 1]).toMatchObject({
      suit: 'hearts',
      rank: 6,
    });
    expect(next.moves).toBe(state.moves + 1);
    expect(next.score).toBe(5); // waste → tableau
  });

  it('rejects same-color or non-descending drops', () => {
    const state = deal(seededRng(5));
    const sevenHearts = card(state, 'hearts', 7);
    const sixDiamonds = card(state, 'diamonds', 6);
    state.tableau[0] = [{ ...sevenHearts, faceUp: true }];
    state.waste = [sixDiamonds];

    expect(
      isValidMove(
        state,
        { kind: 'waste' },
        { kind: 'tableau', pileIndex: 0 },
      ),
    ).toBe(false);
  });

  it('only allows kings on an empty pile', () => {
    const state = deal(seededRng(6));
    const king = card(state, 'clubs', 13);
    const queen = card(state, 'clubs', 12);
    state.tableau[0] = [];
    state.waste = [queen];

    expect(
      isValidMove(state, { kind: 'waste' }, { kind: 'tableau', pileIndex: 0 }),
    ).toBe(false);

    state.waste = [king];
    expect(
      isValidMove(state, { kind: 'waste' }, { kind: 'tableau', pileIndex: 0 }),
    ).toBe(true);
  });

  it('moves a full face-up run within one action', () => {
    const state = deal(seededRng(8));
    const run = [
      { id: 'a', suit: 'spades' as const, rank: 9, faceUp: true },
      { id: 'b', suit: 'hearts' as const, rank: 8, faceUp: true },
      { id: 'c', suit: 'clubs' as const, rank: 7, faceUp: true },
    ];
    state.tableau[0] = run;
    state.tableau[1] = [{ id: 'd', suit: 'hearts', rank: 10, faceUp: true }];

    const cards = getSourceCards(state, {
      kind: 'tableau',
      pileIndex: 0,
      cardIndex: 0,
    });
    expect(cards).toHaveLength(3);

    const next = applyMove(state, { kind: 'tableau', pileIndex: 0, cardIndex: 0 }, {
      kind: 'tableau',
      pileIndex: 1,
    });
    expect(next.tableau[0]).toHaveLength(0);
    expect(next.tableau[1]).toHaveLength(4);
  });

  it('refuses to grab through a face-down card', () => {
    const state = deal(seededRng(9));
    state.tableau[0] = [
      { id: 'down', suit: 'diamonds', rank: 10, faceUp: false },
      { id: 'up', suit: 'clubs', rank: 4, faceUp: true },
    ];
    expect(
      getSourceCards(state, { kind: 'tableau', pileIndex: 0, cardIndex: 0 }),
    ).toEqual([]);
  });
});

describe('foundations', () => {
  it('accepts aces then ascending same-suit cards', () => {
    const state = deal(seededRng(10));
    const ace = card(state, 'diamonds', 1);
    const two = card(state, 'diamonds', 2);
    state.waste = [ace];

    const target = { kind: 'foundation' as const, foundationIndex: SUITS.indexOf('diamonds') };

    expect(isValidMove(state, { kind: 'waste' }, target)).toBe(true);
    const afterAce = applyMove(state, { kind: 'waste' }, target);
    expect(afterAce.score).toBe(10);
    expect(afterAce.waste).toHaveLength(0);

    afterAce.waste = [two];
    expect(isValidMove(afterAce, { kind: 'waste' }, target)).toBe(true);
  });

  it('rejects wrong suit or skipped ranks', () => {
    const state = deal(seededRng(11));
    const heartsThree = card(state, 'hearts', 3);
    const diamondsTwo = card(state, 'diamonds', 2);
    state.foundations[SUITS.indexOf('hearts')] = [
      { id: 'h1', suit: 'hearts', rank: 1, faceUp: true },
      { id: 'h2', suit: 'hearts', rank: 2, faceUp: true },
    ];
    state.waste = [diamondsTwo];

    // Wrong suit.
    expect(
      isValidMove(
        state,
        { kind: 'waste' },
        { kind: 'foundation', foundationIndex: SUITS.indexOf('hearts') },
      ),
    ).toBe(false);

    // Skipped rank into its own suit.
    state.waste = [heartsThree];
    state.foundations[SUITS.indexOf('hearts')] = [
      { id: 'h1', suit: 'hearts', rank: 1, faceUp: true },
    ];
    expect(
      isValidMove(
        state,
        { kind: 'waste' },
        { kind: 'foundation', foundationIndex: SUITS.indexOf('hearts') },
      ),
    ).toBe(false);
  });
});

describe('draw & recycle', () => {
  it('moves the top stock card to the waste face up', () => {
    const state = deal(seededRng(12));
    const stockTop = state.stock[state.stock.length - 1];
    const next = draw(state);
    expect(next.stock).toHaveLength(state.stock.length - 1);
    expect(next.waste[next.waste.length - 1].id).toBe(stockTop.id);
    expect(next.waste[next.waste.length - 1].faceUp).toBe(true);
  });

  it('recycles the waste when the stock is empty', () => {
    const state = deal(seededRng(13));
    state.stock = [];
    state.waste = [
      { id: 'w1', suit: 'clubs', rank: 2, faceUp: true },
      { id: 'w2', suit: 'clubs', rank: 3, faceUp: true },
    ];
    const next = draw(state);
    expect(next.stock).toHaveLength(2);
    expect(next.waste).toHaveLength(0);
    expect(next.stock.every((c) => !c.faceUp)).toBe(true);
  });

  it('is a no-op when both stock and waste are empty', () => {
    const state = deal(seededRng(14));
    state.stock = [];
    state.waste = [];
    expect(draw(state)).toBe(state);
  });
});

describe('flip bonus', () => {
  it('flips the newly exposed tableau card and awards points', () => {
    const state = deal(seededRng(15));
    state.tableau[0] = [
      { id: 'hidden', suit: 'spades', rank: 5, faceUp: false },
      { id: 'shown', suit: 'hearts', rank: 6, faceUp: true },
    ];
    state.tableau[1] = [{ id: 'seven', suit: 'spades', rank: 7, faceUp: true }];

    const next = applyMove(
      state,
      { kind: 'tableau', pileIndex: 0, cardIndex: 1 },
      { kind: 'tableau', pileIndex: 1 },
    );
    expect(next.tableau[0]).toHaveLength(1);
    expect(next.tableau[0][0].faceUp).toBe(true);
    expect(next.score).toBe(5); // +5 flip, tableau→tableau move itself is free
  });
});

describe('win & stuck detection', () => {
  it('detects a won game', () => {
    const state = deal(seededRng(16));
    state.foundations = SUITS.map((suit) =>
      Array.from({ length: 13 }, (_, index) => ({
        id: `${suit}-${index + 1}`,
        suit,
        rank: index + 1,
        faceUp: true,
      })),
    );
    expect(isWon(state)).toBe(true);
    expect(evaluateOutcome(state)).toEqual({ won: true, stuck: false });
  });

  it('detects a stuck game with no moves left', () => {
    const state = deal(seededRng(17));
    state.stock = [];
    state.waste = [];
    state.foundations = SUITS.map(() => []);
    // A lone black queen with no king available for the empty columns and
    // nothing playable on the foundations.
    state.tableau = [
      [{ id: 'sq', suit: 'spades', rank: 12, faceUp: true }],
      [],
      [],
      [],
      [],
      [],
      [],
    ];
    expect(hasAvailableMoves(state)).toBe(false);
    expect(evaluateOutcome(state)).toEqual({ won: false, stuck: true });
  });

  it('keeps detecting tableau reshuffles as available moves', () => {
    const state = deal(seededRng(19));
    state.stock = [];
    state.waste = [];
    state.foundations = SUITS.map(() => []);
    state.tableau = [
      [{ id: 'h9', suit: 'hearts', rank: 9, faceUp: true }],
      [{ id: 's10', suit: 'spades', rank: 10, faceUp: true }],
      [],
      [],
      [],
      [],
      [],
    ];
    expect(hasAvailableMoves(state)).toBe(true);
  });

  it('treats a drawable stock as an available move', () => {
    const state = deal(seededRng(18));
    expect(hasAvailableMoves(state)).toBe(true);
  });
});
