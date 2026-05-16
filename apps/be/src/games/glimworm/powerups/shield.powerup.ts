import { GLIMWORM_POWERUP_DURATION_MS } from '../glimworm.constants';
import type { PowerupDef } from './powerup.def';
import { registerPowerup } from './powerup.def';

export const shieldPowerup: PowerupDef = {
  kind: 'shield',
  durationMs: GLIMWORM_POWERUP_DURATION_MS.shield,
  apply(worm, session, now) {
    void session;
    worm.activePowerup = {
      kind: 'shield',
      expiresAt: now + GLIMWORM_POWERUP_DURATION_MS.shield,
    };
  },
  expire(worm, session) {
    void session;
    if (worm.activePowerup?.kind === 'shield') {
      worm.activePowerup = null;
    }
  },
};

registerPowerup(shieldPowerup);
