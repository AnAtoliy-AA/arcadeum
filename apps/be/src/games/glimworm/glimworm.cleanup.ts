import type { Logger } from '@nestjs/common';
import type { GlimwormSession } from './glimworm.types';
import type { GlimwormStateStore } from './glimworm.state';

const SESSION_STALE_THRESHOLD_MS = 15 * 60_000;

interface CleanupContext {
  stateStore: GlimwormStateStore;
  logger: Logger;
  stopTickLoop(roomId: string): void;
  cancelCountdown(roomId: string): void;
  strategies: Map<string, unknown>;
  growthTargets: Map<string, unknown>;
}

export function cleanupStaleSessions(ctx: CleanupContext): void {
  const now = Date.now();
  for (const session of ctx.stateStore.list()) {
    const isActive =
      session.status === 'playing' || session.status === 'countdown';
    if (!isActive) {
      const allDisconnected = Object.values(session.worms).every(
        (w) => w.disconnected || w.isBot,
      );
      if (allDisconnected || Object.keys(session.worms).length === 0) {
        ctx.logger.debug(
          `Cleaning up stale Glimworm session ${session.roomId} (status=${session.status})`,
        );
        removeSession(ctx, session);
        continue;
      }
    }
    const age = session.startedAt ? now - session.startedAt : 0;
    if (age > SESSION_STALE_THRESHOLD_MS && !isActive) {
      ctx.logger.debug(
        `Cleaning up old idle Glimworm session ${session.roomId} (age=${Math.round(age / 1000)}s)`,
      );
      removeSession(ctx, session);
    }
  }
}

function removeSession(ctx: CleanupContext, session: GlimwormSession): void {
  ctx.stopTickLoop(session.roomId);
  ctx.cancelCountdown(session.roomId);
  ctx.strategies.delete(session.roomId);
  ctx.growthTargets.delete(session.roomId);
  ctx.stateStore.remove(session.roomId);
}
