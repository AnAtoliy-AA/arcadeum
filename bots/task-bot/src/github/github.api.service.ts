import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFileSync, spawn } from 'child_process';

import {
  GitHubIssue,
  GitHubIssueView,
  GitHubIssueSimple,
  GitHubPRView,
  GitHubCheck,
  GitHubReview,
  GitHubIssueListItem,
} from './github.types';

const GITHUB_RATE_LIMIT_DELAY_MS = 500;

@Injectable()
export class GitHubApiService {
  private readonly logger = new Logger(GitHubApiService.name);
  private lastGhCallTime = 0;

  constructor(private readonly config: ConfigService) {}

  private throttleGitHub(): void {
    const now = Date.now();
    const elapsed = now - this.lastGhCallTime;
    if (elapsed < GITHUB_RATE_LIMIT_DELAY_MS) {
      const waitMs = GITHUB_RATE_LIMIT_DELAY_MS - elapsed;
      const start = Date.now();
      while (Date.now() - start < waitMs) {
        // busy wait for rate limit
      }
    }
    this.lastGhCallTime = Date.now();
  }

  private getCwd(): string {
    return this.config.get<string>('REPO_PATH') ?? process.cwd();
  }

  private spawnAsync(
    cmd: string,
    args: string[],
    opts: {
      cwd: string;
      timeout?: number;
      env?: Record<string, string>;
      onTimeoutApproaching?: () => Promise<'continue' | 'abort'>;
    },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        cwd: opts.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, ...opts.env },
      });
      let stdout = '';
      let stderr = '';
      let settled = false;
      let currentTimer: NodeJS.Timeout | undefined;
      let warningTimer: NodeJS.Timeout | undefined;
      child.stdout?.on('data', (d: Buffer) => (stdout += d.toString()));
      child.stderr?.on('data', (d: Buffer) => (stderr += d.toString()));

      const killChild = () => {
        try {
          process.kill(-child.pid!, 'SIGTERM');
        } catch {
          try {
            child.kill('SIGTERM');
          } catch {
            /* ignore */
          }
        }
      };

      const startTimer = (remainingMs: number) => {
        if (currentTimer) clearTimeout(currentTimer);
        if (warningTimer) clearTimeout(warningTimer);

        const warningMs = Math.max(0, remainingMs - 100_000);
        if (opts.onTimeoutApproaching && warningMs > 0) {
          warningTimer = setTimeout(() => {
            if (settled) return;
            opts.onTimeoutApproaching!().then((action) => {
              if (settled) return;
              if (action === 'abort') {
                settled = true;
                killChild();
                reject(new Error('Aborted by user'));
              } else {
                startTimer(900_000);
              }
            });
          }, warningMs);
        }

        currentTimer = setTimeout(() => {
          if (settled) return;
          settled = true;
          killChild();
          reject(new Error(`Timeout after ${Math.round(remainingMs / 1000)}s`));
        }, remainingMs);
      };

      if (opts.timeout) {
        startTimer(opts.timeout);
      }

      child.on('close', (code) => {
        if (settled) return;
        settled = true;
        if (currentTimer) clearTimeout(currentTimer);
        if (warningTimer) clearTimeout(warningTimer);
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(stderr || `Exit code ${code}`));
      });
      child.on('error', (err) => {
        if (settled) return;
        settled = true;
        if (currentTimer) clearTimeout(currentTimer);
        if (warningTimer) clearTimeout(warningTimer);
        reject(err);
      });
    });
  }

  createIssue(issue: GitHubIssue): string | null {
    const title = issue.arc ? `${issue.arc}: ${issue.title}` : issue.title;
    const body = this.buildIssueBody(issue);
    const labels = ['task', 'automated'];
    if (issue.priority === 'high' || issue.priority === 'urgent') {
      labels.push('priority');
    }
    if (issue.arc) {
      const existingLabels = this.listLabels();
      if (existingLabels.includes(issue.arc)) {
        labels.push(issue.arc);
      }
    }

    const labelArgs = labels.flatMap((l) => ['--label', l]);
    const args = [
      'issue',
      'create',
      '--title',
      title,
      '--body',
      body,
      ...labelArgs,
    ];

    try {
      this.throttleGitHub();
      const result = execFileSync('gh', args, {
        encoding: 'utf-8',
        cwd: this.getCwd(),
      });
      return result.trim();
    } catch (err) {
      this.logger.error(`Failed to create issue: ${err}`);
      return null;
    }
  }

  extractIssueNumber(url: string): string | null {
    const match = url.match(/\/(\d+)$/);
    return match ? match[1] : null;
  }

  triggerWorkflow(issueNumber: string, engine: string): boolean {
    try {
      execFileSync(
        'gh',
        [
          'workflow',
          'run',
          'implement-task.yml',
          '--ref',
          'develop',
          '-f',
          `issue_number=${issueNumber}`,
          '-f',
          `engine=${engine}`,
        ],
        { encoding: 'utf-8', cwd: this.getCwd(), stdio: 'pipe' },
      );
      this.logger.log(
        `Workflow triggered for issue #${issueNumber} with engine ${engine}`,
      );
      return true;
    } catch (err) {
      this.logger.error(`Failed to trigger workflow: ${err}`);
      return false;
    }
  }

  viewIssue(issueNum: string): GitHubIssueView | null {
    try {
      this.throttleGitHub();
      const result = execFileSync(
        'gh',
        ['issue', 'view', issueNum, '--json', 'state,title,body,comments,labels'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as GitHubIssueView;
    } catch {
      return null;
    }
  }

  viewIssueSimple(issueNum: string): GitHubIssueSimple | null {
    try {
      const result = execFileSync('gh', ['issue', 'view', issueNum, '--json', 'state,title'], {
        encoding: 'utf-8',
        cwd: this.getCwd(),
      });
      return JSON.parse(result) as GitHubIssueSimple;
    } catch {
      return null;
    }
  }

  viewPr(prNum: string): GitHubPRView | null {
    try {
      this.throttleGitHub();
      const result = execFileSync(
        'gh',
        ['pr', 'view', prNum, '--json', 'state,headRefName,statusCheckRollup'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as GitHubPRView;
    } catch {
      return null;
    }
  }

  getPrChecks(prNumber: string): GitHubCheck[] {
    try {
      this.throttleGitHub();
      const result = execFileSync(
        'gh',
        ['pr', 'checks', prNumber, '--json', 'name,state,link'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as GitHubCheck[];
    } catch {
      return [];
    }
  }

  getCIFailureLogs(runUrl: string): string {
    try {
      const runIdMatch = runUrl.match(/\/runs\/(\d+)/);
      if (!runIdMatch) return '';
      const runId = runIdMatch[1];
      const result = execFileSync(
        'gh',
        ['run', 'view', runId, '--log-failed', '--repo', 'AnAtoliy-AA/arcadeum'],
        { encoding: 'utf-8', cwd: this.getCwd(), timeout: 30_000 },
      );
      const lines = result.split('\n');
      const errorLines: string[] = [];
      let capture = false;
      for (const line of lines) {
        if (line.includes('ERROR') || line.includes('error') || line.includes('FAIL') || line.includes('fail')) {
          capture = true;
        }
        if (capture) {
          errorLines.push(line);
          if (errorLines.length > 80) break;
        }
      }
      if (errorLines.length > 0) {
        return errorLines.join('\n').slice(0, 4000);
      }
      const passingLines = lines.filter((l) => l.includes('✓') || l.includes('PASS'));
      const failingLines = lines.filter((l) => l.includes('×') || l.includes('FAIL') || l.includes('Error'));
      const summary = `Total tests: ${passingLines.length} passed, ${failingLines.length} failed`;
      return [summary, '', 'Failing tests:', ...failingLines.slice(0, 20)].join('\n').slice(0, 4000);
    } catch {
      return '';
    }
  }

  getPrReviews(prNumber: string): GitHubReview[] {
    try {
      this.throttleGitHub();
      const result = execFileSync(
        'gh',
        ['pr', 'view', prNumber, '--json', 'reviews'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      const data = JSON.parse(result) as { reviews: GitHubReview[] };
      return data.reviews ?? [];
    } catch {
      return [];
    }
  }

  listIssues(label: string, limit: number): GitHubIssueListItem[] {
    try {
      const result = execFileSync(
        'gh',
        [
          'issue',
          'list',
          '--label',
          label,
          '--json',
          'number,title,state,labels,comments',
          '--limit',
          String(limit),
        ],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as GitHubIssueListItem[];
    } catch {
      return [];
    }
  }

  findDuplicateIssue(title: string): { number: number; title: string; state: string } | null {
    try {
      const result = execFileSync(
        'gh',
        ['issue', 'list', '--state', 'all', '--json', 'number,title,state', '--limit', '100'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      const issues = JSON.parse(result) as Array<{
        number: number;
        title: string;
        state: string;
      }>;
      const normalizedTitle = title.toLowerCase().replace(/^arc-\d+:\s*/, '');
      return (
        issues.find(
          (i) =>
            i.title.toLowerCase().replace(/^arc-\d+:\s*/, '') === normalizedTitle,
        ) ?? null
      );
    } catch {
      return null;
    }
  }

  private listLabels(): string[] {
    try {
      const result = execFileSync('gh', ['label', 'list', '--json', 'name', '--limit', '100'], {
        encoding: 'utf-8',
        cwd: this.getCwd(),
      });
      const labels = JSON.parse(result) as Array<{ name: string }>;
      return labels.map((l) => l.name);
    } catch {
      return [];
    }
  }

  private buildIssueBody(issue: GitHubIssue): string {
    const requirements =
      issue.requirements.length > 0
        ? issue.requirements.map((r) => `- [ ] ${r}`).join('\n')
        : '- [ ] TBD';

    const scopeLabels = issue.scope
      .map((s) => `- [ ] ${s.charAt(0).toUpperCase() + s.slice(1)}`)
      .join('\n');

    const prioEmoji = { low: '🟢', normal: '🟡', high: '🟠', urgent: '🔴' }[
      issue.priority
    ];

    return `## ARC Ticket

\`${issue.arc || 'ARC-NEW'}\` — ${issue.title}

## Priority

${prioEmoji} ${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}

## Engine

\`${issue.engine}\`

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
}