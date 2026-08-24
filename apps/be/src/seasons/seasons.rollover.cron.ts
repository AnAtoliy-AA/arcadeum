import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeasonsService } from './seasons.service';

/**
 * Hourly season rollover guard. The rollover itself (archive ended seasons,
 * crown champions, create the new quarter's doc) is idempotent, so running
 * it every hour is safe and covers deployments that straddle a quarter end.
 */
@Injectable()
export class SeasonsRolloverCron {
  constructor(private readonly seasons: SeasonsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSeasonRollover(): Promise<void> {
    await this.seasons.rollOverIfNeeded();
  }
}
