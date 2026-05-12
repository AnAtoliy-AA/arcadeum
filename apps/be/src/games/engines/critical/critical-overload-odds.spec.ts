import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEngine } from './critical.engine';
import { CriticalCard } from '../../critical/critical.state';

// ARC-638: server-authoritative overload odds, computed in sanitize from
// the full (un-redacted) deck so the web ThreatStrip can drop its
// "min odds (visible cards only)" approximation.
describe('CriticalEngine: overloadOdds in sanitizeStateForPlayer', () => {
  let engine: CriticalEngine;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CriticalEngine],
    }).compile();

    engine = module.get<CriticalEngine>(CriticalEngine);
  });

  afterAll(async () => {
    await module.close();
  });

  it('reports the exact percentage of critical_event cards in the deck', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.deck = [
      'critical_event',
      'strike',
      'evade',
      'trade',
    ] as CriticalCard[];

    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
    expect(sanitized.overloadOdds).toBe(25);
  });

  it('returns null when the deck is empty', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.deck = [];

    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
    expect(sanitized.overloadOdds).toBeNull();
  });

  it('excludes critical_implosion until it is face-up', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.deck = [
      'critical_event',
      'critical_implosion',
      'strike',
      'evade',
    ] as CriticalCard[];
    state.implosionState = { isFaceUp: false };

    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
    // Only critical_event counts → 1 / 4 = 25%.
    expect(sanitized.overloadOdds).toBe(25);
  });

  it('includes face-up critical_implosion as a critical', () => {
    const state = engine.initializeState(['p1', 'p2']);
    state.deck = [
      'critical_event',
      'critical_implosion',
      'strike',
      'evade',
    ] as CriticalCard[];
    state.implosionState = { isFaceUp: true };

    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
    // Both criticals count → 2 / 4 = 50%.
    expect(sanitized.overloadOdds).toBe(50);
  });

  it('is computed from the un-redacted deck, not the sanitized one', () => {
    const state = engine.initializeState(['p1', 'p2']);
    // 2 criticals + 2 safe = 50%. Without server help the client only
    // sees `hidden` placeholders and can't reach this number.
    state.deck = [
      'critical_event',
      'critical_event',
      'strike',
      'evade',
    ] as CriticalCard[];

    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
    expect(sanitized.overloadOdds).toBe(50);
    // The deck the client sees is fully redacted, confirming the
    // percentage couldn't have been computed client-side.
    const visible = (sanitized.deck ?? []).filter(
      (c) => (c as string) !== 'hidden',
    );
    expect(visible.length).toBe(0);
  });
});
