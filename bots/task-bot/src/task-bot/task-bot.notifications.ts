import { Context } from 'grammy';
import { Bot } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { access } from 'fs/promises';

import { NotificationService, JobNotification } from '../notification/notification.service';
import type { PendingRetry, Engine } from './task-bot.types';

export function handleNotification(
  service: {
    bot: Bot;
    config: ConfigService;
    githubService: any;
    queueService: any;
    logger: Logger;
    notificationService: NotificationService;
    pendingRetries: Map<string, PendingRetry>;
    autoContinueTimers: Map<string, NodeJS.Timeout>;
    scheduleAutoContinue: (retryKey: string, pending: PendingRetry, chatId: number) => void;
  },
  notification: JobNotification,
): void {
  const chatId = parseInt(service.config.get<string>('TELEGRAM_CHAT_ID') ?? '0', 10);
  if (!chatId) {
    service.logger.warn('No TELEGRAM_CHAT_ID configured, skipping notification');
    return;
  }

  let text: string;

  switch (notification.type) {
    case 'pr-opened':
      text = `*PR Opened*\n🔗 ${notification.prUrl}\nIssue #${notification.issueNum} implemented with ${notification.engine}`;
      break;

    case 'ci-failed':
      text = `*CI Failed* ❌\nPR #${notification.issueNum} — ${notification.failedChecks?.join(', ') ?? 'unknown'}\n🤖 Auto-fixing...`;
      break;

    case 'ci-fixed':
      text = notification.success
        ? `*CI Passed* ✅\n${notification.message}`
        : `*CI Fix Failed* ❌\n${notification.message}`;
      break;

    case 'timeout-prompt':
      text = `*AI Engine Timeout* ⏰\n${notification.message}`;
      break;

    case 'implement-failed':
      text = `*Implement Failed* ❌\n${notification.message}\nEngine: ${notification.engine}`;
      break;

    case 'fix-failed':
      text = `*Fix Failed* ❌\n${notification.message}\nEngine: ${notification.engine}`;
      break;

    case 'review-failed':
      text = `*Review Failed* ❌\n${notification.message}\nEngine: ${notification.engine}`;
      break;

    case 'task-completed':
      text = notification.success
        ? `*Task Completed* ✅\nIssue #${notification.issueNum} implemented with ${notification.engine}.\n${notification.message}`
        : `*Task Failed* ❌\nIssue #${notification.issueNum}: ${notification.message}`;
      break;

    default: {
      const status = notification.success ? '✅' : '❌';
      const title = notification.success ? 'Task Completed' : 'Task Failed';
      let message = notification.success
        ? `Issue #${notification.issueNum} implemented successfully with ${notification.engine}.`
        : `Issue #${notification.issueNum} failed: ${notification.message}`;
      if (notification.success && notification.message && notification.message !== 'success') {
        message += `\n${notification.message}`;
      }
      text = `*${title}*\n${status} ${message}`;
      break;
    }
  }

  if (text.length > 3900) {
    text = text.substring(0, 3900) + '...';
  }

  text = sanitizeMessage(text);

  if (notification.type === 'timeout-prompt') {
    const timeoutKey = `timeout:${notification.issueNum}`;
    sendTimeoutPrompt(service, chatId, text, timeoutKey);
    return;
  }

  const isFailed = notification.type?.includes('failed') || (!notification.success && notification.type !== 'ci-failed');

  if (isFailed && notification.jobType) {
    const retryKey = `${notification.jobType}:${notification.issueNum}`;
    const retryData: PendingRetry = {
      jobType: notification.jobType as 'implement' | 'fix' | 'ci-fix',
      targetNum: notification.issueNum,
      engine: notification.engine as Engine,
      chatId,
      worktreePath: notification.worktreePath,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    service.pendingRetries.set(retryKey, retryData);

    const hasWorktree = !!notification.worktreePath;
    const continueBtn = hasWorktree
      ? [{ text: `▶️ Continue ${notification.jobType}`, callback_data: `continue:${retryKey}` }]
      : [];
    const retryBtn = [{ text: `🔄 Retry ${notification.jobType}`, callback_data: `retry:${retryKey}` }];
    const cancelBtn = [{ text: `❌ Cancel`, callback_data: `cancel:${retryKey}` }];

    sendMessageWithButtons(service, chatId, text, [continueBtn, retryBtn, cancelBtn])
      .then(() => {
        service.logger.log(`Notification sent with action buttons: ${notification.type} for #${notification.issueNum}`);
        service.scheduleAutoContinue(retryKey, retryData, chatId);
      })
      .catch(() => {
        // Failed silently, will be caught by caller
      });
    return;
  }

  service.bot.api.sendMessage(chatId, text, { parse_mode: 'Markdown' })
    .then(() => service.logger.log(`Notification sent: ${notification.type ?? 'default'} for #${notification.issueNum}`))
    .catch(() => {
      service.bot.api.sendMessage(chatId, text)
        .then(() => service.logger.log(`Notification sent (plain text): ${notification.type ?? 'default'} for #${notification.issueNum}`))
        .catch((err2) => service.logger.error(`Failed to send notification: ${err2}`));
    });
}

function sendTimeoutPrompt(
  service: { bot: Bot; logger: Logger },
  chatId: number,
  text: string,
  timeoutKey: string,
): void {
  service.bot.api.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '▶️ Continue', callback_data: `timeout-continue:${timeoutKey}` },
          { text: '❌ Abort', callback_data: `timeout-abort:${timeoutKey}` },
        ],
      ],
    },
  })
    .then(() => service.logger.log(`Timeout prompt sent for #${timeoutKey.replace('timeout:', '')}`))
    .catch((err) => {
      service.bot.api.sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '▶️ Continue', callback_data: `timeout-continue:${timeoutKey}` },
              { text: '❌ Abort', callback_data: `timeout-abort:${timeoutKey}` },
            ],
          ],
        },
      })
        .then(() => service.logger.log(`Timeout prompt sent (plain text) for #${timeoutKey.replace('timeout:', '')}`))
        .catch((err2) => service.logger.error(`Failed to send timeout prompt: ${err2}`));
    });
}

