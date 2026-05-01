import { GLIMWORM_POWERUP_DURATION_MS } from '../glimworm.constants';
import type { PowerupDef } from './powerup.def';
import { registerPowerup } from './powerup.def';

export const ghostPowerup: PowerupDef = {
  kind: 'ghost',
  durationMs: GLIMWORM_POWERUP_DURATION_MS.ghost,
  apply(worm, session, now) {
    void session;
    worm.activePowerup = {
      kind: 'ghost',
      expiresAt: now + GLIMWORM_POWERUP_DURATION_MS.ghost,
    };
  },
  expire(worm, session) {
    void session;
    if (worm.activePowerup?.kind === 'ghost') {
      worm.activePowerup = null;
    }
  },
};

registerPowerup(ghostPowerup);
