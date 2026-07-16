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

    this.notificationService.onNotification((notification) => {
      this.handleNotification(notification);
    });

    await this.bot.start({
      onStart: () => this.logger.log('Bot polling started'),
    });

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
      : 'opencode';
    const engineMatch = cleaned.match(/--engine=(mimo|opencode)/i);
    if (engineMatch) {
      engine = engineMatch[1].toLowerCase() as Engine;
      cleaned = cleaned.replace(/--engine=\S+/i, '').trim();
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

    const requirements = lines
      .slice(1)
      .filter((l) => /^[-*]\s/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, ''));

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
      const jobId = await this.queueService.addJob(
        issueNum,
        engine,
        chatId,
        userId,
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
        'Usage:\n/task Chess Engine\n/task high Add emotes to games\n\nOptional flags:\n--engine=mimo (default: opencode)\n--high / --urgent / --low\nScope: backend, web, mobile, game',
      );
      return;
    }
    const task = this.parseTask(text, true, ctx.from?.id);
    await this.createAndTriggerTask(task, ctx);
  }

  private async handleCallbackQuery(ctx: Context) {
    const data = ctx.callbackQuery?.data;
    if (!data?.startsWith('engine:')) return;

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
    const task = this.parseTask(textWithEngine, true, pending.userId);

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
      const hasEngine = /--engine=(mimo|opencode)/i.test(text);
      const task = this.parseTask(text, !hasEngine, ctx.from?.id);
      await this.createAndTriggerTask(task, ctx);
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
      await ctx.reply('Usage: /implement #12 --engine=mimo');
      return;
    }

    let engine: Engine = this.prefsService.getEngine(ctx.from?.id ?? 0);
    const engineMatch = text.match(/--engine=(mimo|opencode)/i);
    if (engineMatch) {
      engine = engineMatch[1].toLowerCase() as Engine;
    }

    await this.queueImplementation(issueNum, engine, ctx);
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
        `Engine: *${current?.engine ?? 'opencode'}*\n` +
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

    const status = notification.success ? '✅' : '❌';
    const title = notification.success ? 'Task Completed' : 'Task Failed';
    let message = notification.success
      ? `Issue #${notification.issueNum} implemented successfully with ${notification.engine}.`
      : `Issue #${notification.issueNum} failed: ${notification.message}`;

    // Truncate message if too long (Telegram limit is 4096 chars)
    if (message.length > 3900) {
      message = message.substring(0, 3900) + '...';
    }

    try {
      await this.bot.api.sendMessage(
        chatId,
        `*${title}*\n${status} ${message}`,
        { parse_mode: 'Markdown' },
      );
      this.logger.log(`Notification sent for issue #${notification.issueNum}`);
    } catch (err) {
      this.logger.error(`Failed to send notification: ${err}`);
    }
  }
}
