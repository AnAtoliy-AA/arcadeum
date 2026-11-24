import type { Logger } from '@nestjs/common';
import type { Model } from 'mongoose';
import type { GameSession } from '../schemas/game-session.schema';
import type { GameSessionSummary } from './game-sessions.service';

/** Invoked once a session transitions to `completed` via an engine action. */
export type SessionCompletionListener = (
  session: GameSessionSummary,
) => Promise<void>;

/**
 * Registry of post-completion callbacks (post-match XP, stats, rewards).
 * Listeners run outside the session lock and their failures never affect
 * the action result.
 */
export class SessionCompletionHooks {
  private readonly listeners: SessionCompletionListener[] = [];

  register(listener: SessionCompletionListener): void {
    this.listeners.push(listener);
  }

  async notify(session: GameSessionSummary, logger: Logger): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener(session);
      } catch (err) {
        logger.warn(
          `Completion listener failed for session ${session.id}: ${(err as Error).message}`,
        );
      }
    }
  }
}

/**
 * Atomically claim post-match processing for a session. Resolves true only
 * for the first caller, so retries/reconnects never double-award.
 */
export async function claimPostMatchProcessing(
  model: Model<GameSession>,
  sessionId: string,
): Promise<boolean> {
  const claimed = await model
    .findOneAndUpdate(
      { _id: sessionId, postMatchProcessedAt: { $exists: false } },
      { $set: { postMatchProcessedAt: new Date() } },
    )
    .exec();
  return claimed !== null;
}
