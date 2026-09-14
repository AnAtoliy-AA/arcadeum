#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REQUIRED_LOCALES = ['en', 'es', 'fr', 'ru', 'by'];

const GAME_POST_SLUGS = [
  'how-to-play-chess',
  'how-to-play-backgammon',
  'how-to-play-go',
  'how-to-play-checkers',
  'how-to-play-sea-battle',
  'sea-battle-best-strategies-and-placements',
  'how-to-play-hearts',
  'how-to-play-spades',
  'how-to-play-solitaire',
  'how-to-play-minesweeper',
  'how-to-play-sudoku',
  'how-to-win-2048',
  'how-to-win-tic-tac-toe',
  'how-to-play-critical',
  'how-to-play-cascade',
  'how-to-play-glimworm',
  'how-to-play-cat-dash',
  'how-to-play-pachisi',
];

function auditGuides() {
  const root = process.cwd();
  const postsDir = path.join(root, 'apps/web/src/features/blog/posts');
  const registryFile = path.join(
    root,
    'apps/web/src/features/blog/registry.ts',
  );

  const registryContent = fs.readFileSync(registryFile, 'utf8');

  console.log('\n📚 Arcadeum Games Strategy Guide Auditor (Agent 3)');
  console.log('='.repeat(96));
  console.log(
    'Slug'.padEnd(42) + 'Coverage'.padEnd(14) + 'Status'.padEnd(12) + 'Details',
  );
  console.log('-'.repeat(96));

  let totalGaps = 0;

  for (const slug of GAME_POST_SLUGS) {
    const slugDir = path.join(postsDir, slug);
    if (!fs.existsSync(slugDir)) {
      console.log(
        slug.padEnd(42) +
          '0/5'.padEnd(14) +
          '❌ MISSING'.padEnd(12) +
          'Directory not found',
      );
      totalGaps++;
      continue;
    }

    const presentLocales = [];
    const missingLocales = [];

    for (const loc of REQUIRED_LOCALES) {
      const file = path.join(slugDir, `${loc}.ts`);
      if (fs.existsSync(file)) {
        presentLocales.push(loc);
      } else {
        missingLocales.push(loc);
      }
    }

    const isRegistered = registryContent.includes(`'${slug}'`);
    const hasAllLocales = missingLocales.length === 0;

    let status = '✅ PASS';
    let details = 'All 5 locales present & registered';

    if (!hasAllLocales || !isRegistered) {
      status = '❌ FAIL';
      totalGaps++;
      if (!hasAllLocales && !isRegistered) {
        details = `Missing: [${missingLocales.join(', ')}], not registered in registry.ts`;
      } else if (!hasAllLocales) {
        details = `Missing: [${missingLocales.join(', ')}]`;
      } else {
        details = 'Not registered in registry.ts';
      }
    }

    const coverageStr = `${presentLocales.length}/${REQUIRED_LOCALES.length}`;
    console.log(
      slug.padEnd(42) + coverageStr.padEnd(14) + status.padEnd(12) + details,
    );
  }

  console.log('='.repeat(96));

  if (totalGaps === 0) {
    console.log(
      `\n✅ All ${GAME_POST_SLUGS.length} strategy guides have 100% 5-locale coverage and are registered!\n`,
    );
    return true;
  }

  console.error(
    `\n❌ Found ${totalGaps} strategy guide coverage gap(s). Please review above.\n`,
  );
  return false;
}

const success = auditGuides();
process.exit(success ? 0 : 1);
