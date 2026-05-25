import {
  GLIMWORM_BASE_SPEED,
  GLIMWORM_START_LENGTH,
  GLIMWORM_TICK_MS,
} from './glimworm.constants';
import {
  advanceHeads,
  expireActivePowerups,
  findSpawnPosition,
  resolveCollisions,
  resolvePickups,
  spawnItems,
  trimSegments,
  type RandomFn,
  type TickContext,
} from './glimworm.service.tick';
import type { VariantStrategy } from './variants/variant.strategy';
import type {
  GlimwormDiscreteEvent,
  GlimwormSession,
  Vec2,
  Worm,
  WormId,
} from './glimworm.types';

/**
 * Place every worm at a spawn position and seed segments behind the head along
 * the opposite-of-heading axis. Called by start() once the roster is final.
 *
 * Seeding the trail backwards avoids spurious self-collision on tick 1 when
 * stacked segments would otherwise overlap the new head AABB.
 */
export function seedWormSpawns(
  session: GlimwormSession,
  random: RandomFn,
): void {
  const center: Vec2 = {
    x: session.arena.width / 2,
    y: session.arena.height / 2,
  };
  for (const worm of Object.values(session.worms)) {
    const head = findSpawnPosition(session, random);
    const heading = Math.atan2(center.y - head.y, center.x - head.x);
    const stepX =
      -Math.cos(heading) * (GLIMWORM_BASE_SPEED * (GLIMWORM_TICK_MS / 1000));
    const stepY =
      -Math.sin(heading) * (GLIMWORM_BASE_SPEED * (GLIMWORM_TICK_MS / 1000));
    const segments: Vec2[] = [];
    for (let i = 0; i < GLIMWORM_START_LENGTH; i++) {
      segments.push({ x: head.x + stepX * i, y: head.y + stepY * i });
    }
    worm.segments = segments;
    worm.heading = heading;
    worm.alive = true;
    worm.score = 0;
    worm.activePowerup = null;
    worm.inventoryPowerup = null;
    worm.speed = GLIMWORM_BASE_SPEED;
  }
}

/**
 * Reset every worm in the session back to its lobby state. Bots remain in
 * the roster; humans keep their color but lose all in-game state.
 */
export function resetWormsForLobby(session: GlimwormSession): void {
  for (const worm of Object.values(session.worms)) {
    worm.segments = [];
    worm.alive = true;
    worm.score = 0;
    worm.livesLeft = 1;
    worm.activePowerup = null;
    worm.inventoryPowerup = null;
    delete worm.respawnAt;
    delete worm.disconnected;
    delete worm.disconnectedAt;
  }
}

export interface RunTickDeps {
  session: GlimwormSession;
  growthTargets: Map<WormId, number>;
  strategy: VariantStrategy | undefined;
  random: RandomFn;
  pickBotAngle: (session: GlimwormSession, worm: Worm) => number;
  emitEvents: (events: GlimwormDiscreteEvent[]) => void;
  emitSnapshots: (session: GlimwormSession) => void;
}

export interface RunTickResult {
  ended: boolean;
  winner: WormId | null;
}

/**
 * Run one game tick: apply inputs, advance heads, resolve pickups and
 * collisions, trim segments, spawn items, expire power-ups, and emit
 * snapshots/events. Returns `ended: true` when the variant strategy reports a
 * winner so the caller can transition the session to the ended state.
 */
export function runGameTick(deps: RunTickDeps): RunTickResult {
  const {
    session,
    growthTargets,
    strategy,
    random,
    pickBotAngle,
    emitEvents,
    emitSnapshots,
  } = deps;

  if (session.status !== 'playing' && session.status !== 'countdown') {
    return { ended: false, winner: null };
  }
  // During countdown: keep emitting snapshots so the client can render the
  // 3-2-1 overlay, but skip simulation.
  if (session.status === 'countdown') {
    emitSnapshots(session);
    return { ended: false, winner: null };
  }

  session.tickNum += 1;
  const now = Date.now();

  const events: GlimwormDiscreteEvent[] = [];
  const ctx: TickContext = {
    session,
    growthTargets,
    events,
    now,
    random,
  };

  // Phase 1: apply inputs (humans set heading via submitInput; bots decide here).
  for (const worm of Object.values(session.worms)) {
    if (worm.isBot && worm.alive && !worm.disconnected) {
      worm.heading = pickBotAngle(session, worm);
    }
    if (!Number.isFinite(worm.heading)) worm.heading = 0;
  }

  advanceHeads(session);
  resolvePickups(ctx);
  resolveCollisions(ctx, (victim, killer) => {
    if (strategy) strategy.onWormDeath(session, victim, killer);
    else victim.alive = false;
  });
  trimSegments(session, growthTargets);
  spawnItems(ctx);
  expireActivePowerups(session, now);

  if (strategy) {
    if (strategy.tickHook) strategy.tickHook(session, now);
    const winner = strategy.checkEndCondition(session);
    if (winner !== null && session.status === 'playing') {
      // Emit collected events first so listeners see deaths before round_ended.
      if (events.length > 0) emitEvents(events);
      return { ended: true, winner };
    }
  }

  if (events.length > 0) emitEvents(events);
  emitSnapshots(session);
  return { ended: false, winner: null };
}
