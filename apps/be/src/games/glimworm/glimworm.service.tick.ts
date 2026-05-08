import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_FOOD_CAP,
  GLIMWORM_GROW_PER_FOOD,
  GLIMWORM_PALETTE,
  GLIMWORM_POWERUP_CAP,
  GLIMWORM_POWERUP_SPAWN_CHANCE,
  GLIMWORM_POWERUP_SPAWN_INTERVAL_MS,
  GLIMWORM_POWERUP_WEIGHTS,
  GLIMWORM_TICK_MS,
} from './glimworm.constants';
import { getPowerup } from './powerups/powerup.def';
import type {
  Food,
  GlimwormDiscreteEvent,
  GlimwormSession,
  GlimwormSnapshot,
  GlimwormWormSnapshot,
  Powerup,
  PowerupKind,
  Vec2,
  Worm,
  WormId,
} from './glimworm.types';

/**
 * Add bot worms until the session has at least `target` total worms. Bots are
 * marked ready and isBot, get a free palette color, and start with empty
 * segments (the service start() flow places them later).
 */
export function fillWithBots(session: GlimwormSession, target: number): void {
  const used = new Set(Object.values(session.worms).map((w) => w.color));
  while (Object.keys(session.worms).length < target) {
    const id = `bot-${Math.random().toString(36).slice(2, 10)}`;
    const color =
      GLIMWORM_PALETTE.find((c) => !used.has(c)) ?? GLIMWORM_PALETTE[0];
    used.add(color);
    session.worms[id] = {
      id,
      color,
      segments: [],
      heading: 0,
      speed: GLIMWORM_BASE_SPEED,
      alive: true,
      livesLeft: 1,
      score: 0,
      ready: true,
      activePowerup: null,
      inventoryPowerup: null,
      isBot: true,
    };
  }
}

export type RandomFn = () => number;

const HEAD_RADIUS = 8;
const FOOD_RADIUS = 6;
const POWERUP_RADIUS = 10;
const SEGMENT_RADIUS = 6;
const SPAWN_MIN_DIST = 200;
const POWERUP_SPAWN_MIN_DIST = 150;
// Skip the first N segments when checking self-collision. Each tick prepends a
// new head and the trailing segments are within (head_radius + segment_radius)
// of the new head — without a skip, a moving worm would always self-collide.
// 4 ≈ start_length / 2, giving a small grace before the head can curl back
// into its own trail.
const SELF_COLLIDE_SKIP = 4;

export interface TickContext {
  session: GlimwormSession;
  growthTargets: Map<WormId, number>;
  events: GlimwormDiscreteEvent[];
  now: number;
  random: RandomFn;
}

const distSq = (a: Vec2, b: Vec2): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

const aabbHit = (a: Vec2, ar: number, b: Vec2, br: number): boolean => {
  const r = ar + br;
  return Math.abs(a.x - b.x) <= r && Math.abs(a.y - b.y) <= r;
};

export function nextFreeColor(
  session: GlimwormSession,
  requested?: string,
): string {
  const used = new Set(Object.values(session.worms).map((w) => w.color));
  if (
    requested &&
    !used.has(requested) &&
    GLIMWORM_PALETTE.includes(requested as (typeof GLIMWORM_PALETTE)[number])
  ) {
    return requested;
  }
  for (const c of GLIMWORM_PALETTE) {
    if (!used.has(c)) return c;
  }
  // All taken (shouldn't happen — capped at 10 worms == palette size)
  return GLIMWORM_PALETTE[0];
}

export function advanceHeads(session: GlimwormSession): void {
  const dt = GLIMWORM_TICK_MS / 1000;
  for (const worm of Object.values(session.worms)) {
    if (!worm.alive) continue;
    if (worm.disconnected) continue;
    // clamp heading
    if (!Number.isFinite(worm.heading)) worm.heading = 0;
    const head = worm.segments[0];
    if (!head) continue;
    const nx = head.x + Math.cos(worm.heading) * worm.speed * dt;
    const ny = head.y + Math.sin(worm.heading) * worm.speed * dt;
    worm.segments.unshift({ x: nx, y: ny });
  }
}

