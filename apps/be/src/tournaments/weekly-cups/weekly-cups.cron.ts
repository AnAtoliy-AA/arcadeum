import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WeeklyCupsService } from './weekly-cups.service';
import { WEEKLY_CUP_GAMES } from './weekly-cups.config';

@Injectable()
export class WeeklyCupsCron {
  private readonly logger = new Logger(WeeklyCupsCron.name);

  constructor(private readonly cups: WeeklyCupsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    // One game failing must not block the others.
    for (const game of WEEKLY_CUP_GAMES) {
      try {
        await this.cups.ensureUpcomingCup(game);
        await this.cups.startCupIfDue(game);
      } catch (err) {
        this.logger.warn(`Weekly cup cron error for ${game}: ${String(err)}`);
      }
    }
  }
}
