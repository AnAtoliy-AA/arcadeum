import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../telegram/telegram.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import { PreferencesService } from '../preferences/preferences.service';
import { GitHubService } from '../github/github.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { NotificationService, JobNotification } from '../notification/notification.service';
import { Bot, type Context } from 'grammy';

type Engine = 'opencode' | 'mimo';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

interface ParsedTask {
  arc: string | null;
  title: string;
  requirements: string[];
  scope: string[];
  engine: Engine;
  priority: Priority;
}

interface PendingRetry {
  jobType: 'implement' | 'fix' | 'ci-fix';
  targetNum: string;
  engine: Engine;
  chatId: number;
  worktreePath?: string;
  retryCount?: number;
  jobData?: Record<string, unknown>;
  expiresAt: number;
}

const SCOPE_KEYWORDS: Record<string, string[]> = {
  backend: [
    'api',
    'server',
    'database',
    'auth',
    'endpoint',
    'service',
    'gateway',
    'socket',
    'websocket',
  ],
  web: [
    'page',
    'ui',
    'component',
    'button',
    'form',
    'modal',
    'dashboard',
    'layout',
    'css',
    'style',
  ],
  mobile: ['app', 'screen', 'ios', 'android', 'expo', 'react native'],
  game: ['game', 'engine', 'bot', 'ai', 'match', 'session', 'turn'],
};

