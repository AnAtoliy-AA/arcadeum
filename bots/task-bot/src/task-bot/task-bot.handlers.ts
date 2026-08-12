import { Context } from 'grammy';

import { GitHubService } from '../github/github.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { PreferencesService } from '../preferences/preferences.service';
import { NotificationService } from '../notification/notification.service';
import { RoadmapService } from '../roadmap/roadmap.service';

import { ParsedTask, PendingRetry, Engine } from './task-bot.types';
import {
  queueImplementation,
  createAndTriggerTask,
  parseTask as doParseTask,
} from './task-bot.parsing';

export { handleTask, handleListTasks, handleImplement, handleFix, handleQueueStatus, handleStatus, handlePrefs, handleShorts } from './task-bot.commands';

export async function handleTaskMessage(
  service: TaskBotService,
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text;
  if (!text) return;

  const hasArc = /ARC-\d+/i.test(text);
  const hasDashLines = /^[-*]\s/.test(text.split('\n')[1] ?? '');

  if (hasArc && hasDashLines) {
    try {
      const hasEngine = /--engine[=:](\S+)/i.test(text);
      const task = doParseTask(text, !hasEngine, ctx.from?.id, service.prefsService, service.roadmapService);
      await createAndTriggerTask(service, task, ctx);
    } catch (err) {
      await ctx.reply((err as Error).message);
    }
  }
}

export async function handleCallbackQuery(
  service: TaskBotService,
  ctx: Context,
): Promise<void> {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  if (data.startsWith('continue:') || data.startsWith('retry:') || data.startsWith('cancel:')) {
    const action = data.split(':')[0] as 'continue' | 'retry' | 'cancel';
    const retryKey = data.slice(data.indexOf(':') + 1);
    const pending = service.pendingRetries.get(retryKey);

    if (!pending) {
      await ctx.answerCallbackQuery('Expired. Send the command again.');
      return;
    }

    if (Date.now() > pending.expiresAt) {
      service.pendingRetries.delete(retryKey);
      await ctx.answerCallbackQuery('Expired. Send the command again.');
      return;
    }

    service.pendingRetries.delete(retryKey);
    const existingTimer = service.autoContinueTimers.get(retryKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      service.autoContinueTimers.delete(retryKey);
    }
    await ctx.answerCallbackQuery();

    if (action === 'cancel') {
      await ctx.reply('Cancelled.');
      return;
    }

    const useExistingWorktree = action === 'continue' && pending.worktreePath;

    try {
      if (pending.jobType === 'fix' || pending.jobType === 'ci-fix') {
        const pr = service.githubService.viewPr(pending.targetNum);
        if (!pr) {
          await ctx.reply(`PR #${pending.targetNum} not found.`);
          return;
        }
        const failedChecks = service.githubService.getPrChecks(pending.targetNum).filter(
          (c) => c.state === 'FAILURE' || c.state === 'failure',
        );
        const reviews = service.githubService.getPrReviews(pending.targetNum);
        const reviewComments = reviews
          .filter((r) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
          .map((r) => r.body)
          .join('\n---\n');

        const jobId = await service.queueService.addFixJob(
          pending.targetNum,
          pending.engine,
          pending.chatId,
          0,
          {
            issueNum: pending.targetNum,
            prBranchName: pr.headRefName,
            prFailedChecks: failedChecks.length > 0 ? failedChecks : undefined,
            prReviewComments: reviewComments || undefined,
            existingWorktree: useExistingWorktree ? pending.worktreePath : undefined,
          },
        );
        const label = useExistingWorktree ? 'Continuing' : 'Retrying';
        await ctx.reply(
          `${label} ${pending.jobType} for PR #${pending.targetNum} with ${pending.engine}.\nJob ID: ${jobId}`,
        );
      } else {
        await queueImplementation(service, pending.targetNum, pending.engine, ctx);
      }
    } catch (err) {
      service.logger.error(`Failed to ${action}: ${err}`);
      await ctx.reply(`Failed to ${action}. Send the command again.`);
    }
    return;
  }

  if (data.startsWith('timeout-continue:') || data.startsWith('timeout-abort:')) {
    const action = data.startsWith('timeout-continue:') ? 'continue' : 'abort';
    const timeoutKey = data.slice(data.indexOf(':') + 1);
    const issueNum = timeoutKey.replace('timeout:', '');

    await ctx.answerCallbackQuery();

    await service.notificationService.publishTimeoutResponse({
      jobId: `timeout-${issueNum}`,
      action,
      timestamp: Date.now(),
    });

    if (action === 'abort') {
      await ctx.reply('Aborted.');
    } else {
      await ctx.reply('Continuing...');
    }
    return;
  }

  if (!data.startsWith('engine:')) return;

  const parts = data.split(':');
  if (parts.length !== 3) return;

  const [, taskId, engine] = parts;
  const pending = service.pendingTasks.get(taskId);

  if (!pending) {
    await ctx.answerCallbackQuery('Task expired. Please send again.');
    return;
  }
  if (ctx.from?.id !== pending.userId) {
    await ctx.answerCallbackQuery('Not your task.');
    return;
  }

  service.pendingTasks.delete(taskId);
  await ctx.answerCallbackQuery();

  const textWithEngine = `${pending.text} --engine=${engine}`;
  let task;
  try {
    task = doParseTask(textWithEngine, true, pending.userId, service.prefsService, service.roadmapService);
  } catch (err) {
    await ctx.reply((err as Error).message);
    return;
  }

  await ctx.editMessageText(`Creating issue for: *${task.title}*...`, {
    parse_mode: 'Markdown',
  });

  const url = service.githubService.createIssue({
    arc: task.arc,
    title: task.title,
    priority: task.priority,
    engine: task.engine,
    requirements: task.requirements,
    scope: task.scope,
  });

  if (url) {
    const issueNum = service.githubService.extractIssueNumber(url);
    if (issueNum) {
      await ctx.reply(`Issue created: ${url}`, { parse_mode: 'Markdown' });
      await queueImplementation(service, issueNum, task.engine, ctx);
    } else {
      await ctx.reply(
        `Issue created: ${url}\n\nCould not extract issue number.`,
        { parse_mode: 'Markdown' },
      );
    }
  } else {
    await ctx.reply('Failed to create issue. Check gh auth status.');
  }
}

export interface TaskBotService {
  bot: any;
  config: any;
  githubService: GitHubService;
  queueService: ImplementQueueService;
  prefsService: PreferencesService;
  roadmapService: RoadmapService;
  notificationService: NotificationService;
  logger: any;
  pendingTasks: Map<string, { text: string; userId: number }>;
  pendingRetries: Map<string, PendingRetry>;
  autoContinueTimers: Map<string, NodeJS.Timeout>;
  isAllowed: (ctx: Context) => boolean;
  parseTask: (text: string, autoArc: boolean, userId?: number) => ParsedTask;
}