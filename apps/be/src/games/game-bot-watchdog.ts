import { Logger } from '@nestjs/common';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import type { Server as SocketIOServer } from 'socket.io';
import { AI_VS_AI_DELAYS_MS, isAiVsAiSession } from './common/ai-vs-ai';
import { GameSessionsService } from './sessions/game-sessions.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';

const INTERVAL_MS = 10_000;
export const STALE_THRESHOLD_MS = Math.max(...AI_VS_AI_DELAYS_MS) * 2;
const MAX_BACKOFF_MS = 300_000;
const SESSION_LIMIT = 100;
const READY_STATE = 1;
const LOCK_TTL_MS = 30_000;
const LOCK_PREFIX = 'bot:lock:';

export interface BotService {
  checkAndPlay(session: GameSessionSummary): Promise<void>;
}

export type PreCheckFn = (session: GameSessionSummary) => Promise<void>;

/**
 * Shared watchdog that polls for stale active sessions and triggers a bot
 * to play. Used by Critical, Sea Battle, Tic-Tac-Toe, Chess, and Cascade
 * to avoid duplicating the same ~30 lines in every game service.
 *
 * When a Redis client is provided (cluster mode), a per-session distributed
 * lock prevents multiple workers from running minimax on the same session
 * simultaneously — the primary cause of 100% CPU spins.
 */
export class GameBotWatchdog {
  private readonly logger = new Logger(GameBotWatchdog.name);
  private interval: ReturnType<typeof setInterval> | null = null;
  private consecutiveFailures = 0;
  private nextRun = 0;

  constructor(
    private readonly gameId: string,
    private readonly sessionsService: GameSessionsService,
    private readonly botService: BotService,
    private readonly mongoConnection: Connection,
    private readonly preCheck?: PreCheckFn,
    private readonly redis?: Redis,
    private readonly io?: SocketIOServer,
  ) {}

  start(): void {
    this.interval = setInterval(() => {
      void this.tick();
    }, INTERVAL_MS);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async tick(): Promise<void> {
    const now = Date.now();
    if (now < this.nextRun) return;

    if (Number(this.mongoConnection.readyState) !== READY_STATE) {
      if (this.consecutiveFailures === 0) {
        this.logger.warn(
          `MongoDB not connected (readyState=${String(this.mongoConnection.readyState)}), skipping watchdog tick`,
        );
      }
      this.consecutiveFailures++;
      const backoffMs = Math.min(
        INTERVAL_MS * 2 ** this.consecutiveFailures,
        MAX_BACKOFF_MS,
      );
      this.nextRun = Date.now() + backoffMs;
      return;
    }

    try {
      const staleSessions = await this.sessionsService.findStaleActiveSessions(
        this.gameId,
        STALE_THRESHOLD_MS,
        SESSION_LIMIT,
      );

      for (const session of staleSessions) {
        // AI vs AI: complete session if no one is watching
        // (give extra time for spectators to join — 60s threshold)
        if (isAiVsAiSession(session) && this.io) {
          const sockets = await this.io
            .in(`game-room:${session.roomId}`)
            .fetchSockets();
          const staleMs = Date.now() - new Date(session.updatedAt).getTime();
          if (sockets.length === 0 && staleMs > 60_000) {
            this.logger.log(
              `AI vs AI session ${session.id} completed — no watchers in room ${session.roomId}`,
            );
            await this.sessionsService.updateSessionState({
              sessionId: session.id,
              state: {},
              status: 'completed',
            });
            continue;
          }
        }

        if (this.preCheck) {
          this.preCheck(session).catch((err) =>
            this.logger.error(
              `Watchdog pre-check failed for room ${session.roomId}: ${err}`,
            ),
          );
        }

        const lockKey = `${LOCK_PREFIX}${this.gameId}:${session.id}`;
        let locked = false;
        try {
          if (this.redis) {
            const result = await this.redis.set(
              lockKey,
              process.pid.toString(),
              'PX',
              LOCK_TTL_MS,
              'NX',
            );
            if (!result) {
              continue;
            }
            locked = true;
          }
          await this.botService.checkAndPlay(session);
        } catch (err) {
          this.logger.error(
            `Watchdog trigger failed for room ${session.roomId}: ${err}`,
          );
        } finally {
          if (locked && this.redis) {
            await this.redis.del(lockKey).catch(() => {});
          }
        }
      }
      if (this.consecutiveFailures > 0) {
        this.logger.warn(
          `Watchdog recovered after ${this.consecutiveFailures} failures`,
        );
      }
      this.consecutiveFailures = 0;
      this.nextRun = 0;
    } catch (err) {
      this.consecutiveFailures++;
      const backoffMs = Math.min(
        INTERVAL_MS * 2 ** this.consecutiveFailures,
        MAX_BACKOFF_MS,
      );
      this.nextRun = Date.now() + backoffMs;
      if (this.consecutiveFailures <= 3) {
        this.logger.error(
          `Watchdog failed (attempt ${this.consecutiveFailures}, retrying in ${Math.round(backoffMs / 1000)}s): ${err}`,
        );
      }
    }
  }
}
