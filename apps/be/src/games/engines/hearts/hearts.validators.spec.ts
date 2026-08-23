import { GAME_PHASE } from './hearts.constants';
import type { HeartsState } from './hearts.types';
import {
  validateForfeit,
  validatePassCards,
  validatePlayCard,
} from './hearts.validators';

const PLAYERS = ['a', 'b', 'c', 'd'];

function makeState(overrides?: Partial<HeartsState>): HeartsState {
  return {
    phase: GAME_PHASE.PLAYING,
    options: { passingEnabled: true, targetScore: 100 },
    handNumber: 0,
    passDirection: 'left',
    hands: {
      a: ['2C', '3C', '5H', 'QS'],
      b: ['4C', '6C', '9H'],
      c: ['7C', '8C', 'JH'],
      d: ['9C', '10C', 'KH'],
    },
    taken: { a: [], b: [], c: [], d: [] },
    pendingPasses: { a: [], b: [], c: [], d: [] },
    scores: { a: 0, b: 0, c: 0, d: 0 },
    handScores: { a: 0, b: 0, c: 0, d: 0 },
    currentTrick: { plays: [], leadSuit: null },
    currentTurnIndex: 0,
    playerOrder: PLAYERS,
    players: PLAYERS.map((playerId) => ({ playerId })),
    heartsBroken: false,
    winnerIds: null,
    winType: null,
    isDraw: false,
    logs: [],
    ...overrides,
  };
}

describe('validatePassCards', () => {
  it('accepts exactly 3 owned cards during the passing phase', () => {
    const state = makeState({ phase: GAME_PHASE.PASSING });
    expect(
      validatePassCards(state, 'a', { cards: ['2C', '3C', 'QS'] }).ok,
    ).toBe(true);
  });

  it('rejects wrong count', () => {
    const state = makeState({ phase: GAME_PHASE.PASSING });
    const result = validatePassCards(state, 'a', { cards: ['2C', '3C'] });
    expect(result.ok).toBe(false);
  });

  it('rejects cards not owned', () => {
    const state = makeState({ phase: GAME_PHASE.PASSING });
    const result = validatePassCards(state, 'a', {
      cards: ['2C', '3C', '9H'],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('not in your hand');
  });

  it('rejects duplicate cards', () => {
    const state = makeState({ phase: GAME_PHASE.PASSING });
    expect(
      validatePassCards(state, 'a', { cards: ['2C', '2C', '3C'] }).ok,
    ).toBe(false);
  });

  it('rejects during the playing phase', () => {
    expect(validatePassCards(makeState(), 'a', { cards: [] }).ok).toBe(false);
  });
});

describe('validatePlayCard', () => {
  it('requires the 2♣ lead on the first trick', () => {
    const result = validatePlayCard(makeState(), 'a', { card: '3C' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('2♣');
  });

  it('rejects cards not in hand', () => {
    expect(validatePlayCard(makeState(), 'a', { card: 'AC' }).ok).toBe(false);
  });

  it('rejects plays out of turn', () => {
    expect(validatePlayCard(makeState(), 'b', { card: '2C' }).ok).toBe(false);
  });

  it('enforces follow suit', () => {
    const state = makeState();
    // First trick: a leads 2C, b follows 4C, c follows 7C.
    const s1 = structuredClone(state);
    s1.hands.a = s1.hands.a.filter((c) => c !== '2C');
    s1.currentTrick.plays.push({ playerId: 'a', card: '2C' });
    s1.currentTrick.leadSuit = 'C';
    s1.currentTurnIndex = 1;
    expect(validatePlayCard(s1, 'b', { card: '6C' }).ok).toBe(true);
    // b holds a club — discarding a heart must fail
    expect(validatePlayCard(s1, 'b', { card: '9H' }).ok).toBe(false);
  });

  it('forbids penalty discards on the first trick when void', () => {
    const state = makeState();
    state.hands.b = ['9H', 'JD']; // b is void in clubs holding a heart
    state.hands.a = [];
    state.currentTrick.plays.push({ playerId: 'a', card: '2C' });
    state.currentTrick.leadSuit = 'C';
    state.currentTurnIndex = 1;
    const result = validatePlayCard(state, 'b', { card: '9H' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('first trick');
  });

  it('allows a heart discard on the first trick only when the whole hand is penalties', () => {
    const state = makeState();
    state.hands.b = ['9H'];
    state.hands.a = [];
    state.currentTrick.plays.push({ playerId: 'a', card: '2C' });
    state.currentTrick.leadSuit = 'C';
    state.currentTurnIndex = 1;
    expect(validatePlayCard(state, 'b', { card: '9H' }).ok).toBe(true);
  });

  it('blocks leading hearts before they are broken', () => {
    const state = makeState({
      handNumber: 0,
      currentTrick: {
        plays: [
          { playerId: 'a', card: '2C' },
          { playerId: 'b', card: '4C' },
          { playerId: 'c', card: '7C' },
          { playerId: 'd', card: '9C' },
        ],
        leadSuit: null,
      },
    });
    // Trick completes inside the engine; emulate post-trick lead here:
    const s2 = structuredClone(state);
    s2.hands = {
      a: ['5H', '3C'],
      b: ['6C'],
      c: ['8C'],
      d: ['10C'],
    };
    s2.currentTrick = { plays: [], leadSuit: null };
    s2.currentTurnIndex = 0;
    // First trick already completed and taken by 'a'.
    s2.taken = { a: ['2C', '4C', '7C', '9C'], b: [], c: [], d: [] };
    const result = validatePlayCard(s2, 'a', { card: '5H' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('broken');
  });

  it('allows leading hearts once broken', () => {
    const state = makeState();
    state.heartsBroken = true;
    state.handNumber = 0;
    state.hands = { a: ['5H'], b: ['6C'], c: ['8C'], d: ['10C'] };
    state.taken = { a: ['2C', '4C', '7C', '9C'], b: [], c: [], d: [] };
    state.currentTrick = { plays: [], leadSuit: null };
    expect(validatePlayCard(state, 'a', { card: '5H' }).ok).toBe(true);
  });

  it('allows Q♠ to lead once legal (not first trick)', () => {
    const state = makeState();
    state.hands = { a: ['QS'], b: ['6C'], c: ['8C'], d: ['10C'] };
    state.taken = { a: ['2C', '4C', '7C', '9C'], b: [], c: [], d: [] };
    state.currentTrick = { plays: [], leadSuit: null };
    expect(validatePlayCard(state, 'a', { card: 'QS' }).ok).toBe(true);
  });
});

describe('validateForfeit', () => {
  it('rejects after game over', () => {
    const state = makeState({ phase: GAME_PHASE.GAME_OVER });
    expect(validateForfeit(state, 'a').ok).toBe(false);
  });

  it('accepts active players', () => {
    expect(validateForfeit(makeState(), 'a').ok).toBe(true);
  });
});
