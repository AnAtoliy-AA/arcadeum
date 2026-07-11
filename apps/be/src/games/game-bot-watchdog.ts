import { Logger } from '@nestjs/common';
import { GameSessionsService } from './sessions/game-sessions.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';

const INTERVAL_MS = 10_000;
const STALE_THRESHOLD_MS = 20_000;
const MAX_BACKOFF_MS = 300_000;
const SESSION_LIMIT = 100;

export interface BotService {
  checkAndPlay(session: GameSessionSummary): Promise<void>;
}

/**
 * Shared watchdog that polls for stale active sessions and triggers a bot
 * to play. Used by Critical, Sea Battle, Tic-Tac-Toe, Chess, and Cascade
 * to avoid duplicating the same ~30 lines in every game service.
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

    try {
      const staleSessions = await this.sessionsService.findStaleActiveSessions(
        this.gameId,
        STALE_THRESHOLD_MS,
        SESSION_LIMIT,
      );

      for (const session of staleSessions) {
        this.botService
          .checkAndPlay(session)
          .catch((err) =>
            this.logger.error(
              `Watchdog trigger failed for room ${session.roomId}: ${err}`,
            ),
          );
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
