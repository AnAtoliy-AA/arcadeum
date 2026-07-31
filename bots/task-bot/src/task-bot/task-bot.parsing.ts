import { Context } from 'grammy';
import { GitHubService } from '../github/github.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { PreferencesService } from '../preferences/preferences.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import { SCOPE_KEYWORDS } from './task-bot.types';
import type { ParsedTask, Engine, Priority } from './task-bot.types';

export function parseTask(
  text: string,
  autoArc = false,
  userId?: number,
  prefsService?: PreferencesService,
): ParsedTask {
  let cleaned = text.trim();

  let engine: Engine = userId && prefsService
    ? prefsService.getEngine(userId)
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
    const roadmapMatch = prefsService?.['roadmapService']?.matchRoadmapItem?.(title);
    arc = roadmapMatch?.arc ?? prefsService?.['roadmapService']?.getNextArcNumber?.() ?? null;
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
  } else if (userId && prefsService) {
    scope = prefsService.getScope(userId);
  } else {
    scope = detectScope(title);
  }

  return { arc, title, requirements, scope, engine, priority };
}

export function detectScope(title: string): string[] {
  const lower = title.toLowerCase();
  const detected: string[] = [];
  for (const [scope, keywords] of Object.entries(SCOPE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(scope);
    }
  }
  return detected.length > 0 ? detected : ['web'];
}

export async function createAndTriggerTask(
  service: {
    githubService: GitHubService;
    queueService: ImplementQueueService;
    logger: any;
  },
  task: ParsedTask,
  ctx: Context,
): Promise<void> {
  const existing = service.githubService.findDuplicateIssue(task.title);
  if (existing) {
    await ctx.reply(
      `Issue already exists: #${existing.number} — ${existing.title} [${existing.state}]\n\nUse /implement #${existing.number} to trigger implementation.`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  const prioBadge = task.priority !== 'normal' ? ` [${task.priority.toUpperCase()}]` : '';
  await ctx.reply(`Creating *${task.arc}: ${task.title}*${prioBadge}...`, {
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

export async function queueImplementation(
  service: {
    githubService: GitHubService;
    queueService: ImplementQueueService;
    logger: any;
  },
  issueNum: string,
  engine: Engine,
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