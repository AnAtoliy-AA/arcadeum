import {
  GLIMWORM_RESPAWN_DELAY_MS,
  GLIMWORM_TIME_ATTACK_DURATION_MS,
} from '../glimworm.constants';
import type { Food, GlimwormSession, Worm, WormId } from '../glimworm.types';
import type { VariantStrategy } from './variant.strategy';

export class TimeAttackStrategy implements VariantStrategy {
  initSession(s: GlimwormSession): void {
    Object.values(s.worms).forEach((w) => {
      w.livesLeft = Number.POSITIVE_INFINITY;
    });
    const startedAt = s.startedAt ?? Date.now();
    s.endsAt = startedAt + GLIMWORM_TIME_ATTACK_DURATION_MS;
  }

  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void {
    const now = Date.now();
    victim.alive = false;
    victim.respawnAt = now + GLIMWORM_RESPAWN_DELAY_MS;

    if (killer) {
      killer.score += 5;
    }

    const bonusCount = Math.floor(victim.score * 0.3);
    const head = victim.segments[0];
    if (head && bonusCount > 0) {
      for (let i = 0; i < bonusCount; i++) {
        const food: Food = {
          id: `food-bonus-${victim.id}-${s.tickNum}-${i}`,
          pos: { x: head.x, y: head.y },
          value: 1,
        };
        s.food.push(food);
      }
    }
  }

  checkEndCondition(s: GlimwormSession): WormId | null {
    const endsAt = s.endsAt ?? Number.POSITIVE_INFINITY;
    if (Date.now() < endsAt) return null;

    const all = Object.values(s.worms);
    if (all.length === 0) return null;
    const max = Math.max(...all.map((w) => w.score));
    const top = all.filter((w) => w.score === max);
    return top.length === 1 ? top[0].id : null;
  }
}