export function resolvePickups(ctx: TickContext): void {
  const { session, growthTargets, events } = ctx;
  for (const worm of Object.values(session.worms)) {
    if (!worm.alive) continue;
    const head = worm.segments[0];
    if (!head) continue;

    // Food
    for (let i = session.food.length - 1; i >= 0; i--) {
      const food = session.food[i];
      if (aabbHit(head, HEAD_RADIUS, food.pos, FOOD_RADIUS)) {
        worm.score += food.value;
        const grow = GLIMWORM_GROW_PER_FOOD[food.value];
        const current = growthTargets.get(worm.id) ?? worm.segments.length;
        growthTargets.set(worm.id, current + grow);
        session.food.splice(i, 1);
      }
    }

    // Power-ups
    for (let i = session.powerups.length - 1; i >= 0; i--) {
      const pu = session.powerups[i];
      if (aabbHit(head, HEAD_RADIUS, pu.pos, POWERUP_RADIUS)) {
        if (worm.inventoryPowerup === null) {
          worm.inventoryPowerup = pu.kind;
          session.powerups.splice(i, 1);
          events.push({
            type: 'powerup_picked',
            wormId: worm.id,
            kind: pu.kind,
            tickNum: session.tickNum,
          });
        }
      }
    }
  }
}

interface DeathRecord {
  victim: Worm;
  killer: Worm | null;
}

export function resolveCollisions(
  ctx: TickContext,
  onDeath: (victim: Worm, killer: Worm | null) => void,
): void {
  const { session, events } = ctx;
  const aliveWorms = Object.values(session.worms).filter((w) => w.alive);
  const arena = session.arena;
  const deaths: DeathRecord[] = [];

  // Step 1: head-vs-head simultaneous collisions (highest priority)
  const headToHeadVictims = new Set<WormId>();
  for (let i = 0; i < aliveWorms.length; i++) {
    for (let j = i + 1; j < aliveWorms.length; j++) {
      const a = aliveWorms[i];
      const b = aliveWorms[j];
      const ah = a.segments[0];
      const bh = b.segments[0];
      if (!ah || !bh) continue;
      if (aabbHit(ah, HEAD_RADIUS, bh, HEAD_RADIUS)) {
        headToHeadVictims.add(a.id);
        headToHeadVictims.add(b.id);
      }
    }
  }

  for (const worm of aliveWorms) {
    if (headToHeadVictims.has(worm.id)) {
      // Shield absorbs even head-to-head
      if (worm.activePowerup?.kind === 'shield') {
        worm.activePowerup = null;
        continue;
      }
      deaths.push({ victim: worm, killer: null });
      continue;
    }
    const head = worm.segments[0];
    if (!head) continue;

    // Wall — even ghost dies
    if (
      head.x < 0 ||
      head.x >= arena.width ||
      head.y < 0 ||
      head.y >= arena.height
    ) {
      if (worm.activePowerup?.kind === 'shield') {
        worm.activePowerup = null;
        continue;
      }
      deaths.push({ victim: worm, killer: null });
      continue;
    }

    // Self — segments[SELF_COLLIDE_SKIP..]. Skip the immediately-trailing
    // segments since they are always within head-radius of the new head.
    let died = false;
    for (let i = SELF_COLLIDE_SKIP; i < worm.segments.length; i++) {
      if (aabbHit(head, HEAD_RADIUS, worm.segments[i], SEGMENT_RADIUS)) {
        if (worm.activePowerup?.kind === 'shield') {
          worm.activePowerup = null;
        } else {
          deaths.push({ victim: worm, killer: null });
        }
        died = true;
        break;
      }
    }
    if (died) continue;

    // Ghost skips other-trail collisions
    if (worm.activePowerup?.kind === 'ghost') continue;

    // Other trails
    let killer: Worm | null = null;
    outer: for (const other of aliveWorms) {
      if (other.id === worm.id) continue;
      for (let i = 1; i < other.segments.length; i++) {
        if (aabbHit(head, HEAD_RADIUS, other.segments[i], SEGMENT_RADIUS)) {
          killer = other;
          break outer;
        }
      }
    }
    if (killer) {
      if (worm.activePowerup?.kind === 'shield') {
        worm.activePowerup = null;
      } else {
        deaths.push({ victim: worm, killer });
      }
    }
  }

  // Apply deaths via callback so the service can route to variant strategy
  for (const { victim, killer } of deaths) {
    onDeath(victim, killer);
    events.push({
      type: 'worm_died',
      wormId: victim.id,
      killerId: killer?.id ?? null,
      tickNum: session.tickNum,
    });
  }
}

export function trimSegments(
  session: GlimwormSession,
  growthTargets: Map<WormId, number>,
): void {
  for (const worm of Object.values(session.worms)) {
    if (worm.segments.length === 0) continue;
    const target = growthTargets.get(worm.id) ?? worm.segments.length - 1;
    // After advanceHeads we added 1 segment at index 0. So default target is
    // segments.length - 1 (drop the tail to maintain length).
    while (worm.segments.length > target && worm.segments.length > 1) {
      worm.segments.pop();
    }
  }
}

