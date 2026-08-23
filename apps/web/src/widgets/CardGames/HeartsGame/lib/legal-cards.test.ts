import { describe, expect, it } from 'vitest';
import type { HeartsClientState } from '../types';
import { completedTrickCount, legalCardIds } from './legal-cards';

function makeSnapshot(
  overrides: Partial<HeartsClientState> = {},
): HeartsClientState {
  return {
    phase: 'playing',
    options: { passingEnabled: true, targetScore: 100 },
    handNumber: 0,
    passDirection: 'left',
    players: [{ playerId: 'p1' }, { playerId: 'p2' }],
    playerOrder: ['p1', 'p2'],
    currentTurnIndex: 0,
    hands: { p1: [], p2: [] },
    taken: { p1: [], p2: [] },
    pendingPasses: { p1: [], p2: [] },
    scores: { p1: 0, p2: 0 },
    handScores: { p1: 0, p2: 0 },
    currentTrick: { plays: [], leadSuit: null },
    heartsBroken: false,
    winnerIds: null,
    winType: null,
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
  it('first trick leading forces the 2♣ only', () => {
    const snapshot = makeSnapshot();
    expect(legalCardIds(snapshot, ['2C', 'AH', 'QS'])).toEqual(['2C']);
  });

  it('cannot lead hearts until broken', () => {
    const snapshot = makeSnapshot({
      taken: { p1: ['2C', '3C', '4D', '6D'], p2: [] },
    });
    expect(legalCardIds(snapshot, ['AH', '5S'])).toEqual(['5S']);
  });

  it('hearts allowed once broken or hand is all hearts', () => {
    const broken = makeSnapshot({
      taken: { p1: ['2C', '3C', '4D', '3H'], p2: [] },
      heartsBroken: true,
    });
    expect(legalCardIds(broken, ['AH', '5S'])).toEqual(['AH', '5S']);

    const unbroken = makeSnapshot({
      taken: { p1: ['2C', '3C', '4D', '6D'], p2: [] },
    });
    expect(legalCardIds(unbroken, ['AH', 'QH'])).toEqual(['AH', 'QH']);
  });

  it('must follow suit when able', () => {
    const snapshot = makeSnapshot({
      currentTrick: {
        plays: [{ playerId: 'p2', card: '5D' }],
        leadSuit: 'D',
      },
    });
    expect(legalCardIds(snapshot, ['JD', 'AH', '2C'])).toEqual(['JD']);
  });

  it('void in lead suit: no penalty discards on first trick', () => {
    const snapshot = makeSnapshot({
      currentTrick: {
        plays: [{ playerId: 'p2', card: '5D' }],
        leadSuit: 'D',
      },
    });
    expect(legalCardIds(snapshot, ['AH', 'QS', '2C'])).toEqual(['2C']);
  });

  it('void in lead suit after first trick: anything goes', () => {
    const snapshot = makeSnapshot({
      taken: { p1: ['2C', '3C', '4C', '5C'], p2: [] },
      currentTrick: {
        plays: [{ playerId: 'p2', card: '5D' }],
        leadSuit: 'D',
      },
    });
    expect(legalCardIds(snapshot, ['AH', 'QS', '2C'])).toEqual([
      'AH',
      'QS',
      '2C',
    ]);
  });
  it('returns nothing outside the playing phase', () => {
    const snapshot = makeSnapshot({ phase: 'passing' });
    expect(legalCardIds(snapshot, ['2C'])).toEqual([]);
  });
});
