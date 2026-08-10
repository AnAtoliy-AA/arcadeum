import { Context } from 'grammy';
import { ParsedTask, PendingRetry, Engine, Priority } from './task-bot.types';

const SCOPE_KEYWORDS: Record<string, string[]> = {
  backend: [
    'api', 'server', 'database', 'auth', 'endpoint', 'service', 'gateway', 'socket', 'websocket',
  ],
  web: [
    'page', 'ui', 'component', 'button', 'form', 'modal', 'dashboard', 'layout', 'css', 'style',
  ],
  mobile: ['app', 'screen', 'ios', 'android', 'expo', 'react native'],
  game: ['game', 'engine', 'bot', 'ai', 'match', 'session', 'turn'],
};

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

export function parseTask(
  text: string,
  autoArc = false,
  userId?: number,
  prefsService?: { getEngine: (id: number) => Engine; getScope: (id: number) => string[] },
  roadmapService?: { matchRoadmapItem: (title: string) => { arc: string } | null; getNextArcNumber: () => string },
): ParsedTask {
  let cleaned = text.trim();

  let engine: Engine = userId && prefsService ? prefsService.getEngine(userId) : 'opencode';
  const engineMatch = cleaned.match(/--engine[=:](\S+)/i);
  if (engineMatch) {
    const requested = engineMatch[1].toLowerCase();
    if (requested !== 'opencode') {
      throw new Error(`Invalid engine: ${requested}. Valid engines: opencode`);
    }
    engine = requested as Engine;
    cleaned = cleaned.replace(/--engine=\S+/i, '').trim();
  }

  let requirements: string[] = [];
  const reqMatch = cleaned.match(/--req\s+"([^"]+)"/i);
  if (reqMatch) {
    requirements = reqMatch[1].split(/[,;]/).map((r) => r.trim()).filter(Boolean);
    cleaned = cleaned.replace(/--req\s+"[^"]+"/i, '').trim();
  } else {
    const reqMatchSimple = cleaned.match(/--req\s+(\S.+)/i);
    if (reqMatchSimple) {
      requirements = reqMatchSimple[1].split(/[,;]/).map((r) => r.trim()).filter(Boolean);
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

  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const header = lines[0];

  const arcMatch = header.match(/ARC-(\d+)/i);
  let arc = arcMatch ? `ARC-${arcMatch[1]}` : null;

  const titleMatch = header.match(/ARC-\d+[:\s]+(.+)/i);
  const title = titleMatch ? titleMatch[1].trim() : header;

  if (autoArc && !arc && roadmapService) {
    const roadmapMatch = roadmapService.matchRoadmapItem(title);
    arc = roadmapMatch?.arc ?? roadmapService.getNextArcNumber();
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

export function isAllowed(ctx: Context, allowedUserIds: Set<number>): boolean {
  if (allowedUserIds.size === 0) return true;
  const userId = ctx.from?.id;
  return userId !== undefined && allowedUserIds.has(userId);
}

export function formatQueueStatus(stats: { waiting: number; active: number; completed: number; failed: number }, active: Array<{ issueNum: string; engine: string; progress: number }>): string {
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

  return lines.join('\n');
}

export function formatTaskList(issues: Array<{
  number: number;
  title: string;
  state: string;
  labels: Array<{ name: string }>;
  comments: Array<{ body: string; createdAt: string }>;
}>): string {
  if (issues.length === 0) return 'No open tasks.';

  const lines: string[] = ['*Task Queue*\n'];
  for (const issue of issues) {
    const hasPr = issue.comments.some((c) => c.body.includes('PR:'));
    const isFailed = issue.comments.some((c) => c.body.includes('failed'));
    let status: string;
    if (issue.state === 'CLOSED') status = '✅';
    else if (isFailed) status = '❌';
    else if (hasPr) status = '🔄';
    else status = '⏳';

    const prioLabel = issue.labels.find((l) => l.name === 'priority');
    const prioBadge = prioLabel ? ' 🔴' : '';
    lines.push(`${status} #${issue.number} — ${issue.title}${prioBadge}`);
  }
  lines.push('\n_✅ done 🔄 PR open ❌ failed ⏳ pending_');
  return lines.join('\n');
}

export function sanitizeMessage(text: string): string {
  return text
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\[[\d;]*m/g, '')
    .replace(/`([^`]*?)`/g, '«$1»')
    .replace(/[*_~\[\]()]/g, '')
    .slice(0, 3900);
}

export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}