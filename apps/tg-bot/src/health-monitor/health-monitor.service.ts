import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../telegram/telegram.service';

const CHECK_INTERVAL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class HealthMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthMonitorService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private isFirstCheck = true;
  private isUp = true;
  private beUrl = '';
  private discordWebhook = '';

  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {}

  onModuleInit() {
    this.beUrl = this.config.get<string>('BE_URL') ?? '';
    this.discordWebhook = this.config.get<string>('DISCORD_WEBHOOK_URL') ?? '';

    if (!this.beUrl) {
      this.logger.warn('BE_URL not set, health monitoring disabled');
      return;
    }

    this.timer = setInterval(() => void this.check(), CHECK_INTERVAL_MS);
    void this.check();
    this.logger.log(
      `Health monitor started — pinging ${this.beUrl}/health every 10m`,
    );
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async check(): Promise<void> {
    let up = false;

    try {
      const resp = await fetch(`${this.beUrl}/health`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data: unknown = await resp.json();
      up = resp.ok && typeof data === 'object' && data !== null && 'ok' in data && (data as { ok: boolean }).ok === true;
    } catch (err) {
      this.logger.warn(`Health check failed: ${err}`);
    }

    if (this.isFirstCheck) {
      this.isFirstCheck = false;
      if (up) {
        this.isUp = true;
        this.logger.log('Backend is online');
        await this.notify('✅ Backend is online and responding');
      } else {
        this.isUp = false;
        this.logger.error('Backend is DOWN on first check');
        await this.notify('🔴 Backend is DOWN — not responding to health checks');
      }
      return;
    }

    if (up && !this.isUp) {
      this.isUp = true;
      this.logger.log('Backend recovered');
      await this.notify('✅ Backend is back online and responding');
    } else if (!up && this.isUp) {
      this.isUp = false;
      this.logger.error('Backend is DOWN');
      await this.notify('🔴 Backend is DOWN — not responding to health checks');
    }
  }

  private async notify(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const full = `${message}\n<code>${timestamp}</code>`;

    try {
      await this.telegram.sendAlert(full);
    } catch (err) {
      this.logger.error(`Failed to send Telegram alert: ${err}`);
    }

    if (this.discordWebhook) {
      try {
        const resp = await fetch(this.discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `${message}\n${timestamp}` }),
        });
        if (!resp.ok) {
          this.logger.error(`Discord alert failed: ${resp.statusText}`);
        }
      } catch (err) {
        this.logger.error(`Failed to send Discord alert: ${err}`);
      }
    }
  }
}
