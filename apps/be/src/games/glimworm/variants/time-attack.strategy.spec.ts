import { TimeAttackStrategy } from './time-attack.strategy';
import {
  GLIMWORM_COUNTDOWN_MS,
  GLIMWORM_RESPAWN_DELAY_MS,
  GLIMWORM_TIME_ATTACK_DURATION_MS,
} from '../glimworm.constants';
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

const makeSession = (
  worms: Worm[],
  startedAt = 1_000_000,
): GlimwormSession => ({
  roomId: 'r1',
  hostUserId: 'u1',
  variant: 'time_attack',
  powerupsEnabled: false,
  status: 'playing',
  startedAt,
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

describe('TimeAttackStrategy', () => {
  it('initSession sets endsAt = startedAt + countdown + 90_000, infinite lives, no safe zone', () => {
    const startedAt = 1_000_000;
    const s = makeSession([makeWorm('a'), makeWorm('b')], startedAt);
    new TimeAttackStrategy().initSession(s);
    expect(s.endsAt).toBe(
      startedAt + GLIMWORM_COUNTDOWN_MS + GLIMWORM_TIME_ATTACK_DURATION_MS,
    );
    expect(s.worms.a.livesLeft).toBe(Number.POSITIVE_INFINITY);
    expect(s.worms.b.livesLeft).toBe(Number.POSITIVE_INFINITY);
    expect(s.arena.safeZone).toBeUndefined();
  });

  it('onWormDeath schedules respawn, awards killer +5 score, drops 30% bonus food', () => {
    const NOW = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(NOW);

    const victim = makeWorm('v', { score: 10, segments: [{ x: 500, y: 500 }] });
    const killer = makeWorm('k', { score: 0 });
    const s = makeSession([victim, killer]);

    new TimeAttackStrategy().onWormDeath(s, s.worms.v, s.worms.k);

    expect(s.worms.v.alive).toBe(false);
    expect(s.worms.v.respawnAt).toBe(NOW + GLIMWORM_RESPAWN_DELAY_MS);
    expect(s.worms.k.score).toBe(5);
    // 30% of 10 = 3 bonus food items at the victim's head
    expect(s.food).toHaveLength(3);
    expect(s.food[0].pos).toEqual({ x: 500, y: 500 });
    expect(s.food[0].value).toBe(1);

    jest.restoreAllMocks();
  });

  it('onWormDeath with null killer: no score awarded, still schedules respawn', () => {
    const NOW = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(NOW);

    const victim = makeWorm('v', { score: 10 });
    const s = makeSession([victim]);

    new TimeAttackStrategy().onWormDeath(s, s.worms.v, null);

    expect(s.worms.v.alive).toBe(false);
    expect(s.worms.v.respawnAt).toBe(NOW + GLIMWORM_RESPAWN_DELAY_MS);
    expect(s.food.length).toBe(3); // bonus food still drops

    jest.restoreAllMocks();
  });

  it('checkEndCondition returns null while now < endsAt', () => {
    const startedAt = 1_000_000;
    const s = makeSession(
      [makeWorm('a', { score: 5 }), makeWorm('b', { score: 3 })],
      startedAt,
    );
    new TimeAttackStrategy().initSession(s);
    jest.spyOn(Date, 'now').mockReturnValue(startedAt + 1000); // 1 sec in
    expect(new TimeAttackStrategy().checkEndCondition(s)).toBeNull();
    jest.restoreAllMocks();
  });

  it('checkEndCondition returns highest-score worm when time is up; tie returns null', () => {
    const startedAt = 1_000_000;
    const s = makeSession(
      [makeWorm('a', { score: 5 }), makeWorm('b', { score: 9 })],
      startedAt,
    );
    new TimeAttackStrategy().initSession(s);
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(
        startedAt +
          GLIMWORM_COUNTDOWN_MS +
          GLIMWORM_TIME_ATTACK_DURATION_MS +
          1,
      );
    expect(new TimeAttackStrategy().checkEndCondition(s)).toBe('b');

    const s2 = makeSession(
      [makeWorm('c', { score: 7 }), makeWorm('d', { score: 7 })],
      startedAt,
    );
    new TimeAttackStrategy().initSession(s2);
    expect(new TimeAttackStrategy().checkEndCondition(s2)).toBeNull();

    jest.restoreAllMocks();
  });
});
