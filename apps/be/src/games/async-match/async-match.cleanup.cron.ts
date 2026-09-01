import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AsyncMatchService } from './async-match.service';

@Injectable()
export class AsyncMatchCleanupCron {
  private readonly logger = new Logger(AsyncMatchCleanupCron.name);

  constructor(private readonly asyncMatchService: AsyncMatchService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredMatchesSweep(): Promise<void> {
    try {
      const forfeitedCount = await this.asyncMatchService.sweepExpiredMatches();
      if (forfeitedCount > 0) {
        this.logger.log(
          `Swept and auto-forfeited ${forfeitedCount} expired async match(es).`,
        );
      }
    } catch (err: unknown) {
      this.logger.warn(
        `Async match expired sweep cron error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
