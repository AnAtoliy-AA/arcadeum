import { LivesHeatsStrategy } from './lives-heats.strategy';
import {
  GLIMWORM_LIVES_HEATS_LIVES,
  GLIMWORM_LIVES_HEATS_TIMEOUT_MS,
  GLIMWORM_RESPAWN_DELAY_MS,
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
  variant: 'lives_heats',
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

describe('LivesHeatsStrategy', () => {
  it('initSession sets livesLeft = 3 and no safe zone', () => {
    const s = makeSession([makeWorm('a'), makeWorm('b')]);
    new LivesHeatsStrategy().initSession(s);
    expect(s.worms.a.livesLeft).toBe(GLIMWORM_LIVES_HEATS_LIVES);
    expect(s.worms.b.livesLeft).toBe(GLIMWORM_LIVES_HEATS_LIVES);
    expect(s.arena.safeZone).toBeUndefined();
  });

  it('onWormDeath decrements livesLeft and schedules respawn when lives remain', () => {
    const NOW = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    const s = makeSession([makeWorm('a', { livesLeft: 3 })]);
    new LivesHeatsStrategy().onWormDeath(s, s.worms.a, null);
    expect(s.worms.a.livesLeft).toBe(2);
    expect(s.worms.a.respawnAt).toBe(NOW + GLIMWORM_RESPAWN_DELAY_MS);
    // Worm is dead THIS round but will respawn — implementation may or may not flip alive=false.
    // Don't assert alive state here; assert it in the "no lives left" test below.
    jest.restoreAllMocks();
  });

  it('onWormDeath with last life flips alive=false permanently and does NOT schedule respawn', () => {
    const NOW = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    const s = makeSession([makeWorm('a', { livesLeft: 1 })]);
    new LivesHeatsStrategy().onWormDeath(s, s.worms.a, null);
    expect(s.worms.a.livesLeft).toBe(0);
    expect(s.worms.a.alive).toBe(false);
    expect(s.worms.a.respawnAt).toBeUndefined();
    jest.restoreAllMocks();
  });

  it('checkEndCondition returns null while multiple worms still have lives', () => {
    const s = makeSession([
      makeWorm('a', { livesLeft: 2 }),
      makeWorm('b', { livesLeft: 1 }),
    ]);
    new LivesHeatsStrategy().initSession(s);
    jest.spyOn(Date, 'now').mockReturnValue((s.startedAt ?? 0) + 1000);
    expect(new LivesHeatsStrategy().checkEndCondition(s)).toBeNull();
    jest.restoreAllMocks();
  });

  it('checkEndCondition returns the only worm with lives left', () => {
    const s = makeSession([
      makeWorm('a', { livesLeft: 0, alive: false }),
      makeWorm('b', { livesLeft: 2 }),
    ]);
    new LivesHeatsStrategy().initSession(s);
    jest.spyOn(Date, 'now').mockReturnValue((s.startedAt ?? 0) + 1000);
    expect(new LivesHeatsStrategy().checkEndCondition(s)).toBe('b');
    jest.restoreAllMocks();
  });

  it('checkEndCondition returns highest combined-rank worm at 5-min soft timeout', () => {
    const startedAt = 1_000_000;
    // Both still alive at timeout: combined rank = score + livesLeft * 50
    // 'a': 100 + 1*50 = 150; 'b': 60 + 2*50 = 160 → 'b' wins
    const s = makeSession(
      [
        makeWorm('a', { livesLeft: 1, score: 100 }),
        makeWorm('b', { livesLeft: 2, score: 60 }),
      ],
      startedAt,
    );
    new LivesHeatsStrategy().initSession(s);
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(startedAt + GLIMWORM_LIVES_HEATS_TIMEOUT_MS + 1);
    expect(new LivesHeatsStrategy().checkEndCondition(s)).toBe('b');
    jest.restoreAllMocks();
  });

  it('checkEndCondition returns null on tied combined rank at timeout', () => {
    const startedAt = 1_000_000;
    // Both: score 100 + livesLeft 1 * 50 = 150
    const s = makeSession(
      [
        makeWorm('a', { livesLeft: 1, score: 100 }),
        makeWorm('b', { livesLeft: 1, score: 100 }),
      ],
      startedAt,
    );
    new LivesHeatsStrategy().initSession(s);
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(startedAt + GLIMWORM_LIVES_HEATS_TIMEOUT_MS + 1);
    expect(new LivesHeatsStrategy().checkEndCondition(s)).toBeNull();
    jest.restoreAllMocks();
  });
});
