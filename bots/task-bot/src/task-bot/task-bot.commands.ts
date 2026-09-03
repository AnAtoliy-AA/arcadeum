import { Context } from 'grammy';

import { GitHubService } from '../github/github.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { PreferencesService } from '../preferences/preferences.service';
import { ShortsFactoryService } from '../shorts-factory/shorts-factory.service';
import { queueImplementation, createAndTriggerTask } from './task-bot.parsing';

export async function handleVersion(
  service: {
    logger: any;
    shortsFactoryService: ShortsFactoryService;
  },
  ctx: Context,
): Promise<void> {
  const { execSync } = await import('node:child_process');

  let pkgVersion = 'unknown';
  try {
    pkgVersion = require('../../package.json').version as string;
  } catch {
    // ignore
  }

  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse --short HEAD', { cwd: '/opt/arcadeum' })
      .toString()
      .trim();
  } catch {
    // ignore
  }

  let nodeVersion = 'unknown';
  try {
    nodeVersion = execSync('node --version').toString().trim();
  } catch {
    // ignore
  }

  await ctx.reply(
    '🤖 <b>Arcadeum Bots</b>\n\n' +
      `📦 task-bot: <code>v${pkgVersion}</code>\n` +
      `🔀 commit: <code>${commit}</code>\n` +
      `🟢 node: <code>${nodeVersion}</code>\n\n` +
      `Server: <code>${process.env.SERVER_IP ?? 'unknown'}</code>`,
    { parse_mode: 'HTML' },
  );
}


export async function handleTask(
  service: {
    githubService: GitHubService;
    queueService: ImplementQueueService;
    prefsService: PreferencesService;
    logger: any;
    parseTask: (text: string, autoArc: boolean, userId?: number) => any;
    createAndTriggerTask: (task: any, ctx: Context) => Promise<void>;
  },
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text?.replace(/^\/task\s*/, '');
  if (!text) {
    await ctx.reply(
      'Usage:\n/task Chess Engine\n/task high Add emotes to games\n\nOptional flags:\n--engine=opencode (default: opencode)\n--high / --urgent / --low\n--req " requirement 1, requirement 2"\nScope: backend, web, mobile, game',
    );
    return;
  }
  try {
    const task = service.parseTask(text, true, ctx.from?.id);
    await service.createAndTriggerTask(task, ctx);
  } catch (err) {
    await ctx.reply((err as Error).message);
  }
}