export function pickWeightedPowerupKind(random: RandomFn): PowerupKind {
  const entries = Object.entries(GLIMWORM_POWERUP_WEIGHTS) as Array<
    [PowerupKind, number]
  >;
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = random() * total;
  for (const [kind, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return kind;
  }
  return entries[entries.length - 1][0];
}

const randomTile = (session: GlimwormSession, random: RandomFn): Vec2 => ({
  x: random() * session.arena.width,
  y: random() * session.arena.height,
});

export function spawnItems(ctx: TickContext): void {
  const { session, now, random } = ctx;

  // Top up food
  while (session.food.length < GLIMWORM_FOOD_CAP) {
    const pos = randomTile(session, random);
    const food: Food = {
      id: `food-${session.tickNum}-${session.food.length}-${Math.floor(random() * 1e9)}`,
      pos,
      value: random() < 0.1 ? 3 : 1,
    };
    session.food.push(food);
  }

  // Power-ups
  if (!session.powerupsEnabled) return;
  if (session.powerups.length >= GLIMWORM_POWERUP_CAP) return;
  if (now - session.lastPowerupSpawnAt < GLIMWORM_POWERUP_SPAWN_INTERVAL_MS) {
    return;
  }
  if (random() >= GLIMWORM_POWERUP_SPAWN_CHANCE) return;

  // Find a tile far enough from worm heads
  const minDistSq = POWERUP_SPAWN_MIN_DIST ** 2;
  let chosen: Vec2 | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = randomTile(session, random);
    let ok = true;
    for (const w of Object.values(session.worms)) {
      if (!w.alive) continue;
      const head = w.segments[0];
      if (!head) continue;
      if (distSq(head, candidate) < minDistSq) {
        ok = false;
        break;
      }
    }
    if (ok) {
      chosen = candidate;
      break;
    }
  }
  if (!chosen) return;
  const kind = pickWeightedPowerupKind(random);
  const pu: Powerup = {
    id: `pu-${session.tickNum}-${Math.floor(random() * 1e9)}`,
    pos: chosen,
    kind,
    spawnedAt: now,
  };
  session.powerups.push(pu);
  session.lastPowerupSpawnAt = now;
}

export function expireActivePowerups(
  session: GlimwormSession,
  now: number,
): void {
  for (const worm of Object.values(session.worms)) {
    const ap = worm.activePowerup;
    if (!ap) continue;
    if (now < ap.expiresAt) continue;
    const def = getPowerup(ap.kind);
    if (def.expire) def.expire(worm, session);
    if (worm.activePowerup === ap) {
      worm.activePowerup = null;
    }
    // Defensive: speed expire should already have reset speed; guard regardless.
    if (worm.activePowerup === null && worm.speed !== GLIMWORM_BASE_SPEED) {
      worm.speed = GLIMWORM_BASE_SPEED;
    }
  }
}

export function findSpawnPosition(
  session: GlimwormSession,
  random: RandomFn = Math.random,
): Vec2 {
  const minSq = SPAWN_MIN_DIST ** 2;
  const samples: Vec2[] = [];
  for (let i = 0; i < 20; i++) {
    const candidate = randomTile(session, random);
    samples.push(candidate);
    let ok = true;
    for (const w of Object.values(session.worms)) {
      for (const seg of w.segments) {
        if (distSq(candidate, seg) < minSq) {
          ok = false;
          break;
        }
      }
      if (!ok) break;
    }
    if (ok) return candidate;
  }
  // Pick the candidate with the largest min-distance from any segment
  let best: Vec2 = samples[0];
  let bestMin = -Infinity;
  for (const candidate of samples) {
    let minD = Infinity;
    for (const w of Object.values(session.worms)) {
      for (const seg of w.segments) {
        const d = distSq(candidate, seg);
        if (d < minD) minD = d;
      }
    }
    if (minD > bestMin) {
      bestMin = minD;
      best = candidate;
    }
  }
  return best;
}

export function buildSnapshotForViewer(
  session: GlimwormSession,
  viewerId: WormId,
  serverTime: number,
): GlimwormSnapshot {
  const worms: GlimwormWormSnapshot[] = Object.values(session.worms).map(
    (w) => {
      const isSelf = w.id === viewerId;
      const base: GlimwormWormSnapshot = {
        id: w.id,
        color: w.color,
        segments: w.segments,
        alive: w.alive,
        livesLeft: w.livesLeft,
        score: w.score,
        activePowerup: w.activePowerup,
      };
      if (isSelf) {
        base.self = true;
        base.heading = w.heading;
        base.speed = w.speed;
        base.inventoryPowerup = w.inventoryPowerup;
      }
      return base;
    },
  );
  return {
    roomId: session.roomId,
    tickNum: session.tickNum,
    serverTime,
    status: session.status,
    variant: session.variant,
    powerupsEnabled: session.powerupsEnabled,
    arena: session.arena,
    worms,
    food: session.food,
    powerups: session.powerups,
    endsAt: session.endsAt,
    winner: session.winner,
  };
}
