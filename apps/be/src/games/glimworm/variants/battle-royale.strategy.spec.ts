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
});
