import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';

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

    const labelArgs = labels.map((l) => `--label "${l}"`).join(' ');
    const cmd = `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" ${labelArgs}`;

    try {
      const result = execSync(cmd, {
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
      execSync(
        `gh workflow run implement-task.yml --ref develop -f issue_number=${issueNumber} -f engine=${engine}`,
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
      const result = execSync(
        `gh issue view ${issueNum} --json state,title,body,comments,labels`,
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
      const result = execSync(`gh issue view ${issueNum} --json state,title`, {
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
    statusCheckRollup: Array<{ name: string; conclusion: string | null }>;
  } | null {
    try {
      const result = execSync(
        `gh pr view ${prNum} --json state,statusCheckRollup`,
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      return JSON.parse(result) as {
        state: string;
        statusCheckRollup: Array<{ name: string; conclusion: string | null }>;
      };
    } catch {
      return null;
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
      const result = execSync(
        `gh issue list --label "${label}" --json number,title,state,labels,comments --limit ${limit}`,
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
      const result = execSync(
        `gh issue list --state all --json number,title,state --limit 100`,
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
      const result = execSync(`gh label list --json name --limit 100`, {
        encoding: 'utf-8',
        cwd: this.getCwd(),
      });
      const labels = JSON.parse(result) as Array<{ name: string }>;
      return labels.map((l) => l.name);
    } catch {
      return [];
    }
  }

  implementLocally(
    issueNum: string,
    engine: string,
  ): { success: boolean; message: string } {
    try {
      const issue = this.viewIssue(issueNum);
      if (!issue) {
        return { success: false, message: `Issue #${issueNum} not found` };
      }
      if (issue.state !== 'OPEN') {
        return {
          success: false,
          message: `Issue #${issueNum} is ${issue.state.toLowerCase()}`,
        };
      }

      const titleSlug = issue.title
        .toLowerCase()
        .replace(/^arc-\d+:\s*/, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      const branchName = `task-${issueNum}-${titleSlug}`;

      const cwd = this.getCwd();

      execSync('git fetch origin', { encoding: 'utf-8', cwd });
      try {
        execSync(`git branch -D ${branchName}`, { encoding: 'utf-8', cwd });
      } catch {
        // branch didn't exist locally
      }
      try {
        execSync(`git push origin --delete ${branchName}`, {
          encoding: 'utf-8',
          cwd,
          stdio: 'pipe',
        });
      } catch {
        // branch didn't exist on remote
      }
      execSync(`git checkout -b ${branchName} origin/develop`, {
        encoding: 'utf-8',
        cwd,
      });

      const prompt = [
        `Implement GitHub issue #${issueNum}: ${issue.title}`,
        '',
        'Requirements:',
        ...this.extractRequirements(issue.body).map((r) => `- ${r}`),
        '',
        'Follow the project conventions in CLAUDE.md.',
        'Do not add comments unless asked.',
        'Run pnpm lint and pnpm typecheck when done.',
        'Commit with conventional commits when complete.',
      ].join('\n');

      const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');

      const cli = engine === 'mimo' ? 'mimo' : 'opencode';
      execSync(`${cli} run "${escapedPrompt}"`, {
        encoding: 'utf-8',
        cwd,
        timeout: 600_000,
      });

      execSync('git add -A', { encoding: 'utf-8', cwd });

      const diffCheck = execSync('git diff --cached --quiet; echo $?', {
        encoding: 'utf-8',
        cwd,
      }).trim();

      if (diffCheck === '0') {
        execSync(`git checkout main`, { encoding: 'utf-8', cwd });
        execSync(`git branch -D ${branchName}`, { encoding: 'utf-8', cwd });
        return { success: true, message: 'No changes to commit' };
      }

      const scope = issue.title.match(/ARC-\d+/)?.[0] || `task-${issueNum}`;
      const msg = issue.title
        .replace(/^ARC-\d+:\s*/, '')
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 72);

      execSync(`git commit -m "feat(${scope}): ${msg}"`, {
        encoding: 'utf-8',
        cwd,
      });
      execSync(`git push origin ${branchName}`, { encoding: 'utf-8', cwd });

      const prUrl = execSync(
        `gh pr create --title "${issue.title}" --body "Closes #${issueNum}" --base develop --head ${branchName}`,
        { encoding: 'utf-8', cwd },
      ).trim();

      execSync(
        `gh issue comment ${issueNum} --body "Implementation complete (${engine}). PR: ${prUrl}"`,
        { encoding: 'utf-8', cwd },
      );

      const existingLabels = this.listLabels();
      if (!existingLabels.includes('in-review')) {
        try {
          execSync(
            `gh label create "in-review" --color "D4C5F9" --description "Ready for review"`,
            { encoding: 'utf-8', cwd },
          );
        } catch {
          // label may already exist
        }
      }
      try {
        execSync(
          `gh issue edit ${issueNum} --add-label "in-review"`,
          { encoding: 'utf-8', cwd },
        );
      } catch {
        // ignore if label add fails
      }

      return { success: true, message: `PR created: ${prUrl}` };
    } catch (err) {
      const cwd = this.getCwd();
      try {
        execSync('git checkout main', { encoding: 'utf-8', cwd });
      } catch {
        // cleanup: ignore if checkout fails
      }
      try {
        execSync(`git branch -D task-${issueNum}-*`, {
          encoding: 'utf-8',
          cwd,
        });
      } catch {
        // cleanup: ignore if branch deletion fails
      }
      return {
        success: false,
        message: `Implementation failed: ${(err as Error).message}`,
      };
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
