import { ghostPowerup } from './ghost.powerup';
import { getPowerup } from './powerup.def';
import {
  GLIMWORM_BASE_SPEED,
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

describe('ghostPowerup', () => {
  it('registers in the global POWERUP_REGISTRY under "ghost"', () => {
    expect(getPowerup('ghost')).toBe(ghostPowerup);
    expect(ghostPowerup.kind).toBe('ghost');
    expect(ghostPowerup.durationMs).toBe(GLIMWORM_POWERUP_DURATION_MS.ghost);
  });

  it('apply sets activePowerup with correct expiry, leaves speed unchanged', () => {
    const NOW = 5_000_000;
    const worm = makeWorm();
    const s = makeSession([worm]);
    ghostPowerup.apply(worm, s, NOW);
    expect(worm.activePowerup).toEqual({
      kind: 'ghost',
      expiresAt: NOW + GLIMWORM_POWERUP_DURATION_MS.ghost,
    });
    expect(worm.speed).toBe(GLIMWORM_BASE_SPEED);
  });

  it('expire clears activePowerup when it is still the ghost kind', () => {
    const worm = makeWorm({
      activePowerup: { kind: 'ghost', expiresAt: 0 },
    });
    const s = makeSession([worm]);
    expect(typeof ghostPowerup.expire).toBe('function');
    ghostPowerup.expire!(worm, s);
    expect(worm.activePowerup).toBeNull();
  });

  it('expire does NOT clear activePowerup if it is a different kind', () => {
    const worm = makeWorm({
      activePowerup: { kind: 'shield', expiresAt: 99 },
    });
    const s = makeSession([worm]);
    ghostPowerup.expire!(worm, s);
    expect(worm.activePowerup).toEqual({ kind: 'shield', expiresAt: 99 });
  });
});
