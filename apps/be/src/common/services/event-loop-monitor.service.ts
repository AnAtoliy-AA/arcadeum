import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

@Injectable()
export class EventLoopMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventLoopMonitorService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastTick = Date.now();
  private readonly checkIntervalMs = 1000;
  private readonly maxLagMs = 8000;

  onModuleInit(): void {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    this.lastTick = Date.now();
    this.timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastTick;
      this.lastTick = now;

      const lag = elapsed - this.checkIntervalMs;
      if (lag > this.maxLagMs) {
        this.logger.error(
          `CRITICAL: Event loop blocked for ${lag}ms (threshold ${this.maxLagMs}ms). Restarting worker to protect cluster availability.`,
        );
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      } else if (lag > 2000) {
        this.logger.warn(`Event loop lag detected: ${lag}ms`);
      }
    }, this.checkIntervalMs);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
