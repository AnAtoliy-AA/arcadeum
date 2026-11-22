import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeaBattleBlitzService } from './sea-battle-blitz.service';

@Injectable()
export class SeaBattleBlitzCron {
  private readonly logger = new Logger(SeaBattleBlitzCron.name);

  constructor(private readonly blitzService: SeaBattleBlitzService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    try {
      await this.blitzService.ensureUpcomingBlitzCup();
      await this.blitzService.startBlitzCupIfDue();
    } catch (err) {
      this.logger.warn(`Sea Battle blitz cron error: ${String(err)}`);
    }
  }
}
