import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFileSync, spawn } from 'child_process';
import { mkdirSync, rmSync } from 'fs';

interface GitHubIssue {
  arc: string | null;
  title: string;
  priority: string;
  engine: string;
  requirements: string[];
  scope: string[];
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);

  constructor(private readonly config: ConfigService) {}

  private getCwd(): string {
    return this.config.get<string>('REPO_PATH') ?? process.cwd();
  }

  private spawnAsync(
    cmd: string,
    args: string[],
    opts: { cwd: string; timeout?: number },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        cwd: opts.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: opts.timeout,
      });
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', (d: Buffer) => (stdout += d.toString()));
      child.stderr?.on('data', (d: Buffer) => (stderr += d.toString()));
      child.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(stderr || `Exit code ${code}`));
      });
      child.on('error', reject);
    });
  }

  private cleanWorkdir(cwd: string): void {
    try {
      execFileSync('git', ['checkout', '--', '.'], { encoding: 'utf-8', cwd });
      execFileSync('git', ['clean', '-fd'], { encoding: 'utf-8', cwd });
    } catch {
      // ignore — repo may be in a bad state
    }
  }

  createWorktree(jobId: string): string {
    const repoCwd = this.getCwd();
    const worktreePath = `/tmp/task-bot/${jobId}`;

    mkdirSync('/tmp/task-bot', { recursive: true });

    try {
      execFileSync('git', ['checkout', '--detach'], {
        encoding: 'utf-8',
        cwd: repoCwd,
        stdio: 'pipe',
      });
      execFileSync('git', ['worktree', 'add', worktreePath, 'origin/develop'], {
        encoding: 'utf-8',
        cwd: repoCwd,
      });
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
      'issue', 'create',
      '--title', title,
      '--body', body,
      ...labelArgs,
    ];

    try {
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
        ['workflow', 'run', 'implement-task.yml', '--ref', 'develop', '-f', `issue_number=${issueNumber}`, '-f', `engine=${engine}`],
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

  viewIssue(issueNum: string): {
    state: string;
    title: string;
    body: string;
    comments: Array<{ body: string; createdAt: string }>;
    labels: Array<{ name: string }>;
  } | null {
    try {
      const result = execFileSync(
        'gh',
        ['issue', 'view', issueNum, '--json', 'state,title,body,comments,labels'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as {
        state: string;
        title: string;
        body: string;
        comments: Array<{ body: string; createdAt: string }>;
        labels: Array<{ name: string }>;
      };
    } catch {
      return null;
    }
  }

  viewIssueSimple(issueNum: string): { state: string; title: string } | null {
    try {
      const result = execFileSync('gh', ['issue', 'view', issueNum, '--json', 'state,title'], {
        encoding: 'utf-8',
        cwd: this.getCwd(),
      });
      return JSON.parse(result) as { state: string; title: string };
    } catch {
      return null;
    }
  }

  viewPr(prNum: string): {
    state: string;
    headRefName: string;
    statusCheckRollup: Array<{ name: string; conclusion: string | null }>;
  } | null {
    try {
      const result = execFileSync(
        'gh',
        ['pr', 'view', prNum, '--json', 'state,headRefName,statusCheckRollup'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as {
        state: string;
        headRefName: string;
        statusCheckRollup: Array<{ name: string; conclusion: string | null }>;
      };
    } catch {
      return null;
    }
  }

  getPrChecks(
    prNumber: string,
  ): Array<{ name: string; state: string; link: string }> {
    try {
      const result = execFileSync(
        'gh',
        ['pr', 'checks', prNumber, '--json', 'name,state,link'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as Array<{ name: string; state: string; link: string }>;
    } catch {
      return [];
    }
  }

  getPrReviews(
    prNumber: string,
  ): Array<{ body: string; state: string }> {
    try {
      const result = execFileSync(
        'gh',
        ['pr', 'view', prNumber, '--json', 'reviews'],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      const data = JSON.parse(result) as {
        reviews: Array<{ body: string; state: string }>;
      };
      return data.reviews ?? [];
    } catch {
      return [];
    }
  }

  listIssues(
    label: string,
    limit: number,
  ): Array<{
    number: number;
    title: string;
    state: string;
    labels: Array<{ name: string }>;
    comments: Array<{ body: string; createdAt: string }>;
  }> {
    try {
      const result = execFileSync(
        'gh',
        ['issue', 'list', '--label', label, '--json', 'number,title,state,labels,comments', '--limit', String(limit)],
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as Array<{
        number: number;
        title: string;
        state: string;
        labels: Array<{ name: string }>;
        comments: Array<{ body: string; createdAt: string }>;
      }>;
    } catch {
      return [];
    }
  }

  findDuplicateIssue(
    title: string,
  ): { number: number; title: string; state: string } | null {
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
            i.title.toLowerCase().replace(/^arc-\d+:\s*/, '') ===
            normalizedTitle,
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

  createPR(
    issueNum: string,
    branchName: string,
    cwd?: string,
  ): { success: boolean; prUrl?: string; message: string } {
    const workdir = cwd ?? this.getCwd();
    try {
      const issue = this.viewIssue(issueNum);
      if (!issue) {
        return { success: false, message: `Issue #${issueNum} not found` };
      }
      const prUrl = execFileSync(
        'gh',
        [
          'pr', 'create',
          '--title', issue.title,
          '--body', `Closes #${issueNum}`,
          '--base', 'develop',
          '--head', branchName,
        ],
        { encoding: 'utf-8', cwd: workdir },
      ).trim();

      execFileSync('gh', [
        'issue', 'comment', issueNum,
        '--body', `PR created: ${prUrl}`,
      ], { encoding: 'utf-8', cwd: workdir });

      return { success: true, prUrl, message: `PR created: ${prUrl}` };
    } catch (err) {
      return { success: false, message: `Failed to create PR: ${(err as Error).message}` };
    }
  }

  pushBranch(
    branchName: string,
    cwd?: string,
  ): { success: boolean; message: string } {
    const workdir = cwd ?? this.getCwd();
    try {
      execFileSync('git', ['push', 'origin', branchName], { encoding: 'utf-8', cwd: workdir });
      return { success: true, message: `Pushed ${branchName}` };
    } catch (err) {
      return { success: false, message: `Failed to push: ${(err as Error).message}` };
    }
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

      const branchExists = execFileSync(
        'git', ['branch', '--list', branchName],
        { encoding: 'utf-8', cwd },
      ).trim();
      if (branchExists) {
        const aheadCount = execFileSync(
          'git', ['log', `origin/develop..${branchName}`, '--oneline'],
          { encoding: 'utf-8', cwd },
        ).trim();
        if (!aheadCount) {
          execFileSync('git', ['branch', '-D', branchName], { encoding: 'utf-8', cwd });
        } else {
          return {
            success: false,
            message: `Branch ${branchName} already has commits.`,
          };
        }
      }

      execFileSync('git', ['checkout', '-b', branchName], {
        encoding: 'utf-8',
        cwd,
      });
      this.logger.log(`Created branch ${branchName} in worktree`);

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
        'CRITICAL RULES:',
        '- Run `pnpm lint` and `pnpm typecheck` when done.',
        '- If pre-commit hook fails, FIX the issues and try again.',
        '- Max 500 lines per file.',
        '- Do NOT commit or push — the processor handles git operations.',
        '- Just make code changes and run lint/typecheck.',
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
      await this.spawnAsync(cli, runArgs, { cwd, timeout: 600_000 });

      execFileSync('git', ['add', '-A'], { encoding: 'utf-8', cwd });

      let hasChanges = false;
      try {
        execFileSync('git', ['diff', '--cached', '--quiet'], { encoding: 'utf-8', cwd });
      } catch {
        hasChanges = true;
      }

      if (!hasChanges) {
        return { success: true, message: 'No changes to commit — the AI engine did not produce any modifications.' };
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
        promptParts.push(
          '',
          'Run the failing commands locally to see errors, then fix them.',
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
        promptParts.push('No CI failures or review comments found. Run `pnpm lint` and `pnpm typecheck` to verify the build is clean.');
      }

      promptParts.push(
        '## Rules',
        '- Run `pnpm lint` and `pnpm typecheck` when done.',
        '- Fix any pre-commit hook failures.',
        '- Max 500 lines per file.',
        '- Do not add comments unless asked.',
        '- Do NOT commit or push — the processor handles git operations.',
        '- Just make code changes and run lint/typecheck.',
      );

      const prompt = promptParts.join('\n');
      const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      this.cleanWorkdir(cwd);
      execFileSync('git', ['fetch', 'origin'], { encoding: 'utf-8', cwd });
      execFileSync('git', ['checkout', '-B', branchName, `origin/${branchName}`], { encoding: 'utf-8', cwd });

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
      await this.spawnAsync(cli, runArgs, { cwd, timeout: 600_000 });

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
      const fixPrompt = [
        `Fix CI failures for PR #${prNumber}: ${failedNames}`,
        '',
        'CI failed checks:',
        ...failedChecks.map((c) => `- ${c.name}: ${c.link}`),
        '',
        'Instructions:',
        '- Read the CI logs from the detailsUrl to understand what failed.',
        '- Fix the issues in the code.',
        '- Run `pnpm lint` and `pnpm typecheck` to verify.',
        '- Do NOT commit or push — the processor handles git operations.',
        '- Max 500 lines per file.',
        '- Do not add comments unless asked.',
      ].join('\n');

      const escapedPrompt = fixPrompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      this.cleanWorkdir(cwd);
      execFileSync('git', ['fetch', 'origin'], { encoding: 'utf-8', cwd });
      execFileSync('git', ['checkout', '-B', branchName, `origin/${branchName}`], { encoding: 'utf-8', cwd });

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
      await this.spawnAsync(cli, runArgs, { cwd, timeout: 600_000 });

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

  private extractRequirements(body: string): string[] {
    const reqSection = body.split('## Requirements')[1];
    if (!reqSection) return ['TBD'];
    return reqSection
      .split('\n')
      .filter((l) => l.startsWith('- [ ]'))
      .map((l) => l.replace(/^- \[ \]\s*/, ''));
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
