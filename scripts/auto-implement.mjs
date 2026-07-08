#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const STATE_DIR = join(REPO_ROOT, '.tasks/workers');
const POLL_INTERVAL = 15000;
const CI_CHECK_INTERVAL = 30000;

const WORKER_ID = process.env.WORKER_ID || '0';
const WORKER_STATE = join(STATE_DIR, `worker-${WORKER_ID}.json`);

let implementing = false;

function getState() {
  try {
    return JSON.parse(readFileSync(WORKER_STATE, 'utf-8'));
  } catch {
    return { processedIssues: [] };
  }
}

function setState(state) {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(WORKER_STATE, JSON.stringify(state, null, 2));
}

function getAllProcessedIssues() {
  const all = new Set();
  try {
    if (!existsSync(STATE_DIR)) return all;
    const files = readdirSync(STATE_DIR).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      try {
        const state = JSON.parse(readFileSync(join(STATE_DIR, f), 'utf-8'));
        for (const id of state.processedIssues) all.add(id);
      } catch {}
    }
  } catch {}
  return all;
}

function getOpenTasks() {
  try {
    const result = execSync(
      'gh issue list --label "task" --label "automated" --state open --json number,title,body --limit 10',
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    return JSON.parse(result);
  } catch (err) {
    console.error(`[Worker ${WORKER_ID}] Failed to fetch issues:`, err.message);
    return [];
  }
}

function parseIssueBody(body) {
  const arcMatch = body.match(/`(ARC-\d+)`/);
  const arc = arcMatch ? arcMatch[1] : null;

  const engineMatch = body.match(/## Engine\n\n`(\w+)`/);
  const engine = engineMatch ? engineMatch[1] : 'opencode';

  const reqSection = body.split('## Requirements')[1];
  const requirements = reqSection
    ? reqSection
        .split('\n')
        .filter((l) => l.startsWith('- [ ]'))
        .map((l) => l.replace(/^- \[ \]\s*/, ''))
    : [];

  const scopeSection = body.split('## Scope')[1];
  const scope = scopeSection
    ? scopeSection
        .split('\n')
        .filter((l) => l.startsWith('- [ ]'))
        .map((l) => l.replace(/^- \[ \]\s*/, '').toLowerCase())
    : ['web'];

  return { arc, requirements, scope, engine };
}

function checkCI(prNumber) {
  try {
    const result = execSync(
      `gh pr checks ${prNumber} --json name,state,conclusion`,
      { encoding: 'utf-8', cwd: REPO_ROOT },
    );
    const checks = JSON.parse(result);

    if (checks.length === 0) return { status: 'pending', details: 'No checks found' };

    const failed = checks.filter((c) => c.conclusion === 'failure');
    const pending = checks.filter((c) => c.state === 'in_progress' || c.state === 'queued' || c.conclusion === null);
    const passed = checks.filter((c) => c.conclusion === 'success');

    if (failed.length > 0) {
      return {
        status: 'failed',
        details: failed.map((c) => `${c.name}: ${c.conclusion}`).join(', '),
      };
    }
    if (pending.length > 0) {
      return {
        status: 'pending',
        details: `${passed.length}/${checks.length} passed. Waiting for: ${pending.map((c) => c.name).join(', ')}`,
      };
    }
    return { status: 'passed', details: `${passed.length}/${checks.length} checks passed` };
  } catch (err) {
    return { status: 'error', details: err.message };
  }
}

function implementIssue(issue) {
  const parsed = parseIssueBody(issue.body);
  const titleClean = issue.title
    .replace(/^ARC-\d+:\s*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const branchName = parsed.arc
    ? `${parsed.arc.toLowerCase()}-${titleClean}`
    : `task-${issue.number}-${titleClean}`;

  console.log(`[Worker ${WORKER_ID}] === Implementing #${issue.number}: ${issue.title} (${parsed.engine}) ===`);
  console.log(`[Worker ${WORKER_ID}] Branch: ${branchName}`);

  try {
    execSync('git fetch origin', { cwd: REPO_ROOT, stdio: 'pipe' });

    try {
      execSync(`git branch -D ${branchName}`, { cwd: REPO_ROOT, stdio: 'pipe' });
    } catch {}

    execSync(`git checkout -b ${branchName} origin/develop`, {
      cwd: REPO_ROOT, stdio: 'pipe',
    });

    const prompt = [
      `Implement GitHub issue #${issue.number}: ${issue.title}`,
      '',
      'Requirements:',
      ...parsed.requirements.map((r) => `- ${r}`),
      '',
      'Follow the project conventions in CLAUDE.md.',
      'Do not add comments unless asked.',
      'Run pnpm lint and pnpm typecheck when done.',
      'Commit with conventional commits when complete.',
    ].join('\n');

    if (parsed.engine === 'mimo') {
      execSync(`mimo run "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        timeout: 30 * 60 * 1000,
      });
    } else {
      execSync(`opencode run "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        timeout: 30 * 60 * 1000,
      });

      const reviewPrompt = [
        `Review the implementation of issue #${issue.number}: ${issue.title}`,
        '',
        'Check:',
        '- Code quality and correctness',
        '- TypeScript types (no `any`)',
        '- i18n keys added',
        '- Loading/error/empty states handled',
        '- Lint and typecheck pass',
        '',
        'Fix any issues found. Run pnpm lint and pnpm typecheck.',
      ].join('\n');

      console.log(`[Worker ${WORKER_ID}] Running mimo review...`);
      execSync(`mimo run "${reviewPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        timeout: 15 * 60 * 1000,
      });
    }

    execSync('git add -A', { cwd: REPO_ROOT, stdio: 'pipe' });

    const scope = parsed.arc || `task-${issue.number}`;
    const msg = issue.title
      .replace(/^ARC-\d+:\s*/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    execSync(`git commit -m "feat(${scope}): ${msg}"`, {
      cwd: REPO_ROOT, stdio: 'pipe',
    });

    execSync(`git push origin ${branchName}`, {
      cwd: REPO_ROOT, stdio: 'pipe',
    });

    const prTitle = `${parsed.arc || `Task #${issue.number}`}: ${issue.title.replace(/^ARC-\d+:\s*/, '')}`;
    const prUrl = execSync(
      `gh pr create --title "${prTitle.replace(/"/g, '\\"')}" --body "Closes #${issue.number}" --base develop --head ${branchName}`,
      { cwd: REPO_ROOT, encoding: 'utf-8' },
    ).trim();

    const prNumber = prUrl.match(/\/(\d+)$/)?.[1];
    console.log(`[Worker ${WORKER_ID}] PR created: ${prUrl}`);

    execSync(
      `gh issue comment ${issue.number} --body "Worker ${WORKER_ID} implementation complete (${parsed.engine}). PR: ${prUrl}"`,
      { cwd: REPO_ROOT, stdio: 'pipe' },
    );

    return { success: true, prUrl, prNumber };
  } catch (err) {
    console.error(`[Worker ${WORKER_ID}] Implementation failed: ${err.message}`);
    try {
      execSync(
        `gh issue comment ${issue.number} --body "Worker ${WORKER_ID} failed: ${err.message.slice(0, 500)}"`,
        { cwd: REPO_ROOT, stdio: 'pipe' },
      );
    } catch {}
    return { success: false, error: err.message };
  }
}

function waitForCI(prNumber, issueNumber) {
  console.log(`[Worker ${WORKER_ID}] Waiting for CI on PR #${prNumber}...`);

  const maxWait = 30 * 60 * 1000; // 30 min max
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const ci = checkCI(prNumber);

    if (ci.status === 'passed') {
      console.log(`[Worker ${WORKER_ID}] CI passed for PR #${prNumber}`);
      execSync(
        `gh issue comment ${issueNumber} --body "Worker ${WORKER_ID}: CI passed for PR #${prNumber}"`,
        { cwd: REPO_ROOT, stdio: 'pipe' },
      );
      return true;
    }

    if (ci.status === 'failed') {
      console.log(`[Worker ${WORKER_ID}] CI failed for PR #${prNumber}: ${ci.details}`);
      execSync(
        `gh issue comment ${issueNumber} --body "Worker ${WORKER_ID}: CI failed for PR #${prNumber}. ${ci.details}"`,
        { cwd: REPO_ROOT, stdio: 'pipe' },
      );
      return false;
    }

    console.log(`[Worker ${WORKER_ID}] CI pending: ${ci.details}`);
    execSync(`sleep 30`, { stdio: 'pipe' });
  }

  console.log(`[Worker ${WORKER_ID}] CI timeout for PR #${prNumber}`);
  execSync(
    `gh issue comment ${issueNumber} --body "Worker ${WORKER_ID}: CI check timed out for PR #${prNumber}"`,
    { cwd: REPO_ROOT, stdio: 'pipe' },
  );
  return false;
}

async function processNextTask() {
  const state = getState();
  const allProcessed = getAllProcessedIssues();
  const tasks = getOpenTasks();

  for (const task of tasks) {
    if (allProcessed.has(task.number)) continue;

    implementing = true;

    const result = implementIssue(task);

    if (result.success && result.prNumber) {
      waitForCI(result.prNumber, task.number);
    }

    state.processedIssues.push(task.number);
    setState(state);

    implementing = false;
    return true; // processed one task
  }

  return false; // no tasks available
}

async function run() {
  console.log(`[Worker ${WORKER_ID}] Auto-implement worker started. Running continuously...`);

  while (true) {
    if (!implementing) {
      const processed = await processNextTask();
      if (!processed) {
        console.log(`[Worker ${WORKER_ID}] No tasks available. Waiting 15s...`);
      }
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

run();
