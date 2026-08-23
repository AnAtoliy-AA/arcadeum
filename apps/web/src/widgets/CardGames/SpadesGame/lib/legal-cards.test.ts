import { describe, expect, it } from 'vitest';
import type { SpadesClientState } from '../types';
import { completedTrickCount, legalCardIds } from './legal-cards';

function makeSnapshot(
  overrides: Partial<SpadesClientState> = {},
): SpadesClientState {
  return {
    phase: 'playing',
    options: { targetScore: 500, nilEnabled: true },
    handNumber: 0,
    players: [{ playerId: 'p1' }, { playerId: 'p2' }],
    playerOrder: ['p1', 'p2'],
    currentTurnIndex: 0,
    hands: { p1: [], p2: [] },
    taken: { p1: [], p2: [] },
    bids: { p1: null, p2: null },
    scores: { p1: 0, p2: 0 },
    bags: { p1: 0, p2: 0 },
    currentTrick: { plays: [], leadSuit: null },
    spadesBroken: false,
    lastHandSummary: null,
    winnerIds: null,
    isDraw: false,
    logs: [],
    ...overrides,
  };
}

describe('completedTrickCount', () => {
  it('counts completed tricks from taken piles', () => {
    const snapshot = makeSnapshot({
      taken: {
        p1: ['2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C'],
        p2: [],
      },
    });
    expect(completedTrickCount(snapshot)).toBe(2);
  });

  it('returns 0 for a fresh hand', () => {
    expect(completedTrickCount(makeSnapshot())).toBe(0);
  });
});

describe('legalCardIds', () => {
  it('cannot lead spades until broken', () => {
    const snapshot = makeSnapshot();
    expect(legalCardIds(snapshot, ['AS', 'AC', 'KH'])).toEqual(['AC', 'KH']);
  });

  it('spades may lead once broken', () => {
    const snapshot = makeSnapshot({ spadesBroken: true });
    expect(legalCardIds(snapshot, ['AS', 'AC'])).toEqual(['AS', 'AC']);
  });

  it('all-spade hands may still lead', () => {
    const snapshot = makeSnapshot();
    expect(legalCardIds(snapshot, ['AS', 'KS'])).toEqual(['AS', 'KS']);
  });

  it('must follow the led suit when able', () => {
    const snapshot = makeSnapshot({
      currentTrick: {
        plays: [{ playerId: 'p2', card: '9D' }],
        leadSuit: 'D',
      },
    });
    expect(legalCardIds(snapshot, ['AD', '5C', '6H'])).toEqual(['AD']);
  });

  it('may play anything (including trump) when void in the led suit', () => {
    const snapshot = makeSnapshot({
      currentTrick: {
        plays: [{ playerId: 'p2', card: '9D' }],
        leadSuit: 'D',
      },
    });
    expect(legalCardIds(snapshot, ['AC', 'KS'])).toEqual(['AC', 'KS']);
  });

  it('returns no cards outside the playing phase', () => {
    const snapshot = makeSnapshot({ phase: 'bidding' });
    expect(legalCardIds(snapshot, ['AC', 'KH'])).toEqual([]);
  });
});
