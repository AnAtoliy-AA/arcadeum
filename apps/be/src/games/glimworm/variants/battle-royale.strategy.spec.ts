import { BattleRoyaleStrategy } from './battle-royale.strategy';
import type { GlimwormSession, Worm } from '../glimworm.types';

const makeWorm = (id: string, overrides: Partial<Worm> = {}): Worm => ({
  id,
  color: '#fff',
  segments: [
    { x: 100, y: 100 },
    { x: 90, y: 100 },
  ],
  heading: 0,
  speed: 200,
  alive: true,
  livesLeft: 1,
  score: 0,
  ready: true,
  activePowerup: null,
  inventoryPowerup: null,
  ...overrides,
});

const makeSession = (worms: Worm[]): GlimwormSession => ({
  roomId: 'r1',
  hostUserId: 'u1',
  variant: 'battle_royale',
  powerupsEnabled: false,
  status: 'playing',
  startedAt: 0,
  endsAt: null,
  arena: { width: 2000, height: 2000 },
  worms: Object.fromEntries(worms.map((w) => [w.id, w])),
  food: [],
  powerups: [],
  winner: null,
  tickNum: 0,
  lastInputAt: {},
  lastPowerupSpawnAt: 0,
  damageTickAt: {},
});

describe('BattleRoyaleStrategy', () => {
  it('initSession sets livesLeft=1 and creates safe zone', () => {
    const s = makeSession([makeWorm('a'), makeWorm('b')]);
    new BattleRoyaleStrategy().initSession(s);
    expect(s.worms.a.livesLeft).toBe(1);
    expect(s.worms.b.livesLeft).toBe(1);
    expect(s.arena.safeZone).toBeDefined();
    expect(s.arena.safeZone!.center).toEqual({ x: 1000, y: 1000 });
    expect(s.arena.safeZone!.radius).toBeGreaterThan(0);
  });

  it('onWormDeath marks victim dead, no respawn', () => {
    const s = makeSession([makeWorm('a')]);
    new BattleRoyaleStrategy().onWormDeath(s, s.worms.a, null);
    expect(s.worms.a.alive).toBe(false);
    expect(s.worms.a.livesLeft).toBe(0);
  });

  it('checkEndCondition returns the last alive worm', () => {
    const a = makeWorm('a', { alive: false });
    const b = makeWorm('b', { alive: true });
    const s = makeSession([a, b]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s)).toBe('b');
  });

  it('returns highest-score worm if all dead, null on tie', () => {
    const a = makeWorm('a', { alive: false, score: 5 });
    const b = makeWorm('b', { alive: false, score: 9 });
    const s = makeSession([a, b]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s)).toBe('b');

    const c = makeWorm('c', { alive: false, score: 5 });
    const d = makeWorm('d', { alive: false, score: 5 });
    const s2 = makeSession([c, d]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s2)).toBeNull();
  });

  it('returns null while multiple worms still alive', () => {
    const s = makeSession([makeWorm('a'), makeWorm('b')]);
    expect(new BattleRoyaleStrategy().checkEndCondition(s)).toBeNull();
  });

  it('tickHook shrinks the safe zone radius over time', () => {
    const s = makeSession([makeWorm('a')]);
    const strategy = new BattleRoyaleStrategy();
    strategy.initSession(s);
    const startRadius = s.arena.safeZone!.radius;
    strategy.tickHook(s, 1000);
    expect(s.arena.safeZone!.radius).toBeLessThan(startRadius);
  });

  it('tickHook stops shrinking at the minimum radius (15% of max arena dim)', () => {
    const s = makeSession([makeWorm('a')]);
    const strategy = new BattleRoyaleStrategy();
    strategy.initSession(s);
    // Force the radius below the floor by running many ticks
    for (let i = 0; i < 10_000; i++) strategy.tickHook(s, 1000);
    const minRadius = Math.max(s.arena.width, s.arena.height) * 0.15;
    expect(s.arena.safeZone!.radius).toBeCloseTo(minRadius, 1);
  });

  it('tickHook pops one segment from an outside-zone worm at the damage cadence', () => {
    const outsideHead = { x: 0, y: 0 }; // arena is 2000x2000, so (0,0) is well outside the centred safe zone
    const worm = makeWorm('a', {
      segments: [outsideHead, { x: -10, y: 0 }, { x: -20, y: 0 }],
    });
    const s = makeSession([worm]);
    const strategy = new BattleRoyaleStrategy();
    strategy.initSession(s);
    // Force the safe zone smaller than the head's distance from centre so the head is outside
    s.arena.safeZone!.radius = 100;
    expect(s.worms.a.segments).toHaveLength(3);

    // First tickHook at t=0 establishes damageTickAt; should pop once because last=0 and now=0 isn't >= 500
    // To deterministically pop, advance now beyond the cadence interval
    strategy.tickHook(s, 0);
    // 500ms later: cadence elapsed → one pop
    strategy.tickHook(s, 500);
    expect(s.worms.a.segments.length).toBeLessThan(3);
  });

  it('tickHook clears damageTickAt when a worm re-enters the safe zone', () => {
    const outsideHead = { x: 0, y: 0 };
    const worm = makeWorm('a', { segments: [outsideHead, { x: -10, y: 0 }] });
    const s = makeSession([worm]);
    const strategy = new BattleRoyaleStrategy();
    strategy.initSession(s);
    s.arena.safeZone!.radius = 100;

    // Take damage once to populate damageTickAt
    strategy.tickHook(s, 0);
    strategy.tickHook(s, 500);
    expect(s.damageTickAt['a']).toBeDefined();

    // Re-enter safe zone
    s.worms.a.segments[0] = { x: 1000, y: 1000 }; // arena centre — inside the safe zone
    strategy.tickHook(s, 1000);
    expect(s.damageTickAt['a']).toBeUndefined();
  });

  it('tickHook calls onWormDeath when an outside worm runs out of segments', () => {
    const outsideHead = { x: 0, y: 0 };
    const worm = makeWorm('a', { segments: [outsideHead] }); // only 1 segment — one pop = death
    const s = makeSession([worm]);
    const strategy = new BattleRoyaleStrategy();
    strategy.initSession(s);
    s.arena.safeZone!.radius = 100;

    strategy.tickHook(s, 0);
    strategy.tickHook(s, 500);
    expect(s.worms.a.alive).toBe(false);
    expect(s.worms.a.livesLeft).toBe(0);
  });
});
