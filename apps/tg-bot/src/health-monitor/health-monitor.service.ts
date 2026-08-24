import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';

const CHECK_INTERVAL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

interface DbHealth {
  ok: boolean;
  mongo: {
    oci: 'connected' | 'disconnected';
    atlas: 'connected' | 'disconnected' | 'not_configured';
  };
}

@Injectable()
export class HealthMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthMonitorService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private isFirstCheck = true;
  private isBeUp = true;
  private isOciUp = true;
  private isAtlasUp = true;
  private beUrl = '';
  private discordWebhook = '';
  private dmChatId = '';
  private bot!: Bot;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.beUrl = this.config.get<string>('BE_URL') ?? '';
    this.discordWebhook = this.config.get<string>('DISCORD_WEBHOOK_URL') ?? '';
    this.dmChatId = this.config.get<string>('TELEGRAM_DM_CHAT_ID') ?? '';

    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.bot = new Bot(token);
    }

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
    let beUp = false;
    let beFailureReason = '';
    let dbHealth: DbHealth | null = null;

    try {
      const resp = await fetch(`${this.beUrl}/health`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!resp.ok) {
        // Distinguish "server answered with an error" (rate limits, gateway
        // errors) from "no answer at all" — they have very different causes.
        beFailureReason = `HTTP ${resp.status} from /health`;
      } else {
        const data: unknown = await resp.json();
        beUp =
          typeof data === 'object' &&
          data !== null &&
          'ok' in data &&
          (data as { ok: boolean }).ok === true;
        if (!beUp) {
          beFailureReason = '/health responded without ok:true';
        }
      }
    } catch (err) {
      this.logger.warn(`Backend health check failed: ${err}`);
      beFailureReason = `no response (${err instanceof Error ? err.message : String(err)})`;
    }

    if (beUp) {
      try {
        const resp = await fetch(`${this.beUrl}/health/db`, {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (resp.ok) {
          dbHealth = (await resp.json()) as DbHealth;
        }
      } catch (err) {
        this.logger.warn(`DB health check failed: ${err}`);
      }
    }

    const ociUp = dbHealth?.mongo.oci === 'connected';
    const atlasUp =
      dbHealth?.mongo.atlas === 'connected' ||
      dbHealth?.mongo.atlas === 'not_configured';

    if (this.isFirstCheck) {
      this.isFirstCheck = false;
      this.isBeUp = beUp;
      this.isOciUp = ociUp;
      this.isAtlasUp = atlasUp;

      const messages: string[] = [];
      if (beUp) {
        messages.push('✅ Backend is online and responding');
      } else {
        messages.push(
          `🔴 Backend is DOWN — ${beFailureReason || 'not responding to health checks'}`,
        );
      }
      if (beUp) {
        messages.push(
          `OCI MongoDB: ${ociUp ? '✅ connected' : '🔴 disconnected'}`,
        );
        messages.push(
          `Atlas MongoDB: ${atlasUp ? '✅ connected' : dbHealth?.mongo.atlas === 'disconnected' ? '🟠 disconnected' : '⚪ not configured'}`,
        );
      }

      this.logger.log(messages.join(' | '));
      await this.notify(messages.join('\n'));
      return;
    }

    const alerts: string[] = [];

    if (beUp && !this.isBeUp) {
      alerts.push('✅ Backend is back online and responding');
    } else if (!beUp && this.isBeUp) {
      alerts.push(
        `🔴 Backend is DOWN — ${beFailureReason || 'not responding to health checks'}`,
      );
    }
    this.isBeUp = beUp;

    if (beUp) {
      if (ociUp && !this.isOciUp) {
        alerts.push('✅ OCI MongoDB is back online');
      } else if (!ociUp && this.isOciUp) {
        alerts.push(
          `🔴 OCI MongoDB is DOWN — backend running but database disconnected${dbHealth ? '' : ' (/health/db unreachable)'}`,
        );
      }
      this.isOciUp = ociUp;

      if (atlasUp && !this.isAtlasUp) {
        alerts.push('✅ Atlas MongoDB is back online');
      } else if (!atlasUp && this.isAtlasUp) {
        alerts.push(
          `🟠 Atlas MongoDB is DOWN — backend running but archive database disconnected${dbHealth ? '' : ' (/health/db unreachable)'}`,
        );
      }
      this.isAtlasUp = atlasUp;
    }

    if (alerts.length > 0) {
      this.logger.log(alerts.join(' | '));
      await this.notify(alerts.join('\n'));
    }
  }

  private async notify(message: string): Promise<void> {
    const timestamp = new Date().toISOString();

    if (this.dmChatId && this.bot) {
      try {
        await this.bot.api.sendMessage(
          this.dmChatId,
          `${message}\n<code>${timestamp}</code>`,
          {
            parse_mode: 'HTML',
          },
        );
      } catch (err) {
        this.logger.error(`Failed to send Telegram DM: ${err}`);
      }
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