function sendMessageWithButtons(
  service: { bot: Bot; logger: Logger },
  chatId: number,
  text: string,
  buttonRows: Array<Array<{ text: string; callback_data: string }>>,
): Promise<void> {
  return service.bot.api.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: buttonRows.filter((r) => r.length > 0),
    },
  }).then(() => {}).catch(() => {
    return service.bot.api.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: buttonRows.filter((r) => r.length > 0),
      },
    }).then(() => {});
  });
}

export function sanitizeMessage(text: string): string {
  return text
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\[[\d;]*m/g, '')
    .replace(/`([^`]*?)`/g, '«$1»')
    .replace(/[*_~\[\]()]/g, '')
    .slice(0, 3900);
}

export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function checkWorktreeExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function scheduleAutoContinue(
  service: {
    pendingRetries: Map<string, PendingRetry>;
    autoContinueTimers: Map<string, NodeJS.Timeout>;
    githubService: any;
    queueService: any;
    bot: Bot;
    logger: Logger;
    checkWorktreeExists: (path: string) => Promise<boolean>;
  },
  retryKey: string,
  pending: PendingRetry,
  chatId: number,
): void {
  const AUTO_CONTINUE_MS = 3 * 60 * 1000;
  const MAX_AUTO_RETRIES = 3;

  const timer = setTimeout(async () => {
    service.autoContinueTimers.delete(retryKey);
    const current = service.pendingRetries.get(retryKey);
    if (!current) return;

    service.pendingRetries.delete(retryKey);
    service.logger.log(`Auto-continuing ${current.jobType} for #${current.targetNum}`);

    try {
      if (current.jobType === 'fix' || current.jobType === 'ci-fix') {
        const pr = service.githubService.viewPr(current.targetNum);
        if (!pr) return;

        const failedChecks = service.githubService.getPrChecks(current.targetNum).filter(
          (c: any) => c.state === 'FAILURE' || c.state === 'failure',
        );
        const reviews = service.githubService.getPrReviews(current.targetNum);
        const reviewComments = reviews
          .filter((r: any) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
          .map((r: any) => r.body)
          .join('\n---\n');

        const worktreeExists = current.worktreePath
          ? await service.checkWorktreeExists(current.worktreePath)
          : false;

        const jobId = await service.queueService.addFixJob(
          current.targetNum,
          current.engine,
          current.chatId,
          0,
          {
            issueNum: current.targetNum,
            prBranchName: pr.headRefName,
            prFailedChecks: failedChecks.length > 0 ? failedChecks : undefined,
            prReviewComments: reviewComments || undefined,
            existingWorktree: worktreeExists ? current.worktreePath : undefined,
          },
        );

        const label = worktreeExists ? 'Continuing' : 'Retrying';
        const retryCount = (current.retryCount ?? 0) + 1;
        await service.bot.api.sendMessage(chatId,
          `⏰ Auto-${label.toLowerCase()} ${current.jobType} for PR #${current.targetNum} (${current.engine}).\nJob ID: ${jobId}\nAttempt ${retryCount}/${MAX_AUTO_RETRIES}`,
        );

        if (retryCount < MAX_AUTO_RETRIES) {
          const nextKey = `${current.jobType}:${current.targetNum}:retry:${retryCount}`;
          const nextPending: PendingRetry = {
            ...current,
            worktreePath: worktreeExists ? current.worktreePath : undefined,
            retryCount,
            expiresAt: Date.now() + 5 * 60 * 1000,
          };
          service.pendingRetries.set(nextKey, nextPending);
          scheduleAutoContinue(service, nextKey, nextPending, chatId);
        }
      }
    } catch (err) {
      service.logger.error(`Auto-continue failed: ${err}`);
    }
  }, AUTO_CONTINUE_MS);

  service.autoContinueTimers.set(retryKey, timer);
}