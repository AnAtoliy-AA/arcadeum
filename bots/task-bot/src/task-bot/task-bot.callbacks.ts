import { Context } from 'grammy';
import { Bot } from 'grammy';

import { PendingRetry } from './task-bot.types';
import { GitHubService } from '../github/github.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { NotificationService } from '../notification/notification.service';

export async function handleCallbackQuery(
  service: {
    bot: Bot;
    githubService: GitHubService;
    queueService: ImplementQueueService;
    notificationService: NotificationService;
    logger: any;
    pendingTasks: Map<string, { text: string; userId: number }>;
    pendingRetries: Map<string, PendingRetry>;
    autoContinueTimers: Map<string, NodeJS.Timeout>;
    prefsService: import('../preferences/preferences.service').PreferencesService;
  },
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
    const { parseTask } = await import('./task-bot.parsing');
    task = parseTask(textWithEngine, true, pending.userId);
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

async function queueImplementation(
  service: {
    githubService: GitHubService;
    queueService: ImplementQueueService;
    logger: any;
  },
  issueNum: string,
  engine: 'opencode' | 'mimo',
  ctx: Context,
): Promise<void> {
  const chatId = ctx.chat?.id ?? 0;
  const userId = ctx.from?.id ?? 0;

  try {
    const issue = service.githubService.viewIssue(issueNum);
    if (!issue) {
      await ctx.reply(`Issue #${issueNum} not found.`);
      return;
    }
    if (issue.state !== 'OPEN') {
      await ctx.reply(`Issue #${issueNum} is ${issue.state.toLowerCase()}.`);
      return;
    }

    const jobId = await service.queueService.addJob(
      issueNum,
      engine,
      chatId,
      userId,
      {
        issueTitle: issue.title,
        issueBody: issue.body,
        issueLabels: issue.labels,
      },
    );

    await ctx.reply(
      `Queued implementation #${issueNum} with ${engine}.\nJob ID: ${jobId}\n\nWorkers will process it shortly.`,
      { parse_mode: 'Markdown' },
    );
  } catch (err) {
    service.logger.error(`Failed to queue job: ${err}`);
    await ctx.reply('Failed to queue implementation. Try again later.');
  }
}