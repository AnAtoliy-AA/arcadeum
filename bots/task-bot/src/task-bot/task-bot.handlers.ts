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

export {
  handleTask,
  handleListTasks,
  handleImplement,
  handleFix,
  handleQueueStatus,
  handleStatus,
  handlePrefs,
  handleShorts,
  handleVersion,
} from './task-bot.commands';

export async function handleTaskMessage(
  service: any,
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text;
  if (!text) return;

  const hasArc = /ARC-\d+/i.test(text);
  const hasDashLines = /^[-*]\s/.test(text.split('\n')[1] ?? '');

  if (hasArc && hasDashLines) {
    try {
      const hasEngine = /--engine[=:](\S+)/i.test(text);
      const task = doParseTask(
        text,
        !hasEngine,
        ctx.from?.id,
        service.prefsService,
        service.roadmapService,
      );
      await createAndTriggerTask(service, task, ctx);
    } catch (err) {
      await ctx.reply((err as Error).message);
    }
  }
}

export async function handleCallbackQuery(
  service: any,
  ctx: Context,
): Promise<void> {
  const { handleCallbackQuery: doHandleCallbackQuery } = await import(
    './task-bot.callbacks'
  );
  await doHandleCallbackQuery(service, ctx);
}