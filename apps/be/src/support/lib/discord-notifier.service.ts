import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { escapeDiscordMarkdown } from './sanitize';
import { isE2EMode } from './e2e-mode';

export type DiscordNotifyInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type DiscordNotifyResult =
  | { status: 'sent' }
  | { status: 'unconfigured' }
  | { status: 'failed'; error: string };

const TRUNCATE_FIELD = 1024;
const TRUNCATE_DESC = 2000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

@Injectable()
export class DiscordNotifierService {
  private readonly logger = new Logger(DiscordNotifierService.name);
  private readonly webhookUrl: string | undefined;

  constructor(config: ConfigService) {
    this.webhookUrl = config.get<string>('DISCORD_SUPPORT_WEBHOOK_URL');
  }

  async notify(input: DiscordNotifyInput): Promise<DiscordNotifyResult> {
    if (isE2EMode()) {
      this.logger.debug('E2E mode — skipping real Discord webhook');
      return { status: 'unconfigured' };
    }
    if (!this.webhookUrl) {
      this.logger.warn(
        'Discord webhook not configured — skipping channel ping',
      );
      return { status: 'unconfigured' };
    }

    const safeName = escapeDiscordMarkdown(input.name);
    const safeEmail = escapeDiscordMarkdown(input.email);
    const safeSubject = escapeDiscordMarkdown(input.subject);
    const safeMessage = truncate(input.message, TRUNCATE_DESC);

    const payload = {
      embeds: [
        {
          title: truncate(`📨 ${safeSubject}`, 256),
          // Code block disables markdown rendering inside.
          description: '```\n' + safeMessage.replace(/```/g, "'''") + '\n```',
          color: 0x5865f2,
          fields: [
            {
              name: 'From',
              value: truncate(safeName, TRUNCATE_FIELD),
              inline: true,
            },
            {
              name: 'Email',
              value: truncate(safeEmail, TRUNCATE_FIELD),
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const res = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const err = `Discord ${res.status}: ${body.slice(0, 200)}`;
        this.logger.error(err);
        return { status: 'failed', error: err };
      }
      return { status: 'sent' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      this.logger.error(`Discord webhook failed: ${message}`);
      return { status: 'failed', error: message };
    }
  }
}
