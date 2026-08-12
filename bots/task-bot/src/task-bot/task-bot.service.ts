import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context } from 'grammy';
import { TelegramService } from '../telegram/telegram.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import { PreferencesService } from '../preferences/preferences.service';
import { GitHubService } from '../github/github.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { NotificationService, JobNotification } from '../notification/notification.service';
import { Bot } from 'grammy';

import { SCOPE_KEYWORDS, type ParsedTask, type PendingRetry, type Engine, type Priority } from './task-bot.types';
import { ShortsFactoryService } from '../shorts-factory/shorts-factory.service';
import {
  handleTask,
  handleListTasks,
  handleImplement,
  handleFix,
  handleQueueStatus,
  handleStatus,
  handlePrefs,
  handleShorts,
  handleTaskMessage,
  handleCallbackQuery,
} from './task-bot.handlers';
import { handleNotification, checkWorktreeExists, scheduleAutoContinue } from './task-bot.notifications';
import { parseTask, createAndTriggerTask, queueImplementation } from './task-bot.parsing';

@Injectable()
export class TaskBotService implements OnApplicationBootstrap {
  readonly logger = new Logger(TaskBotService.name);
  private readonly allowedUserIds: Set<number>;
  readonly pendingTasks = new Map<string, { text: string; userId: number }>();
  readonly pendingRetries = new Map<string, PendingRetry>();
  readonly autoContinueTimers = new Map<string, NodeJS.Timeout>();
  bot!: Bot;

  constructor(
    readonly config: ConfigService,
    private readonly telegramService: TelegramService,
    readonly roadmapService: RoadmapService,
    readonly prefsService: PreferencesService,
    readonly githubService: GitHubService,
    readonly queueService: ImplementQueueService,
    readonly notificationService: NotificationService,
    readonly shortsFactoryService: ShortsFactoryService,
  ) {
    const raw = this.config.get<string>('TELEGRAM_ALLOWED_USERS') ?? '';
    this.allowedUserIds = new Set(
      raw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)),
    );
  }

  async onApplicationBootstrap() {
    this.bot = this.telegramService.getBot();

    await this.bot.api.setMyCommands([
      { command: 'task', description: 'Create a task (ARC auto-assigned)' },
      { command: 'tasks', description: 'List open tasks' },
      { command: 'implement', description: 'Implement an issue' },
      { command: 'fix', description: 'Fix CI failures + review feedback on a PR' },
      { command: 'status', description: 'Check implementation status' },
      { command: 'queue', description: 'Check worker queue status' },
      { command: 'prefs', description: 'Set preferences' },
      { command: 'shorts', description: 'Trigger Shorts factory video post' },
      { command: 'help', description: 'Show available commands' },
    ]);

    this.bot.command('shorts', (ctx: Context) => {
      if (!this.isAllowed(ctx)) return;
      void this.handleShorts(ctx);
    });

    this.notificationService.onNotification((notification: JobNotification) => {
      this.handleNotification(notification);
    });

    this.bot.start({
      onStart: () => this.logger.log('Bot polling started'),
    }).catch((err) => this.logger.error(`Bot start failed: ${err}`));

    this.logger.log(
      `Task bot ready. Allowed users: ${this.allowedUserIds.size === 0 ? 'anyone (set TELEGRAM_ALLOWED_USERS)' : [...this.allowedUserIds].join(', ')}`,
    );
  }

  isAllowed(ctx: Context): boolean {
    if (this.allowedUserIds.size === 0) return true;
    const userId = ctx.from?.id;
    return userId !== undefined && this.allowedUserIds.has(userId);
  }

  // Delegated methods
  handleTask = (ctx: Context) => handleTask(this, ctx);
  handleListTasks = (ctx: Context) => handleListTasks(this, ctx);
  handleImplement = (ctx: Context) => handleImplement(this, ctx);
  handleFix = (ctx: Context) => handleFix(this, ctx);
  handleQueueStatus = (ctx: Context) => handleQueueStatus(this, ctx);
  handleStatus = (ctx: Context) => handleStatus(this, ctx);
  handlePrefs = (ctx: Context) => handlePrefs(this, ctx);
  handleShorts = (ctx: Context) => handleShorts(this, ctx);
  handleTaskMessage = (ctx: Context) => handleTaskMessage(this, ctx);
  handleCallbackQuery = (ctx: Context) => handleCallbackQuery(this, ctx);

  parseTask = (text: string, autoArc: boolean, userId?: number): ParsedTask =>
    parseTask(text, autoArc, userId, this.prefsService);

  createAndTriggerTask = (task: ParsedTask, ctx: Context) => createAndTriggerTask(this, task, ctx);

  queueImplementation = (issueNum: string, engine: Engine, ctx: Context) => queueImplementation(this, issueNum, engine, ctx);

  handleNotification = (notification: JobNotification) =>
    handleNotification(
      {
        bot: this.bot,
        config: this.config,
        githubService: this.githubService,
        queueService: this.queueService,
        logger: this.logger,
        notificationService: this.notificationService,
        pendingRetries: this.pendingRetries,
        autoContinueTimers: this.autoContinueTimers,
        scheduleAutoContinue: (key, pending, chatId) =>
          scheduleAutoContinue(
            {
              pendingRetries: this.pendingRetries,
              autoContinueTimers: this.autoContinueTimers,
              githubService: this.githubService,
              queueService: this.queueService,
              bot: this.bot,
              logger: this.logger,
              checkWorktreeExists,
            },
            key,
            pending,
            chatId,
          ),
      },
      notification,
    );

  checkWorktreeExists = checkWorktreeExists;
}