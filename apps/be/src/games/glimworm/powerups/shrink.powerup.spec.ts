import { shrinkPowerup } from './shrink.powerup';
import { getPowerup } from './powerup.def';
import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_POWERUP_DURATION_MS,
} from '../glimworm.constants';
import type { GlimwormSession, Vec2, Worm } from '../glimworm.types';

const makeSegments = (n: number): Vec2[] =>
  Array.from({ length: n }, (_, i) => ({ x: i * 10, y: 0 }));

const makeWorm = (overrides: Partial<Worm> = {}): Worm => ({
  id: 'a',
  color: '#fff',
  segments: makeSegments(8),
  heading: 0,
  speed: GLIMWORM_BASE_SPEED,
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
  variant: 'time_attack',
  powerupsEnabled: true,
  status: 'playing',
  startedAt: 0,
  endsAt: null,
  arena: { width: 2000, height: 2000 },
  worms: Object.fromEntries(worms.map((w) => [w.id, w])),
  food: [],
  powerups: [],
  winner: null,
  tickNum: 42,
  lastInputAt: {},
  lastPowerupSpawnAt: 0,
  damageTickAt: {},
});

describe('shrinkPowerup', () => {
  it('registers in the global POWERUP_REGISTRY under "shrink" with instant duration', () => {
    expect(getPowerup('shrink')).toBe(shrinkPowerup);
    expect(shrinkPowerup.kind).toBe('shrink');
    expect(shrinkPowerup.durationMs).toBe(GLIMWORM_POWERUP_DURATION_MS.shrink);
    expect(shrinkPowerup.durationMs).toBe(0);
  });

  it('apply on length-8 worm drops 2 tail segments and pushes 2 food items', () => {
    const worm = makeWorm({ segments: makeSegments(8) });
    const s = makeSession([worm]);
    const tailBefore = worm.segments.slice(6);
    shrinkPowerup.apply(worm, s, 0);
    expect(worm.segments).toHaveLength(6);
    expect(s.food).toHaveLength(2);
    expect(s.food[0].pos).toEqual(tailBefore[0]);
    expect(s.food[1].pos).toEqual(tailBefore[1]);
    expect(s.food[0].value).toBe(1);
  });

  it('apply on length-5 worm is a no-op (min length floor)', () => {
    const worm = makeWorm({ segments: makeSegments(5) });
    const s = makeSession([worm]);
    shrinkPowerup.apply(worm, s, 0);
    expect(worm.segments).toHaveLength(5);
    expect(s.food).toHaveLength(0);
  });

  it('apply on length-6 worm drops 1 segment, leaving 5 (floor enforced)', () => {
    const worm = makeWorm({ segments: makeSegments(6) });
    const s = makeSession([worm]);
    shrinkPowerup.apply(worm, s, 0);
    expect(worm.segments).toHaveLength(5);
    expect(s.food).toHaveLength(1);
  });

  it('apply on length-10 worm drops 3 segments, leaving 7', () => {
    const worm = makeWorm({ segments: makeSegments(10) });
    const s = makeSession([worm]);
    shrinkPowerup.apply(worm, s, 0);
    expect(worm.segments).toHaveLength(7);
    expect(s.food).toHaveLength(3);
  });

  it('expire is not defined (instant power-up)', () => {
    expect(typeof shrinkPowerup.expire).toBe('undefined');
  });
});
