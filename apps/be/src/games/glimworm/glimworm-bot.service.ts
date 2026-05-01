import { Injectable } from '@nestjs/common';
import type { GlimwormSession, Vec2, Worm } from './glimworm.types';

const WALL_REPULSION_DIST = 200;
const TRAIL_REPULSION_DIST = 150;
const WALL_WEIGHT = 1.5;
const TRAIL_WEIGHT = 1.2;

const distSq = (a: Vec2, b: Vec2): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

@Injectable()
export class GlimwormBotService {
  pickAngle(session: GlimwormSession, bot: Worm): number {
    const head = bot.segments[0];
    if (!head) return bot.heading;

    let dx = 0;
    let dy = 0;

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
      dx += vx / len;
      dy += vy / len;
    }

    if (head.x < WALL_REPULSION_DIST) {
      dx += WALL_WEIGHT * (1 - head.x / WALL_REPULSION_DIST);
    }
    if (head.x > session.arena.width - WALL_REPULSION_DIST) {
      const closeness =
        1 - (session.arena.width - head.x) / WALL_REPULSION_DIST;
      dx -= WALL_WEIGHT * closeness;
    }
    if (head.y < WALL_REPULSION_DIST) {
      dy += WALL_WEIGHT * (1 - head.y / WALL_REPULSION_DIST);
    }
    if (head.y > session.arena.height - WALL_REPULSION_DIST) {
      const closeness =
        1 - (session.arena.height - head.y) / WALL_REPULSION_DIST;
      dy -= WALL_WEIGHT * closeness;
    }

    const trailRepDistSq = TRAIL_REPULSION_DIST ** 2;
    for (const worm of Object.values(session.worms)) {
      if (worm.id === bot.id) continue;
      for (const seg of worm.segments) {
        const d = distSq(head, seg);
        if (d < trailRepDistSq && d > 0) {
          const len = Math.sqrt(d);
          const vx = (head.x - seg.x) / len;
          const vy = (head.y - seg.y) / len;
          const closeness = 1 - len / TRAIL_REPULSION_DIST;
          dx += vx * TRAIL_WEIGHT * closeness;
          dy += vy * TRAIL_WEIGHT * closeness;
        }
      }
    }

    if (dx === 0 && dy === 0) return bot.heading;
    return Math.atan2(dy, dx);
  }
}
