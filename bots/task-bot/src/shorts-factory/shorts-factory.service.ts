import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { InlineKeyboard, InputFile } from 'grammy';
import { TelegramService } from '../telegram/telegram.service';

export interface PendingVideo {
  id: string;
  videoPath: string;
  caption: string;
  scenario: string;
  status: 'pending' | 'approved' | 'regenerated' | 'posted' | 'failed';
  createdAt: string;
  messageId?: number;
  result?: {
    success: boolean;
    message: string;
    platforms?: string[];
  };
}

@Injectable()
export class ShortsFactoryService {
  private readonly logger = new Logger(ShortsFactoryService.name);
  private adminChatId: string;
  private readonly pendingDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {
    this.adminChatId =
      this.config.get<string>('SHORTS_FACTORY_ADMIN_CHAT_ID') ??
      this.config.get<string>('TELEGRAM_DM_CHAT_ID') ??
      '';
    this.pendingDir =
      this.config.get<string>('SHORTS_FACTORY_PENDING_DIR') ??
      '/opt/arcadeum/pending';
  }

  getPendingDir(): string {
    return this.pendingDir;
  }

  setAdminChatId(chatId: string) {
    if (chatId) {
      this.adminChatId = chatId;
    }
  }

  getAdminChatId(): string {
    return this.adminChatId;
  }

  async notifyAdmin(pending: PendingVideo): Promise<number | undefined> {
    const targetChatId = this.adminChatId;
    if (!targetChatId) {
      this.logger.warn(
        'SHORTS_FACTORY_ADMIN_CHAT_ID not set, skipping admin notification',
      );
      return undefined;
    }

    const keyboard = new InlineKeyboard()
      .text('✅ Confirm', `sf_confirm:${pending.id}`)
      .text('🔄 Regenerate', `sf_regenerate:${pending.id}`)
      .text('🎲 Other Scenario', `sf_regenerate_other:${pending.id}`);

    const message =
      `🎬 <b>New Short Ready for Review</b>\n\n` +
      `<b>Scenario:</b> ${pending.scenario}\n` +
      `<b>Caption:</b> ${pending.caption}\n` +
      `<b>Created:</b> ${new Date(pending.createdAt).toLocaleString()}\n\n` +
      `Video will be auto-posted in <b>3 hours</b> if no action taken.`;

    try {
      const bot = this.telegram.getBot();

      if (pending.videoPath && fs.existsSync(pending.videoPath)) {
        const result = await bot.api.sendVideo(
          targetChatId,
          new InputFile(pending.videoPath),
          {
            caption: message,
            parse_mode: 'HTML',
            reply_markup: keyboard,
          },
        );
        this.logger.log(`Sent video approval request for ${pending.id} to ${targetChatId}`);
        return result.message_id;
      }

      const result = await bot.api.sendMessage(targetChatId, message, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
      this.logger.log(`Sent approval request for video ${pending.id} to ${targetChatId}`);
      return result.message_id;
    } catch (err) {
      this.logger.error(`Failed to send admin notification: ${err}`);
      return undefined;
    }
  }

  async editMessageStatus(
    messageId: number,
    status: string,
    details?: string,
  ): Promise<void> {
    if (!this.adminChatId) return;

    const statusEmoji =
      status === 'approved'
        ? '✅'
        : status === 'regenerated'
          ? '🔄'
          : status === 'posted'
            ? '🚀'
            : status === 'failed'
              ? '❌'
              : '⏳';

    const text =
      `${statusEmoji} <b>Short ${status.charAt(0).toUpperCase() + status.slice(1)}</b>\n\n` +
      (details ?? '');

    try {
      const bot = this.telegram.getBot();
      await bot.api.editMessageText(this.adminChatId, messageId, text, {
        parse_mode: 'HTML',
      });
    } catch (err) {
      this.logger.error(`Failed to edit message: ${err}`);
    }
  }

  async sendResultMessage(result: {
    success: boolean;
    message: string;
    platforms?: string[];
  }): Promise<void> {
    if (!this.adminChatId) return;

    const platformList = result.platforms?.length
      ? '\n\n<b>Published to:</b>\n' +
        result.platforms.map((p) => `  ✅ ${p}`).join('\n')
      : '';

    const text =
      `${emoji} <b>Post ${result.success ? 'Succeeded' : 'Failed'}</b>\n\n` +
      `${result.message}` +
      platformList;

    try {
      const bot = this.telegram.getBot();
      await bot.api.sendMessage(this.adminChatId, text, {
        parse_mode: 'HTML',
      });
    } catch (err) {
      this.logger.error(`Failed to send result message: ${err}`);
    }
  }

  async handleCallbackQuery(
    action: string,
    videoId: string,
    callbackQueryId: string,
  ): Promise<void> {
    const bot = this.telegram.getBot();

    if (action === 'sf_confirm') {
      await bot.api.answerCallbackQuery(callbackQueryId, {
        text: '✅ Video approved for posting',
      });
    } else if (action === 'sf_regenerate') {
      await bot.api.answerCallbackQuery(callbackQueryId, {
        text: '🔄 Video will be regenerated',
      });
    }
  }
}
