import { Injectable } from '@nestjs/common';
import type { GlimwormSession, Vec2, Worm } from './glimworm.types';

const WALL_REPULSION_DIST = 320;
const TRAIL_REPULSION_DIST = 220;
const FOOD_WEIGHT = 1.0;
const WALL_WEIGHT = 5.0;
const TRAIL_WEIGHT = 3.5;
// Skip the immediately-trailing segments so the bot doesn't treat its own
// neck as an obstacle and lock up in place.
const SELF_SKIP = 6;
// Smooth heading changes toward the target so the bot doesn't oscillate.
const HEADING_LERP = 0.25;

const distSq = (a: Vec2, b: Vec2): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/**
 * Lerp current angle toward target along the shorter arc.
 * Both inputs are in radians.
 */
function lerpAngle(current: number, target: number, t: number): number {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * t;
}

@Injectable()
export class GlimwormBotService {
  pickAngle(session: GlimwormSession, bot: Worm): number {
    const head = bot.segments[0];
    if (!head) return bot.heading;

    let dx = 0;
    let dy = 0;

    // 1. Attractor: nearest food.
    let nearestFood: Vec2 | null = null;
    let nearestD = Infinity;
    for (const food of session.food) {
      const d = distSq(head, food.pos);
      if (d < nearestD) {
        nearestD = d;
        nearestFood = food.pos;
      }
    }
    if (nearestFood) {
      const vx = nearestFood.x - head.x;
      const vy = nearestFood.y - head.y;
      const len = Math.hypot(vx, vy) || 1;
      dx += FOOD_WEIGHT * (vx / len);
      dy += FOOD_WEIGHT * (vy / len);
    }

    // 2. Wall repulsion (inverse-square so it dominates near the edge).
    const arena = session.arena;
    const wallContribution = (
      distFromWall: number,
      vx: number,
      vy: number,
    ): void => {
      if (distFromWall >= WALL_REPULSION_DIST) return;
      const closeness = 1 - distFromWall / WALL_REPULSION_DIST;
      const force = WALL_WEIGHT * closeness * closeness;
      dx += vx * force;
      dy += vy * force;
    };
    wallContribution(head.x, 1, 0);
    wallContribution(arena.width - head.x, -1, 0);
    wallContribution(head.y, 0, 1);
    wallContribution(arena.height - head.y, 0, -1);

    // 3. Trail repulsion — every segment of every worm INCLUDING this bot's
    //    own body past SELF_SKIP. Inverse-square so very close trails dominate.
    const trailRepDistSq = TRAIL_REPULSION_DIST ** 2;
    for (const worm of Object.values(session.worms)) {
      if (!worm.alive) continue;
      const isSelf = worm.id === bot.id;
      const start = isSelf ? SELF_SKIP : 0;
      for (let i = start; i < worm.segments.length; i++) {
        const seg = worm.segments[i];
        const d = distSq(head, seg);
        if (d < trailRepDistSq && d > 0) {
          const len = Math.sqrt(d);
          const vx = (head.x - seg.x) / len;
          const vy = (head.y - seg.y) / len;
          const closeness = 1 - len / TRAIL_REPULSION_DIST;
          const force = TRAIL_WEIGHT * closeness * closeness;
          dx += vx * force;
          dy += vy * force;
        }
      }
    }

    if (dx === 0 && dy === 0) return bot.heading;
    const target = Math.atan2(dy, dx);
    return lerpAngle(bot.heading, target, HEADING_LERP);
  }
}
