import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type { Queue } from 'bullmq';

const CLAN_WARS_QUEUE_TOKEN = 'BullQueue_clan-wars';

export interface ClanWarMatchResolutionPayload {
  winnerUserId: string;
  loserUserId: string;
  gameId: string;
}

export interface ClanWarMatchmakingPayload {
  requesterUserId: string;
  clanId: string;
  preferredGameId?: string;
}

@Injectable()
export class ClanWarsQueueService {
  private readonly logger = new Logger(ClanWarsQueueService.name);

  constructor(
    @Optional()
    @Inject(CLAN_WARS_QUEUE_TOKEN)
    private readonly clanWarsQueue?: Queue,
  ) {}

  async dispatchMatchResolution(
    winnerUserId: string,
    loserUserId: string,
    gameId: string,
  ): Promise<boolean> {
    if (!this.clanWarsQueue) {
      return false;
    }
    try {
      await this.clanWarsQueue.add(
        'resolve_match',
        {
          type: 'resolve_match',
          payload: { winnerUserId, loserUserId, gameId },
        },
        {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `Failed to enqueue clan war match resolution: ${(err as Error).message}`,
      );
      return false;
    }
  }

  async dispatchExpirationCheck(): Promise<boolean> {
    if (!this.clanWarsQueue) {
      return false;
    }
    try {
      await this.clanWarsQueue.add(
        'expire_wars',
        {
          type: 'expire_wars',
          payload: {},
        },
        {
          removeOnComplete: 50,
          removeOnFail: 50,
        },
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `Failed to enqueue clan war expiration check: ${(err as Error).message}`,
      );
      return false;
    }
  }

  async dispatchMatchmaking(
    requesterUserId: string,
    clanId: string,
    preferredGameId?: string,
  ): Promise<boolean> {
    if (!this.clanWarsQueue) {
      return false;
    }
    try {
      await this.clanWarsQueue.add(
        'matchmake',
        {
          type: 'matchmake',
          payload: { requesterUserId, clanId, preferredGameId },
        },
        {
          removeOnComplete: 50,
          removeOnFail: 50,
          attempts: 2,
        },
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `Failed to enqueue clan war matchmaking: ${(err as Error).message}`,
      );
      return false;
    }
  }

  async setupRepeatableExpirationJob(): Promise<void> {
    if (!this.clanWarsQueue) {
      return;
    }
    try {
      await this.clanWarsQueue.upsertJobScheduler(
        'repeatable-clan-wars-expiration',
        { pattern: '*/15 * * * *' },
        {
          name: 'expire_wars',
          data: {
            type: 'expire_wars',
            payload: {},
          },
        },
      );
    } catch (err) {
      const message = (err as Error).message;
      if (
        message.includes('ECONNREFUSED') ||
        message.includes('Connection is closed')
      ) {
        this.logger.debug(
          `Skipped repeatable clan war expiration setup: ${message}`,
        );
        return;
      }
      this.logger.warn(
        `Failed to setup repeatable clan war expiration: ${message}`,
      );
    }
  }
}