export async function handleListTasks(
  service: { githubService: GitHubService },
  ctx: Context,
): Promise<void> {
  const issues = service.githubService.listIssues('task', 20);
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

export async function handleImplement(
  service: {
    githubService: GitHubService;
    queueService: ImplementQueueService;
    prefsService: PreferencesService;
    logger: any;
  },
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text ?? '';
  const issueNum = text.match(/#?(\d+)/)?.[1];
  if (!issueNum) {
    await ctx.reply('Usage: /implement #12 --engine=opencode\n\nValid engines: opencode');
    return;
  }

  let engine = service.prefsService.getEngine(ctx.from?.id ?? 0);
  const engineMatch = text.match(/--engine[=:](\S+)/i);
  if (engineMatch) {
    const requested = engineMatch[1].toLowerCase();
    if (requested !== 'opencode') {
      await ctx.reply(`Invalid engine: ${requested}\n\nValid engines: opencode\n\nExample: /implement #${issueNum} --engine=opencode`);
      return;
    }
    engine = requested as 'opencode';
  }

  await queueImplementation(service, issueNum, engine, ctx);
}

export async function handleFix(
  service: {
    githubService: GitHubService;
    queueService: ImplementQueueService;
    prefsService: PreferencesService;
    logger: any;
  },
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text ?? '';
  const prNum = text.match(/#?(\d+)/)?.[1];
  if (!prNum) {
    await ctx.reply('Usage: /fix #12 --engine=opencode\n\nFixes CI failures, review comments, and common issues on a PR.\nValid engines: opencode');
    return;
  }

  let engine = service.prefsService.getEngine(ctx.from?.id ?? 0);
  const engineMatch = text.match(/--engine[=:](\S+)/i);
  if (engineMatch) {
    const requested = engineMatch[1].toLowerCase();
    if (requested !== 'opencode') {
      await ctx.reply(`Invalid engine: ${requested}\n\nValid engines: opencode\n\nExample: /fix #${prNum} --engine=opencode`);
      return;
    }
    engine = requested as 'opencode';
  }

  const chatId = ctx.chat?.id ?? 0;
  const userId = ctx.from?.id ?? 0;

  try {
    const pr = service.githubService.viewPr(prNum);
    if (!pr) {
      await ctx.reply(`PR #${prNum} not found.`);
      return;
    }

    const failedChecks = service.githubService.getPrChecks(prNum).filter(
      (c) => c.state === 'FAILURE' || c.state === 'failure',
    );

    const reviews = service.githubService.getPrReviews(prNum);
    const reviewComments = reviews
      .filter((r) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
      .map((r) => r.body)
      .join('\n---\n');

    const jobId = await service.queueService.addFixJob(prNum, engine, chatId, userId, {
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
    service.logger.error(`Failed to queue fix: ${err}`);
    await ctx.reply('Failed to queue fix. Try again later.');
  }
}

export async function handleQueueStatus(
  service: { queueService: ImplementQueueService },
  ctx: Context,
): Promise<void> {
  try {
    const stats = await service.queueService.getQueueStats();
    const active = await service.queueService.getActiveJobs();

    const lines = ['*Worker Queue Status*\n'];
    lines.push(`Waiting: ${stats.waiting}`);
    lines.push(`Active: ${stats.active}`);
    lines.push(`Completed: ${stats.completed}`);
    lines.push(`Failed: ${stats.failed}`);

    if (active.length > 0) {
      lines.push('\n*Currently processing:*');
      for (const job of active) {
        lines.push(`• #${job.issueNum} with ${job.engine} (${job.progress}%)`);
      }
    }

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (err) {
    await ctx.reply('Failed to get queue status. Is Redis running?');
  }
}

export async function handleStatus(
  service: { githubService: GitHubService },
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text ?? '';
  const issueNum = text.match(/#?(\d+)/)?.[1];
  if (!issueNum) {
    await ctx.reply('Usage: /status #12');
    return;
  }

  const issue = service.githubService.viewIssue(issueNum);
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
    const ago = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
    lines.push(`Last update: ${ago}`, `> ${lastComment.body.slice(0, 200)}`);
  }

  const prMatch = issue.body.match(/#(\d+)/);
  if (prMatch) {
    const pr = service.githubService.viewPr(prMatch[1]);
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

export async function handlePrefs(
  service: { prefsService: PreferencesService },
  ctx: Context,
): Promise<void> {
  const text = ctx.message?.text ?? '';
  const userId = ctx.from?.id ?? 0;

  const setMatch = text.match(/\/prefs\s+(opencode)/i);
  if (setMatch) {
    const engine = setMatch[1].toLowerCase() as 'opencode';
    service.prefsService.setEngine(userId, engine);
    await ctx.reply(`Default engine set to *${engine}*`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const scopeMatch = text.match(/\/prefs\s+scope[:\s]+(.+)/i);
  if (scopeMatch) {
    const scope = scopeMatch[1].split(',').map((s) => s.trim().toLowerCase());
    service.prefsService.setScope(userId, scope);
    await ctx.reply(`Default scope set to *${scope.join(', ')}*`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const current = service.prefsService.getAll(userId);
  await ctx.reply(
    `Current preferences:\n` +
      `Engine: *${current?.engine ?? 'opencode'}*\n` +
      `Scope: *${current?.defaultScope?.join(', ') ?? 'web'}*\n\n` +
      `Usage:\n` +
      `/prefs opencode — set default engine\n` +
      `/prefs opencode — set default engine\n` +
      `/prefs scope: backend, web — set default scope`,
    { parse_mode: 'Markdown' },
  );
}

export async function handleShorts(
  service: {
    shortsFactoryService: import('../shorts-factory/shorts-factory.service').ShortsFactoryService;
    logger: any;
  },
  ctx: Context,
): Promise<void> {
  const { exec } = await import('node:child_process');

  if (ctx.chat?.id) {
    service.shortsFactoryService.setAdminChatId(String(ctx.chat.id));
  }

  await ctx.reply(
    '🎬 <b>Triggering Shorts Factory...</b>\n\nGenerating new short video and preparing preview...',
    { parse_mode: 'HTML' },
  );

  const proc = exec(
    'cd /opt/arcadeum && sudo xvfb-run -a node scripts/shorts-factory/factory.js',
  );

  proc.on('error', (err) => {
    service.logger.error(`Shorts Factory process error: ${err.message}`);
    void ctx.reply(`❌ <b>Shorts Factory Failed to launch:</b>\n<pre>${err.message}</pre>`, {
      parse_mode: 'HTML',
    });
  });
}