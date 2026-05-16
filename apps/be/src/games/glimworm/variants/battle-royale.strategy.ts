import {
  GLIMWORM_ARENA,
  GLIMWORM_BR_SHRINK_DURATION_MS,
  GLIMWORM_BR_SAFE_ZONE_DAMAGE_INTERVAL_MS,
  GLIMWORM_TICK_HZ,
} from '../glimworm.constants';
import type { GlimwormSession, Worm, WormId } from '../glimworm.types';
import type { VariantStrategy } from './variant.strategy';

export class BattleRoyaleStrategy implements VariantStrategy {
  initSession(s: GlimwormSession): void {
    Object.values(s.worms).forEach((w) => {
      w.livesLeft = 1;
    });
    const radius = Math.max(GLIMWORM_ARENA.width, GLIMWORM_ARENA.height) / 2;
    s.arena.safeZone = {
      center: { x: GLIMWORM_ARENA.width / 2, y: GLIMWORM_ARENA.height / 2 },
      radius,
      shrinkRate: (radius * 0.7) / (GLIMWORM_BR_SHRINK_DURATION_MS / 1000),
    };
  }

  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void {
    void s;
    void killer;
    victim.alive = false;
    victim.livesLeft = 0;
  }

  checkEndCondition(s: GlimwormSession): WormId | null {
    const all = Object.values(s.worms);
    const alive = all.filter((w) => w.alive);
    if (alive.length === 1) return alive[0].id;
    if (alive.length === 0) {
      const max = Math.max(...all.map((w) => w.score));
      const top = all.filter((w) => w.score === max);
      return top.length === 1 ? top[0].id : null;
    }
    return null;
  }

  tickHook(s: GlimwormSession, now: number): void {
    if (!s.arena.safeZone) return;
    const dtSec = 1 / GLIMWORM_TICK_HZ;
    s.arena.safeZone.radius = Math.max(
      Math.max(s.arena.width, s.arena.height) * 0.15,
      s.arena.safeZone.radius - s.arena.safeZone.shrinkRate * dtSec,
    );
    for (const worm of Object.values(s.worms)) {
      if (!worm.alive) continue;
      const head = worm.segments[0];
      const cz = s.arena.safeZone.center;
      const distSq = (head.x - cz.x) ** 2 + (head.y - cz.y) ** 2;
      if (distSq > s.arena.safeZone.radius ** 2) {
        const last = s.damageTickAt[worm.id] ?? 0;
        if (now - last >= GLIMWORM_BR_SAFE_ZONE_DAMAGE_INTERVAL_MS) {
          worm.segments.pop();
          s.damageTickAt[worm.id] = now;
          if (worm.segments.length <= 0) this.onWormDeath(s, worm, null);
        }
      } else {
        delete s.damageTickAt[worm.id];
      }
    }
  }
}
