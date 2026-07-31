import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFileSync } from 'child_process';

import { GitHubService as GitHubServiceTypes } from './github.types';

@Injectable()
export class GitHubGitService {
  private readonly logger = new Logger(GitHubGitService.name);

  constructor(private readonly config: ConfigService) {}

  private getCwd(): string {
    return this.config.get<string>('REPO_PATH') ?? process.cwd();
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
      this.throttleGitHub();
      const prUrl = execFileSync(
        'gh',
        [
          'pr',
          'create',
          '--title',
          issue.title,
          '--body',
          `Closes #${issueNum}`,
          '--base',
          'develop',
          '--head',
          branchName,
        ],
        { encoding: 'utf-8', cwd: workdir },
      ).trim();

      execFileSync(
        'gh',
        [
          'issue',
          'comment',
          issueNum,
          '--body',
          `PR created: ${prUrl}`,
        ],
        { encoding: 'utf-8', cwd: workdir },
      );

      return { success: true, prUrl, message: `PR created: ${prUrl}` };
    } catch (err) {
      return { success: false, message: `Failed to create PR: ${(err as Error).message}` };
    }
  }

  resolveConflicts(
    branchName: string,
    baseBranch: string,
    cwd?: string,
    engine: 'mimo' | 'opencode' = 'mimo',
  ): { success: boolean; message: string } {
    const workdir = cwd ?? this.getCwd();
    try {
      execFileSync('git', ['fetch', 'origin', baseBranch], { encoding: 'utf-8', cwd: workdir, timeout: 30_000 });
      try {
        execFileSync('git', ['merge', `origin/${baseBranch}`, '--no-edit'], { encoding: 'utf-8', cwd: workdir, timeout: 30_000 });
        this.logger.log(`Merged ${baseBranch} into ${branchName} cleanly`);
        return { success: true, message: 'Merged cleanly' };
      } catch {
        this.logger.log(`Merge conflict detected, getting conflicted files`);
        const conflictedFiles = this.getConflictedFiles(workdir);
        if (conflictedFiles.length === 0) {
          try { execFileSync('git', ['merge', '--abort'], { encoding: 'utf-8', cwd: workdir }); } catch { /* ignore */ }
          return { success: true, message: 'No conflicts after all' };
        }

        this.logger.log(`Conflicted files: ${conflictedFiles.join(', ')}`);
        const resolution = this.resolveWithAI(conflictedFiles, workdir, engine);

        if (resolution) {
          execFileSync('git', ['add', ...conflictedFiles], { encoding: 'utf-8', cwd: workdir });
          execFileSync('git', ['commit', '--no-verify', '-m', 'merge: resolve conflicts with AI'], { encoding: 'utf-8', cwd: workdir });
          this.logger.log(`Conflicts resolved by AI`);
          return { success: true, message: 'Resolved by AI' };
        }

        try { execFileSync('git', ['merge', '--abort'], { encoding: 'utf-8', cwd: workdir }); } catch { /* ignore */ }
        return { success: false, message: 'AI could not resolve conflicts' };
      }
    } catch (err) {
      return { success: false, message: `Conflict resolution failed: ${(err as Error).message}` };
    }
  }

  private getConflictedFiles(cwd: string): string[] {
    try {
      const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], { encoding: 'utf-8', cwd });
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  private resolveWithAI(files: string[], cwd: string, engine: 'mimo' | 'opencode'): boolean {
    try {
      const conflicts = files.map((f) => {
        try {
          const content = execFileSync('git', ['show', `:${f}`], { encoding: 'utf-8', cwd });
          return `--- ${f}\n${content}`;
        } catch {
          return `--- ${f}\n(unable to read)`;
        }
      }).join('\n\n');

      const prompt = [
        'Resolve the merge conflicts in these files.',
        'Keep the correct code from both sides. Do not remove functionality.',
        '',
        'Conflicted files:',
        ...files.map((f) => `- ${f}`),
        '',
        'Conflict content:',
        '```',
        conflicts,
        '```',
        '',
        'For each file, write the resolved version using Edit tool.',
        'After resolving all files, run `pnpm --filter web type-check` to verify.',
        'Do NOT commit or push — the processor handles git operations.',
      ].join('\n');

      const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      const cli = engine === 'mimo' ? 'mimo' : 'opencode';
      const runArgs = cli === 'opencode'
        ? ['run', escapedPrompt, '-m', 'opencode/mimo-v2.5-free', '--dangerously-skip-permissions']
        : ['run', escapedPrompt, '--dangerously-skip-permissions'];

      if (cli === 'mimo') {
        try {
          execFileSync('mimo', ['auth', 'login', '-p', 'mimo-free'], { cwd, timeout: 30_000, encoding: 'utf-8' });
        } catch { /* ignore */ }
      }
      execFileSync(cli, runArgs, { cwd, timeout: 120_000, env: { ...process.env, HUSKY: '0' } });
      return true;
    } catch (err) {
      this.logger.error(`AI conflict resolution failed: ${(err as Error).message}`);
      return false;
    }
  }

  pushBranch(
    branchName: string,
    cwd?: string,
  ): { success: boolean; message: string } {
    const workdir = cwd ?? this.getCwd();
    try {
      try {
        execFileSync('git', ['remote', 'set-url', 'origin', 'https://github.com/AnAtoliy-AA/arcadeum.git'], { encoding: 'utf-8', cwd: workdir });
      } catch {
        // ignore
      }

      const credHelper = '!/usr/bin/gh auth git-credential';
      const maxRetries = 2;
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          execFileSync('git', [
            '-c', `credential.helper=${credHelper}`,
            'push', 'origin', branchName, '--no-verify',
          ], { encoding: 'utf-8', cwd: workdir, timeout: 60_000 });
          this.logger.log(`Pushed ${branchName} (attempt ${attempt})`);
          return { success: true, message: `Pushed ${branchName}` };
        } catch (err) {
          lastError = err as Error;
          this.logger.warn(`git push attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
          if (attempt < maxRetries) {
            execFileSync('git', ['credential', 'reject'], {
              input: 'protocol=https\nhost=github.com\n',
              encoding: 'utf-8',
              cwd: workdir,
              timeout: 5_000,
            });
          }
        }
      }
      return { success: false, message: `Failed to push after ${maxRetries} attempts: ${lastError!.message}` };
    } catch (err) {
      return { success: false, message: `Failed to push: ${(err as Error).message}` };
    }
  }

  installDeps(cwd: string): void {
    try {
      this.logger.log(`Installing dependencies in ${cwd}`);
      execFileSync('pnpm', ['install', '--frozen-lockfile'], {
        encoding: 'utf-8',
        cwd,
        timeout: 180_000,
      });
      this.logger.log(`Dependencies installed in ${cwd}`);
    } catch {
      try {
        this.logger.log(`Frozen lockfile install failed, trying without --frozen-lockfile`);
        execFileSync('pnpm', ['install'], {
          encoding: 'utf-8',
          cwd,
          timeout: 180_000,
        });
        this.logger.log(`Dependencies installed (no frozen lockfile) in ${cwd}`);
      } catch (err) {
        this.logger.warn(`Failed to install deps: ${(err as Error).message}`);
      }
    }
  }

  private viewIssue(issueNum: string): { title: string } | null {
    try {
      const result = execFileSync('gh', ['issue', 'view', issueNum, '--json', 'title'], {
        encoding: 'utf-8',
        cwd: this.getCwd(),
      });
      return JSON.parse(result) as { title: string };
    } catch {
      return null;
    }
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
}