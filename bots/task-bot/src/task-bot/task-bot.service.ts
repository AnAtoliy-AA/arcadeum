import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { TelegramService } from '../telegram/telegram.service';
import { Bot, type Context, InlineKeyboard } from 'grammy';

type Engine = 'opencode' | 'mimo';

interface ParsedTask {
  arc: string | null;
  title: string;
  requirements: string[];
  scope: string[];
  engine: Engine;
}

@Injectable()
export class TaskBotService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskBotService.name);
  private readonly allowedUserIds: Set<number>;
  private readonly pendingTasks = new Map<string, { text: string; userId: number }>();
  private bot!: Bot;

  constructor(
    private readonly config: ConfigService,
    private readonly telegramService: TelegramService,
  ) {
    const raw = this.config.get<string>('TELEGRAM_ALLOWED_USERS') ?? '';
    this.allowedUserIds = new Set(
      raw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)),
    );
  }

  onApplicationBootstrap() {
    this.bot = this.telegramService.getBot();
    this.registerCommands();
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

    this.bot.on('callback_query:data', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.answerCallbackQuery('Access denied.');
      return this.handleCallbackQuery(ctx);
    });

    this.bot.on('message:text', (ctx) => {
      if (!this.isAllowed(ctx)) return;
      if (ctx.message.text.startsWith('/')) return;
      return this.handleTaskMessage(ctx);
    });
  }

  private parseTask(text: string): ParsedTask {
    let cleaned = text.trim();

    let engine: Engine = 'opencode';
    const engineMatch = cleaned.match(/--engine=(mimo|opencode)/i);
    if (engineMatch) {
      engine = engineMatch[1].toLowerCase() as Engine;
      cleaned = cleaned.replace(/--engine=\S+/i, '').trim();
    }

    const lines = cleaned
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const header = lines[0];

    const arcMatch = header.match(/ARC-(\d+)/i);
    const arc = arcMatch ? `ARC-${arcMatch[1]}` : null;

    const titleMatch = header.match(/ARC-\d+[:\s]+(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : header;

    const requirements = lines
      .slice(1)
      .filter((l) => /^[-*]\s/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, ''));

    const scopeLine = lines.find((l) => /^scope:/i.test(l));
    const scope = scopeLine
      ? scopeLine
          .replace(/^scope:\s*/i, '')
          .split(',')
          .map((s) => s.trim().toLowerCase())
      : ['web'];

    return { arc, title, requirements, scope, engine };
  }

  private buildIssueBody(task: ParsedTask): string {
    const requirements =
      task.requirements.length > 0
        ? task.requirements.map((r) => `- [ ] ${r}`).join('\n')
        : '- [ ] TBD';

    const scopeLabels = task.scope
      .map((s) => `- [ ] ${s.charAt(0).toUpperCase() + s.slice(1)}`)
      .join('\n');

    return `## ARC Ticket

\`${task.arc || 'ARC-NEW'}\` — ${task.title}

## Engine

\`${task.engine}\`

## Requirements

${requirements}

## Scope

${scopeLabels}

## Acceptance Criteria

- [ ] Feature works as described
- [ ] No \`any\` types used
- [ ] i18n keys added for all user-facing strings
- [ ] Handles loading, error, and empty states
- [ ] Lint and typecheck pass`;
  }

  private createGitHubIssue(task: ParsedTask): string | null {
    const title = task.arc ? `${task.arc}: ${task.title}` : task.title;
    const body = this.buildIssueBody(task);
    const labels = ['task', 'automated'];
    if (task.arc) labels.push(task.arc);

    const labelFlags = labels.map((l) => `--label "${l}"`).join(' ');
    const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const escapedTitle = title.replace(/"/g, '\\"');

    const cmd = `gh issue create --title "${escapedTitle}" --body "${escapedBody}" ${labelFlags}`;

    try {
      const result = execSync(cmd, {
        encoding: 'utf-8',
        cwd: this.config.get<string>('REPO_PATH') ?? process.cwd(),
      });
      return result.trim();
    } catch (err) {
      this.logger.error(`Failed to create issue: ${err}`);
      return null;
    }
  }

  private extractIssueNumber(url: string): string | null {
    const match = url.match(/\/(\d+)$/);
    return match ? match[1] : null;
  }

  private writeTriggerFile(task: ParsedTask, issueNumber: number, issueUrl: string) {
    const repoPath = this.config.get<string>('REPO_PATH') ?? process.cwd();
    const pendingDir = join(repoPath, '.tasks/pending');

    if (!existsSync(pendingDir)) {
      mkdirSync(pendingDir, { recursive: true });
    }

    const fileName = `issue-${issueNumber}-${Date.now()}.json`;
    const data = {
      issueNumber,
      issueUrl,
      arc: task.arc,
      title: task.title,
      requirements: task.requirements,
      scope: task.scope,
      engine: task.engine,
      createdAt: new Date().toISOString(),
    };

    writeFileSync(join(pendingDir, fileName), JSON.stringify(data, null, 2));
    this.logger.log(`Trigger file written: ${fileName}`);
  }

  private async handleTask(ctx: Context) {
    const text = ctx.message?.text?.replace(/^\/task\s*/, '');
    if (!text) {
      await ctx.reply(
        'Usage:\n/task ARC-877: Chess Engine\n- Full rules\n- Bot\nScope: backend, web',
      );
      return;
    }

    const hasEngine = /--engine=(mimo|opencode)/i.test(text);
    if (hasEngine) {
      const task = this.parseTask(text);
      await ctx.reply(`Creating issue for: *${task.title}* (${task.engine})...`, {
        parse_mode: 'Markdown',
      });

      const url = this.createGitHubIssue(task);
      if (url) {
        const issueNum = this.extractIssueNumber(url);
        if (issueNum) {
          this.writeTriggerFile(task, parseInt(issueNum, 10), url);
        }
        await ctx.reply(
          `Issue created: ${url}\n\nImplementing with ${task.engine}...`,
          { parse_mode: 'Markdown' },
        );
      } else {
        await ctx.reply('Failed to create issue. Check gh auth status.');
      }
    } else {
      const taskId = `task_${Date.now()}`;
      this.pendingTasks.set(taskId, { text, userId: ctx.from?.id ?? 0 });

      await ctx.reply('Select engine:', {
        reply_markup: new InlineKeyboard()
          .text('opencode', `engine:${taskId}:opencode`)
          .text('mimo', `engine:${taskId}:mimo`),
      });
    }
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
    const task = this.parseTask(textWithEngine);

    await ctx.editMessageText(`Creating issue for: *${task.title}* (${task.engine})...`, {
      parse_mode: 'Markdown',
    });

    const url = this.createGitHubIssue(task);
    if (url) {
      const issueNum = this.extractIssueNumber(url);
      if (issueNum) {
        this.writeTriggerFile(task, parseInt(issueNum, 10), url);
      }
      await ctx.reply(
        `Issue created: ${url}\n\nImplementing with ${task.engine}...`,
        { parse_mode: 'Markdown' },
      );
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
      if (hasEngine) {
        const task = this.parseTask(text);
        await ctx.reply(`Creating issue for: *${task.title}* (${task.engine})...`, {
          parse_mode: 'Markdown',
        });

        const url = this.createGitHubIssue(task);
        if (url) {
          const issueNum = this.extractIssueNumber(url);
          if (issueNum) {
            this.writeTriggerFile(task, parseInt(issueNum, 10), url);
          }
          await ctx.reply(
            `Issue created: ${url}\n\nImplementing with ${task.engine}...`,
            { parse_mode: 'Markdown' },
          );
        } else {
          await ctx.reply('Failed to create issue.');
        }
      } else {
        const taskId = `task_${Date.now()}`;
        this.pendingTasks.set(taskId, { text, userId: ctx.from?.id ?? 0 });

        await ctx.reply('Select engine:', {
          reply_markup: new InlineKeyboard()
            .text('opencode', `engine:${taskId}:opencode`)
            .text('mimo', `engine:${taskId}:mimo`),
        });
      }
    }
  }

  private async handleListTasks(ctx: Context) {
    const cwd = this.config.get<string>('REPO_PATH') ?? process.cwd();
    try {
      const result = execSync(
        'gh issue list --label "task" --json number,title,state --limit 10',
        { encoding: 'utf-8', cwd },
      );
      const issues = JSON.parse(result) as Array<{
        number: number;
        title: string;
        state: string;
      }>;
      if (issues.length === 0) {
        await ctx.reply('No open tasks.');
        return;
      }
      const list = issues
        .map((i) => `#${i.number} — ${i.title} [${i.state}]`)
        .join('\n');
      await ctx.reply(`Open tasks:\n${list}`);
    } catch {
      await ctx.reply('Failed to list issues.');
    }
  }

  private async handleImplement(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const issueNum = text.match(/#?(\d+)/)?.[1];
    if (!issueNum) {
      await ctx.reply('Usage: /implement #12 --engine=mimo');
      return;
    }

    let engine: Engine = 'opencode';
    const engineMatch = text.match(/--engine=(mimo|opencode)/i);
    if (engineMatch) {
      engine = engineMatch[1].toLowerCase() as Engine;
    }

    await ctx.reply(
      `Tell ${engine}:\n\`implement issue #${issueNum}\``,
      { parse_mode: 'Markdown' },
    );
  }
}
