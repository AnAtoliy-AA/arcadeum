import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { TelegramService } from '../telegram/telegram.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import { Bot, type Context, InlineKeyboard } from 'grammy';

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

interface UserPreference {
  engine: Engine;
  defaultScope: string[];
}

const SCOPE_KEYWORDS: Record<string, string[]> = {
  backend: ['api', 'server', 'database', 'auth', 'endpoint', 'service', 'gateway', 'socket', 'websocket'],
  web: ['page', 'ui', 'component', 'button', 'form', 'modal', 'dashboard', 'layout', 'css', 'style'],
  mobile: ['app', 'screen', 'ios', 'android', 'expo', 'react native'],
  game: ['game', 'engine', 'bot', 'ai', 'match', 'session', 'turn'],
};

@Injectable()
export class TaskBotService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskBotService.name);
  private readonly allowedUserIds: Set<number>;
  private readonly pendingTasks = new Map<string, { text: string; userId: number }>();
  private readonly userPreferences = new Map<number, UserPreference>();
  private readonly prefsPath: string;
  private bot!: Bot;

  constructor(
    private readonly config: ConfigService,
    private readonly telegramService: TelegramService,
    private readonly roadmapService: RoadmapService,
  ) {
    const raw = this.config.get<string>('TELEGRAM_ALLOWED_USERS') ?? '';
    this.allowedUserIds = new Set(
      raw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)),
    );
    const repoPath = this.config.get<string>('REPO_PATH') ?? process.cwd();
    this.prefsPath = join(repoPath, '.tasks', 'user-preferences.json');
    this.loadPreferences();
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

  private loadPreferences() {
    try {
      if (existsSync(this.prefsPath)) {
        const data = JSON.parse(readFileSync(this.prefsPath, 'utf-8'));
        for (const [key, value] of Object.entries(data)) {
          this.userPreferences.set(parseInt(key, 10), value as UserPreference);
        }
      }
    } catch {
      this.logger.warn('Could not load user preferences');
    }
  }

  private savePreferences() {
    try {
      const dir = join(this.config.get<string>('REPO_PATH') ?? process.cwd(), '.tasks');
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const data = Object.fromEntries(this.userPreferences);
      writeFileSync(this.prefsPath, JSON.stringify(data, null, 2));
    } catch {
      this.logger.warn('Could not save user preferences');
    }
  }

  private getUserEngine(userId: number): Engine {
    return this.userPreferences.get(userId)?.engine ?? 'opencode';
  }

  private getUserScope(userId: number): string[] {
    return this.userPreferences.get(userId)?.defaultScope ?? ['web'];
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
    this.bot.command('status', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handleStatus(ctx);
    });
    this.bot.command('prefs', (ctx) => {
      if (!this.isAllowed(ctx)) return ctx.reply('Access denied.');
      return this.handlePrefs(ctx);
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

  private parseTask(text: string, autoArc = false, userId?: number): ParsedTask {
    let cleaned = text.trim();

    let engine: Engine = userId ? this.getUserEngine(userId) : 'opencode';
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
      if (roadmapMatch) {
        arc = roadmapMatch.arc;
      } else {
        arc = this.roadmapService.getNextArcNumber();
      }
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
      scope = this.getUserScope(userId);
    } else {
      scope = this.detectScope(title);
    }

    return { arc, title, requirements, scope, engine, priority };
  }

  private buildIssueBody(task: ParsedTask): string {
    const requirements =
      task.requirements.length > 0
        ? task.requirements.map((r) => `- [ ] ${r}`).join('\n')
        : '- [ ] TBD';

    const scopeLabels = task.scope
      .map((s) => `- [ ] ${s.charAt(0).toUpperCase() + s.slice(1)}`)
      .join('\n');

    const prioEmoji = { low: '🟢', normal: '🟡', high: '🟠', urgent: '🔴' }[task.priority];

    return `## ARC Ticket

\`${task.arc || 'ARC-NEW'}\` — ${task.title}

## Priority

${prioEmoji} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}

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
    if (task.priority === 'high' || task.priority === 'urgent') labels.push('priority');

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

  private triggerWorkflow(issueNumber: string, engine: Engine): boolean {
    const cwd = this.config.get<string>('REPO_PATH') ?? process.cwd();
    try {
      execSync(
        `gh workflow run implement-task.yml --ref develop -f issue_number=${issueNumber} -f engine=${engine}`,
        { encoding: 'utf-8', cwd, stdio: 'pipe' },
      );
      this.logger.log(`Workflow triggered for issue #${issueNumber} with engine ${engine}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to trigger workflow: ${err}`);
      return false;
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
    const prioBadge = task.priority !== 'normal' ? ` [${task.priority.toUpperCase()}]` : '';
    await ctx.reply(`Creating *${task.arc}: ${task.title}*${prioBadge} (${task.engine})...`, {
      parse_mode: 'Markdown',
    });

    const url = this.createGitHubIssue(task);
    if (url) {
      const issueNum = this.extractIssueNumber(url);
      if (issueNum) {
        const triggered = this.triggerWorkflow(issueNum, task.engine);
        await ctx.reply(
          `Issue created: ${url}\n\n${triggered ? `Implementing with ${task.engine}...` : 'Issue created but workflow trigger failed. Use /implement to retry.'}`,
          { parse_mode: 'Markdown' },
        );
      } else {
        await ctx.reply(
          `Issue created: ${url}\n\nCould not extract issue number for workflow.`,
          { parse_mode: 'Markdown' },
        );
      }
    } else {
      await ctx.reply('Failed to create issue. Check gh auth status.');
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
    const task = this.parseTask(textWithEngine, true, pending.userId);

    await ctx.editMessageText(`Creating issue for: *${task.title}* (${task.engine})...`, {
      parse_mode: 'Markdown',
    });

    const url = this.createGitHubIssue(task);
    if (url) {
      const issueNum = this.extractIssueNumber(url);
      if (issueNum) {
        const triggered = this.triggerWorkflow(issueNum, task.engine);
        await ctx.reply(
          `Issue created: ${url}\n\n${triggered ? `Implementing with ${task.engine}...` : 'Issue created but workflow trigger failed. Use /implement to retry.'}`,
          { parse_mode: 'Markdown' },
        );
      } else {
        await ctx.reply(
          `Issue created: ${url}\n\nCould not extract issue number for workflow.`,
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
      await ctx.reply(`Creating *${task.arc}: ${task.title}* (${task.engine})...`, {
        parse_mode: 'Markdown',
      });

      const url = this.createGitHubIssue(task);
      if (url) {
        const issueNum = this.extractIssueNumber(url);
        if (issueNum) {
          const triggered = this.triggerWorkflow(issueNum, task.engine);
          await ctx.reply(
            `Issue created: ${url}\n\n${triggered ? `Implementing with ${task.engine}...` : 'Issue created but workflow trigger failed. Use /implement to retry.'}`,
            { parse_mode: 'Markdown' },
          );
        } else {
          await ctx.reply(
            `Issue created: ${url}\n\nCould not extract issue number for workflow.`,
            { parse_mode: 'Markdown' },
          );
        }
      } else {
        await ctx.reply('Failed to create issue.');
      }
    }
  }

  private async handleListTasks(ctx: Context) {
    const cwd = this.config.get<string>('REPO_PATH') ?? process.cwd();
    try {
      const result = execSync(
        'gh issue list --label "task" --json number,title,state,labels,comments --limit 20',
        { encoding: 'utf-8', cwd },
      );
      const issues = JSON.parse(result) as Array<{
        number: number;
        title: string;
        state: string;
        labels: Array<{ name: string }>;
        comments: Array<{ body: string; createdAt: string }>;
      }>;

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

    let engine: Engine = this.getUserEngine(ctx.from?.id ?? 0);
    const engineMatch = text.match(/--engine=(mimo|opencode)/i);
    if (engineMatch) {
      engine = engineMatch[1].toLowerCase() as Engine;
    }

    const cwd = this.config.get<string>('REPO_PATH') ?? process.cwd();
    try {
      const issueJson = execSync(
        `gh issue view ${issueNum} --json state,title`,
        { encoding: 'utf-8', cwd },
      );
      const issue = JSON.parse(issueJson) as { state: string; title: string };

      if (issue.state !== 'OPEN') {
        await ctx.reply(`Issue #${issueNum} is ${issue.state.toLowerCase()}.`);
        return;
      }

      await ctx.reply(`Triggering implementation for #${issueNum} with ${engine}...`);
      const triggered = this.triggerWorkflow(issueNum, engine);

      if (triggered) {
        await ctx.reply(
          `Workflow triggered for #${issueNum} (${engine}).\nTrack progress: /status #${issueNum}`,
        );
      } else {
        await ctx.reply('Failed to trigger workflow. Check gh auth status.');
      }
    } catch {
      await ctx.reply(`Issue #${issueNum} not found.`);
    }
  }

  private async handleStatus(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const issueNum = text.match(/#?(\d+)/)?.[1];
    if (!issueNum) {
      await ctx.reply('Usage: /status #12');
      return;
    }

    const cwd = this.config.get<string>('REPO_PATH') ?? process.cwd();
    try {
      const issueJson = execSync(
        `gh issue view ${issueNum} --json state,title,body,comments,labels`,
        { encoding: 'utf-8', cwd },
      );
      const issue = JSON.parse(issueJson) as {
        state: string;
        title: string;
        body: string;
        comments: Array<{ body: string; createdAt: string }>;
        labels: Array<{ name: string }>;
      };

      const prioLabel = issue.labels.find((l) => l.name === 'priority');
      const prioBadge = prioLabel ? ' 🔴' : '';

      const lines = [`*#${issueNum}: ${issue.title}*${prioBadge}`];
      lines.push(`Status: ${issue.state}`);

      const lastComment = issue.comments[issue.comments.length - 1];
      if (lastComment) {
        const age = Date.now() - new Date(lastComment.createdAt).getTime();
        const mins = Math.floor(age / 60000);
        const ago = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
        lines.push(`Last update: ${ago}`);
        lines.push(`> ${lastComment.body.slice(0, 200)}`);
      }

      const prMatch = issue.body.match(/#(\d+)/);
      if (prMatch) {
        try {
          const prJson = execSync(
            `gh pr view ${prMatch[1]} --json state,statusCheckRollup`,
            { encoding: 'utf-8', cwd },
          );
          const pr = JSON.parse(prJson) as {
            state: string;
            statusCheckRollup: Array<{ name: string; conclusion: string | null }>;
          };
          const checks = pr.statusCheckRollup;
          const passed = checks.filter((c) => c.conclusion === 'success').length;
          const failed = checks.filter((c) => c.conclusion === 'failure').length;
          const pending = checks.filter((c) => c.conclusion === null).length;
          lines.push(`PR #${prMatch[1]}: ${pr.state} (${passed}/${checks.length} checks, ${failed} failed, ${pending} pending)`);
        } catch {
          lines.push(`PR #${prMatch[1]}: unknown status`);
        }
      }

      await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
    } catch {
      await ctx.reply(`Issue #${issueNum} not found.`);
    }
  }

  private async handlePrefs(ctx: Context) {
    const text = ctx.message?.text ?? '';
    const userId = ctx.from?.id ?? 0;

    const setMatch = text.match(/\/prefs\s+(opencode|mimo)/i);
    if (setMatch) {
      const engine = setMatch[1].toLowerCase() as Engine;
      const current = this.userPreferences.get(userId) ?? { engine: 'opencode', defaultScope: ['web'] };
      this.userPreferences.set(userId, { ...current, engine });
      this.savePreferences();
      await ctx.reply(`Default engine set to *${engine}*`, { parse_mode: 'Markdown' });
      return;
    }

    const scopeMatch = text.match(/\/prefs\s+scope[:\s]+(.+)/i);
    if (scopeMatch) {
      const scope = scopeMatch[1].split(',').map((s) => s.trim().toLowerCase());
      const current = this.userPreferences.get(userId) ?? { engine: 'opencode', defaultScope: ['web'] };
      this.userPreferences.set(userId, { ...current, defaultScope: scope });
      this.savePreferences();
      await ctx.reply(`Default scope set to *${scope.join(', ')}*`, { parse_mode: 'Markdown' });
      return;
    }

    const current = this.userPreferences.get(userId);
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
}
