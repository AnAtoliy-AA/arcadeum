import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync, execFileSync } from 'child_process';

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

    const args = ['issue', 'create', '--title', title, '--body', body];
    for (const label of labels) {
      args.push('--label', label);
    }

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

  findDuplicateIssue(title: string): { number: number; title: string; state: string } | null {
    try {
      const result = execSync(
        `gh issue list --state all --json number,title,state --limit 100`,
        { encoding: 'utf-8', cwd: this.getCwd() },
      );
      const issues = JSON.parse(result) as Array<{ number: number; title: string; state: string }>;
      const normalizedTitle = title.toLowerCase().replace(/^arc-\d+:\s*/, '');
      return issues.find(
        (i) => i.title.toLowerCase().replace(/^arc-\d+:\s*/, '') === normalizedTitle,
      ) ?? null;
    } catch {
      return null;
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
