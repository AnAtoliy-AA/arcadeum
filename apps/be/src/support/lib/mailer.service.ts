import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { stripNewlines } from './sanitize';

export type MailerSendInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type MailerSendResult =
  | { status: 'sent' }
  | { status: 'unconfigured' }
  | { status: 'failed'; error: string };

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter | null;
  private readonly to: string | undefined;
  private readonly from: string | undefined;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const portStr = config.get<string>('SMTP_PORT');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    this.to = config.get<string>('SUPPORT_EMAIL');
    this.from = config.get<string>('SMTP_FROM') ?? user;

    if (!host || !portStr || !user || !pass || !this.to || !this.from) {
      this.transporter = null;
      return;
    }

    this.transporter = createTransport({
      host,
      port: Number(portStr),
      secure: Number(portStr) === 465,
      auth: { user, pass },
    });
  }

  async send(input: MailerSendInput): Promise<MailerSendResult> {
    if (!this.transporter || !this.to || !this.from) {
      this.logger.warn('SMTP not configured — skipping email delivery');
      return { status: 'unconfigured' };
    }

    const safeName = stripNewlines(input.name);
    const safeSubject = stripNewlines(input.subject);
    const safeEmail = stripNewlines(input.email);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: this.to,
        replyTo: `${safeName} <${safeEmail}>`,
        subject: `[Contact] ${safeSubject}`,
        // Plain text only — no HTML rendering of user content.
        text: `From: ${safeName} <${safeEmail}>\n\n${input.message}`,
      });
      return { status: 'sent' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      this.logger.error(`Email send failed: ${message}`);
      return { status: 'failed', error: message };
    }
  }
}
