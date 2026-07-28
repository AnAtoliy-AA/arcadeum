import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFileSync, spawn } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { NotificationService } from '../notification/notification.service';

import { GitHubApiService } from './github.api.service';
import { GitHubGitService } from './github.git.service';
import {
  GitHubIssue,
  GitHubIssueListItem,
  GitHubReview,
  GitHubIssueBody,
} from './github.types';

const GITHUB_RATE_LIMIT_DELAY_MS = 500;

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private lastGhCallTime = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly api: GitHubApiService,
    private readonly git: GitHubGitService,
    private readonly notificationService: NotificationService,
  ) {}

  createIssue(issue: GitHubIssueBody): string | null {
    return this.api.createIssue(issue);
  }

  extractIssueNumber(url: string): string | null {
    const match = url.match(/\/(\d+)$/);
    return match ? match[1] : null;
  }

  triggerWorkflow(issueNumber: string, engine: string): boolean {
    return this.api.triggerWorkflow(issueNumber, engine);
  }

  viewIssue(issueNum: string): GitHubIssue | null {
    return this.api.viewIssue(issueNum);
  }

  viewIssueSimple(issueNum: string): { state: string; title: string } | null {
    return this.api.viewIssueSimple(issueNum);
  }

  viewPr(prNum: string): GitHubServiceTypes.GitHubPR | null {
    return this.api.viewPr(prNum);
  }

  getPrChecks(
    prNumber: string,
  ): Array<{ name: string; state: string; link: string }> {
    return this.api.getPrChecks(prNumber);
  }

  getCIFailureLogs(runUrl: string): string {
    return this.api.getCIFailureLogs(runUrl);
  }

  getPrReviews(
    prNumber: string,
  ): Array<{ body: string; state: string }> {
    return this.api.getPrReviews(prNumber);
  }

  listIssues(
    label: string,
    limit: number,
  ): GitHubIssueListItem[] {
    return this.api.listIssues(label, limit);
  }

  findDuplicateIssue(
    title: string,
  ): { number: number; title: string; state: string } | null {
    return this.api.findDuplicateIssue(title);
  }

  createPR(
    issueNum: string,
    branchName: string,
    cwd?: string,
  ): { success: boolean; prUrl?: string; message: string } {
    return this.git.createPR(issueNum, branchName, cwd);
  }

  resolveConflicts(
    branchName: string,
    baseBranch: string,
    cwd?: string,
    engine: 'mimo' | 'opencode' = 'mimo',
  ): { success: boolean; message: string } {
    return this.git.resolveConflicts(branchName, baseBranch, cwd, engine);
  }

  pushBranch(
    branchName: string,
    cwd?: string,
  ): { success: boolean; message: string } {
    return this.git.pushBranch(branchName, cwd);
  }

  async implementLocally(
    issueNum: string,
    engine: string,
    cwd: string,
    data: {
      title: string;
      body: string;
      labels?: Array<{ name: string }>;
    },
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    try {
      const titleSlug = data.title
        .toLowerCase()
        .replace(/^arc-\d+:\s*/, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      const branchName = `task-${issueNum}-${titleSlug}`;

      this.cleanWorkdir(cwd);

      try {
        execFileSync('git', ['worktree', 'prune'], { encoding: 'utf-8', cwd: this.getCwd() });
      } catch {
        // ignore prune errors
      }

      const branchExists = execFileSync(
        'git', ['branch', '--list', branchName],
        { encoding: 'utf-8', cwd },
      ).trim();
      if (branchExists) {
        const aheadCount = execFileSync(
          'git', ['log', `origin/develop..${branchName}`, '--oneline'],
          { encoding: 'utf-8', cwd },
        ).trim();
        if (aheadCount) {
          return {
            success: false,
            message: `Branch ${branchName} already has commits.`,
          };
        }
      }

      execFileSync('git', ['checkout', '-B', branchName], {
        encoding: 'utf-8',
        cwd,
      });
      this.logger.log(`Created branch ${branchName} in worktree`);

      this.git.installDeps(cwd);

      const requirements = this.extractRequirements(data.body);
      const hasRealRequirements =
        requirements.length > 0 && !requirements.every((r) => r === 'TBD');

      const prompt = [
        `Implement GitHub issue #${issueNum}: ${data.title}`,
        '',
        'Requirements:',
        ...(hasRealRequirements
          ? requirements.map((r) => `- ${r}`)
          : [
              '- Determine what needs to be done based on the issue title.',
              '- Read CLAUDE.md for project conventions and architecture.',
              '- Explore the codebase to understand existing patterns.',
              '- Implement the feature following existing code style.',
            ]),
        '',
        'Follow the project conventions in CLAUDE.md.',
        'Do not add comments unless asked.',
        '',
        '## Verification',
        'After making changes, run ALL of these to verify:',
        '- `pnpm lint`',
        '- `pnpm --filter web type-check`',
        '- `pnpm --filter be build`',
        '- `pnpm --filter be test`',
        '',
        '## Rules',
        '- DO NOT load any skills or plugins — implement directly from the requirements.',
        '- DO NOT run `gh issue list` or `gh issue view`.',
        '- DO NOT create tasks or use the task/actor tools.',
        '- Max 500 lines per file.',
        '- Do not add comments unless asked.',
        '- Do NOT run `git commit`, `git add`, or `git push` under ANY circumstances.',
        '- The processor handles all git operations after you finish.',
        '- Just make code changes and run the verification commands above.',
        '- Never leave the repo in a dirty state.',
      ].join('\n');

      const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      const cli = engine === 'mimo' ? 'mimo' : 'opencode';
      if (cli === 'mimo') {
        try {
          await this.spawnAsync('mimo', ['auth', 'login', '-p', 'mimo-free'], {
            cwd,
            timeout: 30_000,
          });
        } catch {
          // ignore — token may already be valid
        }
      }
      const runArgs =
        cli === 'opencode'
          ? ['run', escapedPrompt, '-m', 'opencode/mimo-v2.5-free', '--dangerously-skip-permissions']
          : ['run', escapedPrompt, '--dangerously-skip-permissions'];
      await this.spawnAsync(cli, runArgs, {
        cwd,
        timeout: 900_000,
        env: { HUSKY: '0' },
        onTimeoutApproaching: async () => {
          await this.notificationService.publish({
            jobId: `timeout-${issueNum}`,
            issueNum,
            engine,
            success: true,
            message: `AI engine is taking longer than expected on #${issueNum}. Continue or abort?`,
            timestamp: Date.now(),
            type: 'timeout-prompt',
          });
          return this.notificationService.waitForTimeoutResponse(`timeout-${issueNum}`, 3 * 60 * 1000);
        },
      }).catch((err) => {
        this.logger.warn(`AI engine finished with error: ${(err as Error).message} — checking for partial changes`);
      });

      execFileSync('git', ['add', '-A'], { encoding: 'utf-8', cwd });

      let hasChanges = false;
      try {
        execFileSync('git', ['diff', '--cached', '--quiet'], { encoding: 'utf-8', cwd });
      } catch {
        hasChanges = true;
      }

      if (!hasChanges) {
        return { success: false, message: 'No changes to commit — the AI engine did not produce any modifications.' };
      }

      const scope = data.title.match(/ARC-\d+/)?.[0] || `task-${issueNum}`;
      const msg = data.title
        .replace(/^ARC-\d+:\s*/, '')
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 72);

      execFileSync('git', ['commit', '--no-verify', '-m', `feat(${scope}): ${msg}`], {
        encoding: 'utf-8',
        cwd,
      });

      this.logger.log(`Committed on branch ${branchName} — processor will push`);

      return { success: true, message: `Committed on ${branchName}`, branchName };
    } catch (err) {
      this.logger.error(`Implementation failed for #${issueNum}: ${(err as Error).message}`);
      return {
        success: false,
        message: `Implementation failed: ${(err as Error).message}`,
      };
    }
  }

  async fixPR(
    prNumber: string,
    engine: string,
    cwd: string,
    data: {
      branchName: string;
      failedChecks?: Array<{ name: string; state: string; link: string }>;
      reviewComments?: string;
    },
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    try {
      const { branchName, failedChecks = [], reviewComments = '' } = data;

      const promptParts: string[] = [
        `Fix all issues on PR #${prNumber} (branch: ${branchName}).`,
        '',
      ];

      if (failedChecks.length > 0) {
        promptParts.push('## CI Failures');
        for (const f of failedChecks) {
          promptParts.push(`- ${f.name}`);
        }

        const errorOutput = this.fetchErrorLogs(failedChecks);
        if (errorOutput) {
          promptParts.push('', '## Actual Error Output', '```', errorOutput, '```');
        }

        promptParts.push(
          '',
          'Fix the issues shown in the error output above.',
          '',
        );
      }

      if (reviewComments) {
        promptParts.push('## Review Comments');
        promptParts.push(reviewComments);
        promptParts.push(
          '',
          'Address all review feedback. Apply suggestions where provided.',
          '',
        );
      }

      if (failedChecks.length === 0 && !reviewComments) {
        promptParts.push('No CI failures or review comments found.');
      }

      promptParts.push(
        '## Verification',
        'After making changes, run ALL of these to verify:',
        '- `pnpm lint`',
        '- `pnpm --filter web type-check`',
        '- `pnpm --filter be build`',
        '- `pnpm --filter be test`',
        '',
        '## Rules',
        '- DO NOT load any skills or plugins.',
        '- DO NOT explore the codebase beyond what is needed to fix the error.',
        '- DO NOT run `gh issue list` or `gh issue view`.',
        '- DO NOT create tasks or use the task/actor tools.',
        '- DO NOT implement new features — only fix the specific error shown above.',
        '- Max 500 lines per file.',
        '- Do not add comments unless asked.',
        '- Do NOT run `git commit`, `git add`, or `git push` under ANY circumstances.',
        '- The processor handles all git operations after you finish.',
        '- Just make code changes and run the verification commands above.',
      );

      const prompt = promptParts.join('\n');
      const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      this.cleanWorkdir(cwd);
      execFileSync('git', ['fetch', 'origin'], { encoding: 'utf-8', cwd });
      execFileSync('git', ['checkout', '-B', branchName, `origin/${branchName}`], { encoding: 'utf-8', cwd });
      try {
        execFileSync('git', ['config', 'core.hooksPath', '/dev/null'], { encoding: 'utf-8', cwd });
      } catch {
        // ignore
      }

      this.git.installDeps(cwd);

      const cli = engine === 'mimo' ? 'mimo' : 'opencode';
      const runArgs =
        cli === 'opencode'
          ? ['run', escapedPrompt, '-m', 'opencode/mimo-v2.5-free', '--dangerously-skip-permissions']
          : ['run', escapedPrompt, '--dangerously-skip-permissions'];
      if (cli === 'mimo') {
        try {
          await this.spawnAsync('mimo', ['auth', 'login', '-p', 'mimo-free'], {
            cwd,
            timeout: 30_000,
          });
        } catch {
          // ignore — token may already be valid
        }
      }
      await this.spawnAsync(cli, runArgs, {
        cwd,
        timeout: 900_000,
        env: { HUSKY: '0' },
        onTimeoutApproaching: async () => {
          await this.notificationService.publish({
            jobId: `timeout-fix-${prNumber}`,
            issueNum: prNumber,
            engine,
            success: true,
            message: `AI engine is taking longer than expected on PR #${prNumber}. Continue or abort?`,
            timestamp: Date.now(),
            type: 'timeout-prompt',
          });
          return this.notificationService.waitForTimeoutResponse(`timeout-fix-${prNumber}`, 3 * 60 * 1000);
        },
      }).catch((err) => {
        this.logger.warn(`AI engine finished with error: ${(err as Error).message} — checking for partial changes`);
      });

      execFileSync('git', ['add', '-A'], { encoding: 'utf-8', cwd });

      let hasChanges = false;
      try {
        execFileSync('git', ['diff', '--cached', '--quiet'], { encoding: 'utf-8', cwd });
      } catch {
        hasChanges = true;
      }

      if (!hasChanges) {
        return { success: true, message: 'No changes needed' };
      }

      execFileSync('git', ['commit', '--no-verify', '-m', 'fix: resolve CI failures and review feedback'], { encoding: 'utf-8', cwd });

      this.logger.log(`Fixes committed on ${branchName} — processor will push`);

      return { success: true, message: `Fixes committed on ${branchName}`, branchName };
    } catch (err) {
      return { success: false, message: `Fix failed: ${(err as Error).message}` };
    }
  }

  async checkAndFixCI(
    prNumber: string,
    engine: 'opencode' | 'mimo',
    cwd: string,
    data: {
      branchName: string;
      failedChecks: Array<{ name: string; state: string; link: string }>;
    },
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    try {
      const { branchName, failedChecks } = data;

      const failedNames = failedChecks.map((c) => c.name).join(', ');
      const promptParts: string[] = [
        `Fix CI failures for PR #${prNumber}: ${failedNames}`,
        '',
        'CI failed checks:',
        ...failedChecks.map((c) => `- ${c.name}: ${c.link}`),
      ];

      const errorOutput = this.fetchErrorLogs(failedChecks);
      if (errorOutput) {
        promptParts.push('', '## Actual Error Output', '```', errorOutput, '```');
      }

      promptParts.push(
        '',
        'Instructions:',
        '- Fix the issues shown in the error output above.',
        '- If no error output is available, run the failing commands locally to see errors.',
        '',
        '## Verification',
        'After making changes, run ALL of these to verify:',
        '- `pnpm lint`',
        '- `pnpm --filter web type-check`',
        '- `pnpm --filter be build`',
        '- `pnpm --filter be test`',
        '',
        '## Rules',
        '- DO NOT load any skills or plugins.',
        '- DO NOT explore the codebase beyond what is needed to fix the error.',
        '- DO NOT run `gh issue list` or `gh issue view`.',
        '- DO NOT create tasks or use the task/actor tools.',
        '- DO NOT implement new features — only fix the specific error shown above.',
        '- Max 500 lines per file.',
        '- Do not add comments unless asked.',
        '- Do NOT run `git commit`, `git add`, or `git push` under ANY circumstances.',
        '- The processor handles all git operations after you finish.',
        '- Just make code changes and run the verification commands above.',
      );

      const fixPrompt = promptParts.join('\n');

      const escapedPrompt = fixPrompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      this.cleanWorkdir(cwd);
      execFileSync('git', ['fetch', 'origin'], { encoding: 'utf-8', cwd });
      execFileSync('git', ['checkout', '-B', branchName, `origin/${branchName}`], { encoding: 'utf-8', cwd });
      try {
        execFileSync('git', ['config', 'core.hooksPath', '/dev/null'], { encoding: 'utf-8', cwd });
      } catch {
        // ignore
      }

      this.git.installDeps(cwd);

      const cli = engine === 'mimo' ? 'mimo' : 'opencode';
      if (cli === 'mimo') {
        try {
          await this.spawnAsync('mimo', ['auth', 'login', '-p', 'mimo-free'], {
            cwd,
            timeout: 30_000,
          });
        } catch {
          // ignore — token may already be valid
        }
      }
      const runArgs = cli === 'opencode'
        ? ['run', escapedPrompt, '-m', 'opencode/mimo-v2.5-free', '--dangerously-skip-permissions']
        : ['run', escapedPrompt, '--dangerously-skip-permissions'];
      await this.spawnAsync(cli, runArgs, {
        cwd,
        timeout: 900_000,
        env: { HUSKY: '0' },
        onTimeoutApproaching: async () => {
          await this.notificationService.publish({
            jobId: `timeout-ci-${prNumber}`,
            issueNum: prNumber,
            engine,
            success: true,
            message: `AI engine is taking longer than expected on CI fix for PR #${prNumber}. Continue or abort?`,
            timestamp: Date.now(),
            type: 'timeout-prompt',
          });
          return this.notificationService.waitForTimeoutResponse(`timeout-ci-${prNumber}`, 3 * 60 * 1000);
        },
      }).catch((err) => {
        this.logger.warn(`AI engine finished with error: ${(err as Error).message} — checking for partial changes`);
      });

      execFileSync('git', ['add', '-A'], { encoding: 'utf-8', cwd });

      let hasChanges = false;
      try {
        execFileSync('git', ['diff', '--cached', '--quiet'], { encoding: 'utf-8', cwd });
      } catch {
        hasChanges = true;
      }

      if (!hasChanges) {
        return { success: true, message: 'No changes needed — CI failures may require manual investigation' };
      }

      execFileSync('git', ['commit', '--no-verify', '-m', 'fix: resolve CI failures'], { encoding: 'utf-8', cwd });

      this.logger.log(`CI fixes committed on ${branchName} — processor will push`);

      return { success: true, message: `Fixes committed on ${branchName}`, branchName };
    } catch (err) {
      return { success: false, message: `CI fix failed: ${(err as Error).message}` };
    }
  }

  createWorktree(jobId: string): string {
    const repoCwd = this.getCwd();
    const worktreePath = `/tmp/task-bot/${jobId}`;

    mkdirSync('/tmp/task-bot', { recursive: true });

    try {
      execFileSync('git', ['worktree', 'add', worktreePath, 'origin/develop'], {
        encoding: 'utf-8',
        cwd: repoCwd,
      });
      try {
        execFileSync('git', ['config', 'core.hooksPath', '/dev/null'], {
          encoding: 'utf-8',
          cwd: worktreePath,
        });
      } catch {
        // ignore
      }
      try {
        execFileSync('git', ['remote', 'set-url', 'origin', 'https://github.com/AnAtoliy-AA/arcadeum.git'], {
          encoding: 'utf-8',
          cwd: worktreePath,
        });
      } catch {
        // ignore
      }
      this.logger.log(`Created worktree at ${worktreePath}`);
      return worktreePath;
    } catch (err) {
      this.logger.error(`Failed to create worktree: ${(err as Error).message}`);
      throw err;
    }
  }

  removeWorktree(jobId: string): void {
    const repoCwd = this.getCwd();
    const worktreePath = `/tmp/task-bot/${jobId}`;

    try {
      execFileSync('git', ['worktree', 'remove', worktreePath, '--force'], {
        encoding: 'utf-8',
        cwd: repoCwd,
      });
      this.logger.log(`Removed worktree at ${worktreePath}`);
    } catch {
      try {
        rmSync(worktreePath, { recursive: true, force: true });
        execFileSync('git', ['worktree', 'prune'], {
          encoding: 'utf-8',
          cwd: repoCwd,
        });
        this.logger.log(`Force-removed worktree at ${worktreePath}`);
      } catch {
        // ignore — worktree may already be gone
      }
    }
  }

  verifyChanges(cwd: string): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const commands = [
      { name: 'lint', cmd: ['pnpm', 'lint'] },
      { name: 'typecheck', cmd: ['pnpm', '--filter', 'web', 'type-check'] },
      { name: 'build:be', cmd: ['pnpm', '--filter', 'be', 'build'] },
      { name: 'build:web', cmd: ['pnpm', '--filter', 'web', 'build'] },
    ];
    for (const { name, cmd } of commands) {
      try {
        this.logger.log(`Verifying: ${name}`);
        execFileSync(cmd[0], cmd.slice(1), { encoding: 'utf-8', cwd, timeout: 300_000 });
        this.logger.log(`✓ ${name} passed`);
      } catch (err) {
        const msg = (err as Error).message.slice(0, 500);
        this.logger.error(`✗ ${name} failed: ${msg}`);
        errors.push(`${name}: ${msg}`);
      }
    }
    return { ok: errors.length === 0, errors };
  }

  private getCwd(): string {
    return this.config.get<string>('REPO_PATH') ?? process.cwd();
  }

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

  private cleanWorkdir(cwd: string): void {
    try {
      execFileSync('git', ['checkout', '--', '.'], { encoding: 'utf-8', cwd });
      execFileSync('git', ['clean', '-fd'], { encoding: 'utf-8', cwd });
    } catch {
      // ignore — repo may be in a bad state
    }
  }

  private fetchErrorLogs(
    failedChecks: Array<{ name: string; state: string; link: string }>,
  ): string {
    const allLogs: string[] = [];
    for (const check of failedChecks) {
      const logs = this.getCIFailureLogs(check.link);
      if (logs) {
        allLogs.push(`--- ${check.name} ---`);
        allLogs.push(logs);
      }
    }
    return allLogs.join('\n\n').slice(0, 6000);
  }

  private extractRequirements(body: string): string[] {
    const reqSection = body.split('## Requirements')[1];
    if (!reqSection) return ['TBD'];
    return reqSection
      .split('\n')
      .filter((l) => l.startsWith('- [ ]'))
      .map((l) => l.replace(/^- \[ \]\s*/, ''));
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
          try { child.kill('SIGTERM'); } catch { /* ignore */ }
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
}