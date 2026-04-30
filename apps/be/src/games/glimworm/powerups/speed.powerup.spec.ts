import { speedPowerup } from './speed.powerup';
import { getPowerup } from './powerup.def';
import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_SPEED_BURST_MULT,
  GLIMWORM_POWERUP_DURATION_MS,
} from '../glimworm.constants';
import type { GlimwormSession, Worm } from '../glimworm.types';

const makeWorm = (overrides: Partial<Worm> = {}): Worm => ({
  id: 'a',
  color: '#fff',
  segments: [{ x: 0, y: 0 }],
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
  tickNum: 0,
  lastInputAt: {},
  lastPowerupSpawnAt: 0,
  damageTickAt: {},
});

describe('speedPowerup', () => {
  it('registers in the global POWERUP_REGISTRY under "speed"', () => {
    expect(getPowerup('speed')).toBe(speedPowerup);
    expect(speedPowerup.kind).toBe('speed');
    expect(speedPowerup.durationMs).toBe(GLIMWORM_POWERUP_DURATION_MS.speed);
  });

  it('apply sets speed to base × multiplier and sets activePowerup with correct expiry', () => {
    const NOW = 5_000_000;
    const worm = makeWorm();
    const s = makeSession([worm]);
    speedPowerup.apply(worm, s, NOW);
    expect(worm.speed).toBe(GLIMWORM_BASE_SPEED * GLIMWORM_SPEED_BURST_MULT);
    expect(worm.activePowerup).toEqual({
      kind: 'speed',
      expiresAt: NOW + GLIMWORM_POWERUP_DURATION_MS.speed,
    });
  });

  it('expire reverts speed to base and clears activePowerup', () => {
    const worm = makeWorm({
      speed: GLIMWORM_BASE_SPEED * GLIMWORM_SPEED_BURST_MULT,
      activePowerup: { kind: 'speed', expiresAt: 0 },
    });
    const s = makeSession([worm]);
    expect(typeof speedPowerup.expire).toBe('function');
    speedPowerup.expire!(worm, s);
    expect(worm.speed).toBe(GLIMWORM_BASE_SPEED);
    expect(worm.activePowerup).toBeNull();
  });

  it('expire does NOT clear activePowerup if it is a different kind', () => {
    const worm = makeWorm({
      speed: GLIMWORM_BASE_SPEED,
      activePowerup: { kind: 'shield', expiresAt: 99 },
    });
    const s = makeSession([worm]);
    speedPowerup.expire!(worm, s);
    // speed expires after shield was applied: leave shield alone
    expect(worm.activePowerup).toEqual({ kind: 'shield', expiresAt: 99 });
  });

  it('reapply during active period resets the expiry to a fresh duration', () => {
    const FIRST = 1_000;
    const SECOND = 1_500; // 500ms later, still inside the 3000ms duration
    const worm = makeWorm();
    const s = makeSession([worm]);
    speedPowerup.apply(worm, s, FIRST);
    expect(worm.activePowerup?.expiresAt).toBe(
      FIRST + GLIMWORM_POWERUP_DURATION_MS.speed,
    );
    speedPowerup.apply(worm, s, SECOND);
    expect(worm.activePowerup?.expiresAt).toBe(
      SECOND + GLIMWORM_POWERUP_DURATION_MS.speed,
    );
  });
});
