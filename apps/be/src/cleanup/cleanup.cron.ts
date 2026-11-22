import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';

@Injectable()
export class CleanupCron {
  private readonly logger = new Logger(CleanupCron.name);

  constructor(private readonly cleanup: CleanupService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDailyCleanup(): Promise<void> {
    try {
      this.logger.log('Starting daily cleanup...');
      const result = await this.cleanup.runCleanup();
      this.logger.log(
        `Daily cleanup complete: ${result.sessionsStateStripped} sessions stripped, ` +
          `${result.sessionsDeleted} sessions deleted, ` +
          `${result.roomsDeleted} rooms deleted, ` +
          `${result.messagesDeleted} messages deleted`,
      );
    } catch (err) {
      this.logger.error(`Daily cleanup failed: ${(err as Error).message}`);
    }
  }
}
