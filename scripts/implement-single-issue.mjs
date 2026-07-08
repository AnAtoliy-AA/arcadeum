#!/usr/bin/env node

import { execSync } from 'child_process';

const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const ISSUE_TITLE = process.env.ISSUE_TITLE;
const ENGINE = process.env.ENGINE || 'opencode';

if (!ISSUE_NUMBER || !ISSUE_TITLE) {
  console.error('ISSUE_NUMBER and ISSUE_TITLE environment variables are required');
  process.exit(1);
}

function parseIssueBody(body) {
  const arcMatch = body.match(/`(ARC-\d+)`/);
  const arc = arcMatch ? arcMatch[1] : null;

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

  return { arc, requirements, scope };
}

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
}

try {
  const result = execSync(
    `gh issue view ${ISSUE_NUMBER} --json body`,
    { encoding: 'utf-8' },
  );
  const { body } = JSON.parse(result);
  const parsed = parseIssueBody(body);

  const prompt = [
    `Implement GitHub issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}`,
    '',
    'Requirements:',
    ...parsed.requirements.map((r) => `- ${r}`),
    '',
    'Follow the project conventions in CLAUDE.md.',
    'Do not add comments unless asked.',
    'Run pnpm lint and pnpm typecheck when done.',
    'Commit with conventional commits when complete.',
  ].join('\n');

  const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');

  if (ENGINE === 'mimo') {
    run(`mimo run "${escapedPrompt}"`);
  } else {
    run(`opencode run "${escapedPrompt}"`);

    const reviewPrompt = [
      `Review the implementation of issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}`,
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

    const escapedReview = reviewPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    console.log('Running review...');
    run(`mimo run "${escapedReview}"`);
  }
