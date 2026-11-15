import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import type { Job } from 'bullmq';
import { ClanWarsAutomationService } from './clan-wars-automation.service';
import { ClanWarsQueueService } from './clan-wars-queue.service';

export interface ClanWarJobData {
  type: string;
  payload: Record<string, unknown>;
}

@Processor('clan-wars')
export class ClanWarsProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ClanWarsProcessor.name);
  private hasReportedOffline = false;

  constructor(
    private readonly clanWarsAutomationService: ClanWarsAutomationService,
    private readonly clanWarsQueueService: ClanWarsQueueService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    if (this.worker) {
      this.worker.on('error', (err: Error) => {
        if (
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('Connection is closed')
        ) {
          if (!this.hasReportedOffline) {
            this.hasReportedOffline = true;
            this.logger.debug(
              `BullMQ clan-wars worker offline: ${err.message}`,
            );
          }
          return;
        }
        this.logger.warn(`BullMQ clan-wars worker error: ${err.message}`);
      });
    }
    await this.clanWarsQueueService.setupRepeatableExpirationJob();
  }

  async process(job: Job<ClanWarJobData, unknown, string>): Promise<unknown> {
    this.logger.log(
      `Processing clan-wars job ${job.id} of type ${job.data.type}`,
    );
    switch (job.data.type) {
      case 'resolve_match': {
        const { winnerUserId, loserUserId, gameId } = job.data.payload as {
          winnerUserId: string;
          loserUserId: string;
          gameId: string;
        };
        const result =
          await this.clanWarsAutomationService.resolveMatchForPlayers(
            winnerUserId,
            loserUserId,
            gameId,
          );
        return { success: true, updatedWarId: result?.id ?? null };
      }
      case 'expire_wars': {
        const result =
          await this.clanWarsAutomationService.expirePendingAndActiveWars();
        return { success: true, ...result };
      }
      case 'matchmake': {
        const { requesterUserId, clanId, preferredGameId } = job.data
          .payload as {
          requesterUserId: string;
          clanId: string;
          preferredGameId?: string;
        };
        const result = await this.clanWarsAutomationService.matchmakeClanWar(
          requesterUserId,
          clanId,
          preferredGameId,
        );
        return { success: true, warId: result.id };
      }
      default:
        return { success: true, unhandled: true };
    }
  }
}
