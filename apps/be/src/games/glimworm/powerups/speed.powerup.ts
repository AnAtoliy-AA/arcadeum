import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_POWERUP_DURATION_MS,
  GLIMWORM_SPEED_BURST_MULT,
} from '../glimworm.constants';
import type { PowerupDef } from './powerup.def';
import { registerPowerup } from './powerup.def';

export const speedPowerup: PowerupDef = {
  kind: 'speed',
  durationMs: GLIMWORM_POWERUP_DURATION_MS.speed,
  apply(worm, session, now) {
    void session;
    worm.speed = GLIMWORM_BASE_SPEED * GLIMWORM_SPEED_BURST_MULT;
    worm.activePowerup = {
      kind: 'speed',
      expiresAt: now + GLIMWORM_POWERUP_DURATION_MS.speed,
    };
  },
  expire(worm, session) {
    void session;
    worm.speed = GLIMWORM_BASE_SPEED;
    if (worm.activePowerup?.kind === 'speed') {
      worm.activePowerup = null;
    }
  },
};

registerPowerup(speedPowerup);