@Injectable()
export class TaskBotService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskBotService.name);
  private readonly allowedUserIds: Set<number>;
  private readonly pendingTasks = new Map<
    string,
    { text: string; userId: number }
  >();
  private readonly pendingRetries = new Map<string, PendingRetry>();
  private readonly autoContinueTimers = new Map<string, NodeJS.Timeout>();
  private bot!: Bot;

  constructor(
    private readonly config: ConfigService,
    private readonly telegramService: TelegramService,
    private readonly roadmapService: RoadmapService,
    private readonly prefsService: PreferencesService,
    private readonly githubService: GitHubService,
    private readonly queueService: ImplementQueueService,
    private readonly notificationService: NotificationService,
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
    this.registerCommands();

    await this.bot.api.setMyCommands([
      { command: 'task', description: 'Create a task (ARC auto-assigned)' },
      { command: 'tasks', description: 'List open tasks' },
      { command: 'implement', description: 'Implement an issue' },
      { command: 'fix', description: 'Fix CI failures + review feedback on a PR' },
      { command: 'status', description: 'Check implementation status' },
      { command: 'queue', description: 'Check worker queue status' },
      { command: 'prefs', description: 'Set preferences' },
      { command: 'help', description: 'Show available commands' },
    ]);

    this.notificationService.onNotification((notification) => {
      this.handleNotification(notification);
    });

    this.bot.start({
      onStart: () => this.logger.log('Bot polling started'),
    }).catch((err) => this.logger.error(`Bot start failed: ${err}`));

    this.logger.log(
      `Task bot ready. Allowed users: ${this.allowedUserIds.size === 0 ? 'anyone (set TELEGRAM_ALLOWED_USERS)' : [...this.allowedUserIds].join(', ')}`,
    );
  }

  private isAllowed(ctx: Context): boolean {
    if (this.allowedUserIds.size === 0) return true;
    const userId = ctx.from?.id;
    return userId !== undefined && this.allowedUserIds.has(userId);
  }

  private registerCommands() {
    this.bot.command('start', (ctx) =>
      ctx.reply(
        'Task Bot is active.\n' +
          'Send a task with /task or as a message with ARC-XXX prefix.',
      ),
    );

    this.bot.command('help', (ctx) =>
      ctx.reply(
        'Available commands:\n' +
          '/task <title> - Create a task (ARC auto-assigned)\n' +
          '/tasks - List open tasks\n' +
          '/implement #12 - Implement an issue\n' +
          '/fix #12 - Fix CI failures + review feedback on a PR\n' +
          '/status #12 - Check implementation status\n' +
          '/queue - Check worker queue status\n' +
          '/prefs - Set preferences\n' +
          '/help - Show this message',
      ),
    );

    this.bot.command('task', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleTask(ctx);
    });
    this.bot.command('tasks', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleListTasks(ctx);
    });
    this.bot.command('implement', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleImplement(ctx);
    });
    this.bot.command('fix', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleFix(ctx);
    });
    this.bot.command('status', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleStatus(ctx);
    });
    this.bot.command('queue', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleQueueStatus(ctx);
    });
    this.bot.command('prefs', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handlePrefs(ctx);
    });

    this.bot.on('callback_query:data', (ctx) => {
      if (!this.isAllowed(ctx))
        return ctx.answerCallbackQuery('Access denied.');
      return this.handleCallbackQuery(ctx);
    });

    this.bot.on('message:text', (ctx) => {
      if (!this.isAllowed(ctx)) return;
      if (ctx.message.text.startsWith('/')) return;
      return this.handleTaskMessage(ctx);
    });
  }

  private detectScope(title: string): string[] {
    const lower = title.toLowerCase();
    const detected: string[] = [];
    for (const [scope, keywords] of Object.entries(SCOPE_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        detected.push(scope);
      }
    }
    return detected.length > 0 ? detected : ['web'];
  }

  private parseTask(
    text: string,
    autoArc = false,
    userId?: number,
  ): ParsedTask {
    let cleaned = text.trim();

    let engine: Engine = userId
      ? this.prefsService.getEngine(userId)
      : 'mimo';
    const engineMatch = cleaned.match(/--engine[=:](\S+)/i);
    if (engineMatch) {
      const requested = engineMatch[1].toLowerCase();
      if (requested !== 'mimo' && requested !== 'opencode') {
        throw new Error(`Invalid engine: ${requested}. Valid engines: mimo, opencode`);
      }
      engine = requested as Engine;
      cleaned = cleaned.replace(/--engine=\S+/i, '').trim();
    }

    let requirements: string[] = [];
    const reqMatch = cleaned.match(/--req\s+"([^"]+)"/i);
    if (reqMatch) {
      requirements = reqMatch[1]
        .split(/[,;]/)
        .map((r) => r.trim())
        .filter(Boolean);
      cleaned = cleaned.replace(/--req\s+"[^"]+"/i, '').trim();
    } else {
      const reqMatchSimple = cleaned.match(/--req\s+(\S.+)/i);
      if (reqMatchSimple) {
        requirements = reqMatchSimple[1]
          .split(/[,;]/)
          .map((r) => r.trim())
          .filter(Boolean);
        cleaned = cleaned.replace(/--req\s+.+/i, '').trim();
      }
    }

    let priority: Priority = 'normal';
    const prioMatch = cleaned.match(/--(low|normal|high|urgent)/i);
    if (prioMatch) {
      priority = prioMatch[1].toLowerCase() as Priority;
      cleaned = cleaned.replace(/--\S+/i, '').trim();
    } else {
      const prioWord = cleaned.match(/^(low|normal|high|urgent)\s+/i);
      if (prioWord) {
        priority = prioWord[1].toLowerCase() as Priority;
        cleaned = cleaned.replace(/^(low|normal|high|urgent)\s+/i, '').trim();
      }
    }

    const lines = cleaned
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const header = lines[0];

    const arcMatch = header.match(/ARC-(\d+)/i);
    let arc = arcMatch ? `ARC-${arcMatch[1]}` : null;

    const titleMatch = header.match(/ARC-\d+[:\s]+(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : header;

    if (autoArc && !arc) {
      const roadmapMatch = this.roadmapService.matchRoadmapItem(title);
      arc = roadmapMatch?.arc ?? this.roadmapService.getNextArcNumber();
    }

    if (requirements.length === 0) {
      requirements = lines
        .slice(1)
        .filter((l) => /^[-*]\s/.test(l))
        .map((l) => l.replace(/^[-*]\s+/, ''));
    }

    const scopeLine = lines.find((l) => /^scope:/i.test(l));
    let scope: string[];
    if (scopeLine) {
      scope = scopeLine
        .replace(/^scope:\s*/i, '')
        .split(',')
        .map((s) => s.trim().toLowerCase());
    } else if (userId) {
      scope = this.prefsService.getScope(userId);
    } else {
      scope = this.detectScope(title);
    }

    return { arc, title, requirements, scope, engine, priority };
  }

  private async queueImplementation(
    issueNum: string,
    engine: Engine,
    ctx: Context,
  ) {
    const chatId = ctx.chat?.id ?? 0;
    const userId = ctx.from?.id ?? 0;

    try {
      const issue = this.githubService.viewIssue(issueNum);
      if (!issue) {
        await ctx.reply(`Issue #${issueNum} not found.`);
        return;
      }
      if (issue.state !== 'OPEN') {
        await ctx.reply(`Issue #${issueNum} is ${issue.state.toLowerCase()}.`);
        return;
      }

      const jobId = await this.queueService.addJob(
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
      this.logger.error(`Failed to queue job: ${err}`);
      await ctx.reply('Failed to queue implementation. Try again later.');
    }
  }

  private async createAndTriggerTask(task: ParsedTask, ctx: Context) {
    const existing = this.githubService.findDuplicateIssue(task.title);
    if (existing) {
      await ctx.reply(
        `Issue already exists: #${existing.number} — ${existing.title} [${existing.state}]\n\nUse /implement #${existing.number} to trigger implementation.`,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    const prioBadge =
      task.priority !== 'normal' ? ` [${task.priority.toUpperCase()}]` : '';
    await ctx.reply(`Creating *${task.arc}: ${task.title}*${prioBadge}...`, {
      parse_mode: 'Markdown',
    });

    const url = this.githubService.createIssue({
      arc: task.arc,
      title: task.title,
      priority: task.priority,
      engine: task.engine,
      requirements: task.requirements,
      scope: task.scope,
    });

    if (url) {
      const issueNum = this.githubService.extractIssueNumber(url);
      if (issueNum) {
        await ctx.reply(`Issue created: ${url}`, { parse_mode: 'Markdown' });
        await this.queueImplementation(issueNum, task.engine, ctx);
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

  private async handleTask(ctx: Context) {
    const text = ctx.message?.text?.replace(/^\/task\s*/, '');
    if (!text) {
      await ctx.reply(
        'Usage:\n/task Chess Engine\n/task high Add emotes to games\n\nOptional flags:\n--engine=mimo (default: mimo)\n--high / --urgent / --low\n--req " requirement 1, requirement 2"\nScope: backend, web, mobile, game',
      );
      return;
    }
    try {
      const task = this.parseTask(text, true, ctx.from?.id);
      await this.createAndTriggerTask(task, ctx);
    } catch (err) {
      await ctx.reply((err as Error).message);
    }
  }

  private async handleCallbackQuery(ctx: Context) {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    if (data.startsWith('continue:') || data.startsWith('retry:') || data.startsWith('cancel:')) {
      const action = data.split(':')[0] as 'continue' | 'retry' | 'cancel';
      const retryKey = data.slice(data.indexOf(':') + 1);
      const pending = this.pendingRetries.get(retryKey);

      if (!pending) {
        await ctx.answerCallbackQuery('Expired. Send the command again.');
        return;
      }

      if (Date.now() > pending.expiresAt) {
        this.pendingRetries.delete(retryKey);
        await ctx.answerCallbackQuery('Expired. Send the command again.');
        return;
      }

      this.pendingRetries.delete(retryKey);
      const existingTimer = this.autoContinueTimers.get(retryKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.autoContinueTimers.delete(retryKey);
      }
      await ctx.answerCallbackQuery();

      if (action === 'cancel') {
        await ctx.reply('Cancelled.');
        return;
      }

      const useExistingWorktree = action === 'continue' && pending.worktreePath;

      try {
        if (pending.jobType === 'fix' || pending.jobType === 'ci-fix') {
          const pr = this.githubService.viewPr(pending.targetNum);
          if (!pr) {
            await ctx.reply(`PR #${pending.targetNum} not found.`);
            return;
          }
          const failedChecks = this.githubService.getPrChecks(pending.targetNum).filter(
            (c) => c.state === 'FAILURE' || c.state === 'failure',
          );
          const reviews = this.githubService.getPrReviews(pending.targetNum);
          const reviewComments = reviews
            .filter((r) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
            .map((r) => r.body)
            .join('\n---\n');

          const jobId = await this.queueService.addFixJob(
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
          await this.queueImplementation(pending.targetNum, pending.engine, ctx);
        }
      } catch (err) {
        this.logger.error(`Failed to ${action}: ${err}`);
        await ctx.reply(`Failed to ${action}. Send the command again.`);
      }
      return;
    }

    if (data.startsWith('timeout-continue:') || data.startsWith('timeout-abort:')) {
      const action = data.startsWith('timeout-continue:') ? 'continue' : 'abort';
      const timeoutKey = data.slice(data.indexOf(':') + 1);
      const issueNum = timeoutKey.replace('timeout:', '');

      await ctx.answerCallbackQuery();

      await this.notificationService.publishTimeoutResponse({
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
    const pending = this.pendingTasks.get(taskId);

    if (!pending) {
      await ctx.answerCallbackQuery('Task expired. Please send again.');
      return;
    }
    if (ctx.from?.id !== pending.userId) {
      await ctx.answerCallbackQuery('Not your task.');
      return;
    }

    this.pendingTasks.delete(taskId);
    await ctx.answerCallbackQuery();

    const textWithEngine = `${pending.text} --engine=${engine}`;
    let task;
    try {
      task = this.parseTask(textWithEngine, true, pending.userId);
    } catch (err) {
      await ctx.reply((err as Error).message);
      return;
    }

    await ctx.editMessageText(`Creating issue for: *${task.title}*...`, {
      parse_mode: 'Markdown',
    });

    const url = this.githubService.createIssue({
      arc: task.arc,
      title: task.title,
      priority: task.priority,
      engine: task.engine,
      requirements: task.requirements,
      scope: task.scope,
    });

    if (url) {
      const issueNum = this.githubService.extractIssueNumber(url);
      if (issueNum) {
        await ctx.reply(`Issue created: ${url}`, { parse_mode: 'Markdown' });
        await this.queueImplementation(issueNum, task.engine, ctx);
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

  private async handleTaskMessage(ctx: Context) {
    const text = ctx.message?.text;
    if (!text) return;

    const hasArc = /ARC-\d+/i.test(text);
    const hasDashLines = /^[-*]\s/.test(text.split('\n')[1] ?? '');

    if (hasArc && hasDashLines) {
      try {
        const hasEngine = /--engine[=:](\S+)/i.test(text);
        const task = this.parseTask(text, !hasEngine, ctx.from?.id);
        await this.createAndTriggerTask(task, ctx);
      } catch (err) {
        await ctx.reply((err as Error).message);
      }
    }
  }

  private async handleListTasks(ctx: Context) {
    const issues = this.githubService.listIssues('task', 20);
    if (issues.length === 0) {
      await ctx.reply('No open tasks.');
      return;
    }

    const lines: string[] = ['*Task Queue*\n'];
    for (const issue of issues) {
      const hasPr = issue.comments.some((c) => c.body.includes('PR:'));
      const isFailed = issue.comments.some((c) => c.body.includes('failed'));
      let status: string;
      if (issue.state === 'CLOSED') {
        status = '✅';
      } else if (isFailed) {
        status = '❌';
      } else if (hasPr) {
        status = '🔄';
      } else {
        status = '⏳';
      }
      const prioLabel = issue.labels.find((l) => l.name === 'priority');
      const prioBadge = prioLabel ? ' 🔴' : '';
      lines.push(`${status} #${issue.number} — ${issue.title}${prioBadge}`);
    }
    lines.push('\n_✅ done 🔄 PR open ❌ failed ⏳ pending_');
    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  }

  private async handleImplement(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const issueNum = text.match(/#?(\d+)/)?.[1];
    if (!issueNum) {
      await ctx.reply('Usage: /implement #12 --engine=mimo\n\nValid engines: mimo, opencode');
      return;
    }

    let engine: Engine = this.prefsService.getEngine(ctx.from?.id ?? 0);
    const engineMatch = text.match(/--engine[=:](\S+)/i);
    if (engineMatch) {
      const requested = engineMatch[1].toLowerCase();
      if (requested !== 'mimo' && requested !== 'opencode') {
        await ctx.reply(`Invalid engine: ${requested}\n\nValid engines: mimo, opencode\n\nExample: /implement #${issueNum} --engine=mimo`);
        return;
      }
      engine = requested as Engine;
    }

    await this.queueImplementation(issueNum, engine, ctx);
  }

  private async handleFix(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const prNum = text.match(/#?(\d+)/)?.[1];
    if (!prNum) {
      await ctx.reply('Usage: /fix #12 --engine=mimo\n\nFixes CI failures, review comments, and common issues on a PR.\nValid engines: mimo, opencode');
      return;
    }

    let engine: Engine = this.prefsService.getEngine(ctx.from?.id ?? 0);
    const engineMatch = text.match(/--engine[=:](\S+)/i);
    if (engineMatch) {
      const requested = engineMatch[1].toLowerCase();
      if (requested !== 'mimo' && requested !== 'opencode') {
        await ctx.reply(`Invalid engine: ${requested}\n\nValid engines: mimo, opencode\n\nExample: /fix #${prNum} --engine=mimo`);
        return;
      }
      engine = requested as Engine;
    }

    const chatId = ctx.chat?.id ?? 0;
    const userId = ctx.from?.id ?? 0;

    try {
      const pr = this.githubService.viewPr(prNum);
      if (!pr) {
        await ctx.reply(`PR #${prNum} not found.`);
        return;
      }

      const failedChecks = this.githubService.getPrChecks(prNum).filter(
        (c) => c.state === 'FAILURE' || c.state === 'failure',
      );

      const reviews = this.githubService.getPrReviews(prNum);
      const reviewComments = reviews
        .filter((r) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
        .map((r) => r.body)
        .join('\n---\n');

      const jobId = await this.queueService.addFixJob(prNum, engine, chatId, userId, {
        issueNum: prNum,
        prBranchName: pr.headRefName,
        prFailedChecks: failedChecks.length > 0 ? failedChecks : undefined,
        prReviewComments: reviewComments || undefined,
      });

      await ctx.reply(
        `Queued fix for PR #${prNum} with ${engine}.\nJob ID: ${jobId}\n\nWorker will process it shortly.`,
        { parse_mode: 'Markdown' },
      );
    } catch (err) {
      this.logger.error(`Failed to queue fix: ${err}`);
      await ctx.reply('Failed to queue fix. Try again later.');
    }
  }

  private async handleQueueStatus(ctx: Context) {
    try {
      const stats = await this.queueService.getQueueStats();
      const active = await this.queueService.getActiveJobs();

      const lines = ['*Worker Queue Status*\n'];
      lines.push(`Waiting: ${stats.waiting}`);
      lines.push(`Active: ${stats.active}`);
      lines.push(`Completed: ${stats.completed}`);
      lines.push(`Failed: ${stats.failed}`);

      if (active.length > 0) {
        lines.push('\n*Currently processing:*');
        for (const job of active) {
          lines.push(
            `• #${job.issueNum} with ${job.engine} (${job.progress}%)`,
          );
        }
      }

      await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply('Failed to get queue status. Is Redis running?');
    }
  }

  private async handleStatus(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const issueNum = text.match(/#?(\d+)/)?.[1];
    if (!issueNum) {
      await ctx.reply('Usage: /status #12');
      return;
    }

    const issue = this.githubService.viewIssue(issueNum);
    if (!issue) {
      await ctx.reply(`Issue #${issueNum} not found.`);
      return;
    }

    const prioLabel = issue.labels.find((l) => l.name === 'priority');
    const prioBadge = prioLabel ? ' 🔴' : '';

    const lines = [
      `*#${issueNum}: ${issue.title}*${prioBadge}`,
      `Status: ${issue.state}`,
    ];

    const lastComment = issue.comments[issue.comments.length - 1];
    if (lastComment) {
      const age = Date.now() - new Date(lastComment.createdAt).getTime();
      const mins = Math.floor(age / 60000);
      const ago =
        mins < 60
          ? `${mins}m ago`
          : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
      lines.push(`Last update: ${ago}`, `> ${lastComment.body.slice(0, 200)}`);
    }

    const prMatch = issue.body.match(/#(\d+)/);
    if (prMatch) {
      const pr = this.githubService.viewPr(prMatch[1]);
      if (pr) {
        const checks = pr.statusCheckRollup;
        const passed = checks.filter((c) => c.conclusion === 'success').length;
        const failed = checks.filter((c) => c.conclusion === 'failure').length;
        const pending = checks.filter((c) => c.conclusion === null).length;
        lines.push(
          `PR #${prMatch[1]}: ${pr.state} (${passed}/${checks.length} checks, ${failed} failed, ${pending} pending)`,
        );
      } else {
        lines.push(`PR #${prMatch[1]}: unknown status`);
      }
    }

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  }

  private async handlePrefs(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const userId = ctx.from?.id ?? 0;

    const setMatch = text.match(/\/prefs\s+(opencode|mimo)/i);
    if (setMatch) {
      const engine = setMatch[1].toLowerCase() as Engine;
      this.prefsService.setEngine(userId, engine);
      await ctx.reply(`Default engine set to *${engine}*`, {
        parse_mode: 'Markdown',
      });
      return;
    }

    const scopeMatch = text.match(/\/prefs\s+scope[:\s]+(.+)/i);
    if (scopeMatch) {
      const scope = scopeMatch[1].split(',').map((s) => s.trim().toLowerCase());
      this.prefsService.setScope(userId, scope);
      await ctx.reply(`Default scope set to *${scope.join(', ')}*`, {
        parse_mode: 'Markdown',
      });
      return;
    }

    const current = this.prefsService.getAll(userId);
    await ctx.reply(
      `Current preferences:\n` +
        `Engine: *${current?.engine ?? 'mimo'}*\n` +
        `Scope: *${current?.defaultScope?.join(', ') ?? 'web'}*\n\n` +
        `Usage:\n` +
        `/prefs opencode — set default engine\n` +
        `/prefs mimo — set default engine\n` +
        `/prefs scope: backend, web — set default scope`,
      { parse_mode: 'Markdown' },
    );
  }

  private async handleNotification(notification: JobNotification) {
    const chatId = parseInt(this.config.get<string>('TELEGRAM_CHAT_ID') ?? '0', 10);
    if (!chatId) {
      this.logger.warn('No TELEGRAM_CHAT_ID configured, skipping notification');
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

    text = this.sanitizeMessage(text);

    if (notification.type === 'timeout-prompt') {
      const timeoutKey = `timeout:${notification.issueNum}`;
      try {
        await this.bot.api.sendMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '▶️ Continue', callback_data: `timeout-continue:${timeoutKey}` },
                { text: '❌ Abort', callback_data: `timeout-abort:${timeoutKey}` },
              ],
            ],
          },
        });
        this.logger.log(`Timeout prompt sent for #${notification.issueNum}`);
      } catch {
        try {
          await this.bot.api.sendMessage(chatId, text, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '▶️ Continue', callback_data: `timeout-continue:${timeoutKey}` },
                  { text: '❌ Abort', callback_data: `timeout-abort:${timeoutKey}` },
                ],
              ],
            },
          });
          this.logger.log(`Timeout prompt sent (plain text) for #${notification.issueNum}`);
        } catch (err2) {
          this.logger.error(`Failed to send timeout prompt: ${err2}`);
        }
      }
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
      this.pendingRetries.set(retryKey, retryData);

      const hasWorktree = !!notification.worktreePath;
      const continueBtn = hasWorktree
        ? [{ text: `▶️ Continue ${notification.jobType}`, callback_data: `continue:${retryKey}` }]
        : [];
      const retryBtn = [{ text: `🔄 Retry ${notification.jobType}`, callback_data: `retry:${retryKey}` }];
      const cancelBtn = [{ text: `❌ Cancel`, callback_data: `cancel:${retryKey}` }];

      try {
        await this.bot.api.sendMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [continueBtn, retryBtn, cancelBtn].filter((r) => r.length > 0),
          },
        });
        this.logger.log(`Notification sent with action buttons: ${notification.type} for #${notification.issueNum}`);
        this.scheduleAutoContinue(retryKey, retryData, chatId);
        return;
      } catch (err) {
        try {
          await this.bot.api.sendMessage(chatId, text, {
            reply_markup: {
              inline_keyboard: [continueBtn, retryBtn, cancelBtn].filter((r) => r.length > 0),
            },
          });
          this.logger.log(`Notification sent (plain text) with action buttons: ${notification.type} for #${notification.issueNum}`);
          this.scheduleAutoContinue(retryKey, retryData, chatId);
          return;
        } catch (err2) {
          this.logger.error(`Failed to send notification: ${err2}`);
          return;
        }
      }
    }

    try {
      await this.bot.api.sendMessage(chatId, text, { parse_mode: 'Markdown' });
      this.logger.log(`Notification sent: ${notification.type ?? 'default'} for #${notification.issueNum}`);
    } catch (err) {
      try {
        await this.bot.api.sendMessage(chatId, text);
        this.logger.log(`Notification sent (plain text): ${notification.type ?? 'default'} for #${notification.issueNum}`);
      } catch (err2) {
        this.logger.error(`Failed to send notification: ${err2}`);
      }
    }
  }

  private sanitizeMessage(text: string): string {
    return text
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
      .replace(/\[[\d;]*m/g, '')
      .replace(/`([^`]*?)`/g, '«$1»')
      .replace(/[*_~\[\]()]/g, '')
      .slice(0, 3900);
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  }

  private scheduleAutoContinue(retryKey: string, pending: PendingRetry, chatId: number): void {
    const AUTO_CONTINUE_MS = 3 * 60 * 1000;
    const MAX_AUTO_RETRIES = 3;

    const timer = setTimeout(async () => {
      this.autoContinueTimers.delete(retryKey);
      const current = this.pendingRetries.get(retryKey);
      if (!current) return;

      this.pendingRetries.delete(retryKey);
      this.logger.log(`Auto-continuing ${current.jobType} for #${current.targetNum}`);

      try {
        if (current.jobType === 'fix' || current.jobType === 'ci-fix') {
          const pr = this.githubService.viewPr(current.targetNum);
          if (!pr) return;

          const failedChecks = this.githubService.getPrChecks(current.targetNum).filter(
            (c) => c.state === 'FAILURE' || c.state === 'failure',
          );
          const reviews = this.githubService.getPrReviews(current.targetNum);
          const reviewComments = reviews
            .filter((r) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
            .map((r) => r.body)
            .join('\n---\n');

          const worktreeExists = current.worktreePath
            ? await this.checkWorktreeExists(current.worktreePath)
            : false;

          const jobId = await this.queueService.addFixJob(
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
          await this.bot.api.sendMessage(chatId,
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
            this.pendingRetries.set(nextKey, nextPending);
            this.scheduleAutoContinue(nextKey, nextPending, chatId);
          }
        }
      } catch (err) {
        this.logger.error(`Auto-continue failed: ${err}`);
      }
    }, AUTO_CONTINUE_MS);

    this.autoContinueTimers.set(retryKey, timer);
  }

  private async checkWorktreeExists(path: string): Promise<boolean> {
    try {
      const { accessSync } = await import('fs');
      accessSync(path);
      return true;
    } catch {
      return false;
    }
  }
}
