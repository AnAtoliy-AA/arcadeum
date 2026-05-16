import {
  GLIMWORM_LIVES_HEATS_LIVES,
  GLIMWORM_LIVES_HEATS_TIMEOUT_MS,
  GLIMWORM_RESPAWN_DELAY_MS,
} from '../glimworm.constants';
import type { GlimwormSession, Worm, WormId } from '../glimworm.types';
import type { VariantStrategy } from './variant.strategy';

export class LivesHeatsStrategy implements VariantStrategy {
  initSession(s: GlimwormSession): void {
    Object.values(s.worms).forEach((w) => {
      w.livesLeft = GLIMWORM_LIVES_HEATS_LIVES;
    });
  }

  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void {
    void s;
    void killer;
    victim.livesLeft -= 1;
    if (victim.livesLeft > 0) {
      victim.respawnAt = Date.now() + GLIMWORM_RESPAWN_DELAY_MS;
    } else {
      victim.alive = false;
    }
  }

  checkEndCondition(s: GlimwormSession): WormId | null {
    const all = Object.values(s.worms);
    if (all.length === 0) return null;

    const withLives = all.filter((w) => w.livesLeft > 0);
    if (withLives.length === 1) return withLives[0].id;

    const timeoutAt = (s.startedAt ?? 0) + GLIMWORM_LIVES_HEATS_TIMEOUT_MS;
    if (Date.now() >= timeoutAt) {
      const ranks = all.map((w) => ({
        id: w.id,
        rank: w.score + w.livesLeft * 50,
      }));
      const max = Math.max(...ranks.map((r) => r.rank));
      const top = ranks.filter((r) => r.rank === max);
      return top.length === 1 ? top[0].id : null;
    }

    return null;
  }
}
