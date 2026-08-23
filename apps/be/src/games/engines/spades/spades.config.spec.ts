import { SpadesEngine } from './spades.engine';

const PLAYERS = ['p0', 'p1', 'p2', 'p3'];

/**
 * Deterministic shuffler: deinterleaves the suit-major deck so each player
 * gets a mix of suits ([C2,D2,S2,H2, C3,D3,S3,H3, ...]).
 */
function interleavedShuffler<T>(cards: T[]): T[] {
  const suits = 4;
  const ranksPerSuit = cards.length / suits;
  const result: T[] = [];
  for (let r = 0; r < ranksPerSuit; r++) {
    for (let s = 0; s < suits; s++) {
      result.push(cards[s * ranksPerSuit + r]);
    }
  }
  return result;
}

describe('SpadesEngine config', () => {
  it('accepts valid option payloads', () => {
    const engine = new SpadesEngine(interleavedShuffler);
    expect(engine.validateConfig({})).toBe(true);
    expect(engine.validateConfig({ targetScore: 300 })).toBe(true);
    expect(engine.validateConfig({ nilEnabled: false })).toBe(true);
    expect(
      engine.validateConfig(undefined as unknown as Record<string, unknown>),
    ).toBe(true);
  });

  it('rejects invalid option payloads', () => {
    const engine = new SpadesEngine(interleavedShuffler);
    expect(engine.validateConfig({ targetScore: 250 })).toBe(false);
    expect(engine.validateConfig({ nilEnabled: 'yes' })).toBe(false);
    expect(
      engine.validateConfig('bogus' as unknown as Record<string, never>),
    ).toBe(false);
  });
});

describe('SpadesEngine team parity', () => {
  it('partners sit two seats apart in the player order', () => {
    // p0/p2 vs p1/p3 — verified through forfeit semantics on the engine.
    const engine = new SpadesEngine(interleavedShuffler);
    const state = engine.initializeState(PLAYERS);
    const result = engine.executeAction(state, 'forfeit', {
      userId: 'p1',
      roomId: 'r',
      sessionId: 's',
      timestamp: new Date(),
    });
    expect(result.state?.winnerIds).toEqual(['p0', 'p2']);
  });
});
